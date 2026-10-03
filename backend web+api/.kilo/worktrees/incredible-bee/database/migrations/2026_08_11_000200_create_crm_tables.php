<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * CRM: loyalty points, promo codes, discount campaigns and feedback, plus the
 * columns that link a checkout's results back onto the order.
 *
 * `loyalty_transactions` is an append-only ledger — every earn/redeem/adjust
 * writes a row carrying the resulting balance, and `customers.loyalty_points_balance`
 * is a denormalised cache of the latest `balance_after` so the POS can read a
 * balance without summing the ledger.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('loyalty_settings')) {
            Schema::create('loyalty_settings', function (Blueprint $table) {
                $table->id();
                $table->boolean('is_active')->default(false);
                // Points granted per 1 currency unit spent.
                $table->decimal('points_per_currency', 8, 4)->default(1);
                // Currency value of 1 point when redeeming.
                $table->decimal('currency_per_point', 8, 4)->default(1);
                $table->unsignedInteger('min_redeem_points')->default(100);
                // Ceiling on how much of a bill points may cover.
                $table->unsignedTinyInteger('max_redeem_percent')->default(50);
                // 0 = never expires.
                $table->unsignedSmallInteger('points_expiry_days')->default(0);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('loyalty_transactions')) {
            Schema::create('loyalty_transactions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
                $table->unsignedBigInteger('order_id')->nullable();
                // earn | redeem | adjust | expire
                $table->string('type', 20);
                // Signed: positive earns/adjustments up, negative redemptions.
                $table->integer('points');
                // Balance after this row was applied — the ledger is never mutated,
                // so this is the audit trail for the cached customer balance.
                $table->integer('balance_after')->default(0);
                // Only meaningful on a positive row: how much of that credit is
                // still unspent. Redemptions consume the oldest lots first, which
                // is what makes `points_expiry_days` enforceable.
                $table->unsignedInteger('points_remaining')->default(0);
                $table->string('note')->nullable();
                $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                $table->date('expires_at')->nullable();
                $table->timestamps();

                $table->index(['customer_id', 'id']);
                $table->index('order_id');
            });
        }

        if (! Schema::hasTable('promo_codes')) {
            Schema::create('promo_codes', function (Blueprint $table) {
                $table->id();
                $table->string('code', 50)->unique();
                $table->string('description')->nullable();
                // fixed | percentage
                $table->string('type', 20)->default('fixed');
                $table->decimal('value', 10, 2)->default(0);
                // Caps a percentage code's payout; null = uncapped.
                $table->decimal('max_discount', 10, 2)->nullable();
                $table->decimal('min_order_amount', 10, 2)->default(0);
                $table->date('starts_at')->nullable();
                $table->date('ends_at')->nullable();
                // null = unlimited.
                $table->unsignedInteger('usage_limit')->nullable();
                $table->unsignedInteger('usage_limit_per_customer')->nullable();
                $table->unsignedInteger('used_count')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();

                $table->index('is_active');
            });
        }

        if (! Schema::hasTable('promo_redemptions')) {
            Schema::create('promo_redemptions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('promo_code_id')->constrained()->cascadeOnDelete();
                $table->unsignedBigInteger('order_id')->nullable();
                $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
                $table->decimal('discount_amount', 10, 2)->default(0);
                $table->timestamps();

                $table->index(['promo_code_id', 'customer_id']);
                $table->index('order_id');
            });
        }

        if (! Schema::hasTable('discount_campaigns')) {
            Schema::create('discount_campaigns', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                // fixed | percentage
                $table->string('type', 20)->default('percentage');
                $table->decimal('value', 10, 2)->default(0);
                $table->decimal('max_discount', 10, 2)->nullable();
                $table->decimal('min_order_amount', 10, 2)->default(0);
                // all | category | item
                $table->string('applies_to', 20)->default('all');
                // Food category or item ids when `applies_to` narrows the scope.
                $table->json('target_ids')->nullable();
                // Empty/null = every order type.
                $table->json('order_types')->nullable();
                $table->date('starts_at')->nullable();
                $table->date('ends_at')->nullable();
                $table->boolean('is_active')->default(true);
                // Higher wins when several campaigns match one order.
                $table->unsignedSmallInteger('priority')->default(0);
                $table->timestamps();

                $table->index(['is_active', 'priority']);
            });
        }

        if (! Schema::hasTable('feedbacks')) {
            Schema::create('feedbacks', function (Blueprint $table) {
                $table->id();
                $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
                $table->unsignedBigInteger('order_id')->nullable();
                $table->unsignedTinyInteger('rating')->default(5);
                $table->text('comment')->nullable();
                $table->text('reply')->nullable();
                $table->foreignId('replied_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('replied_at')->nullable();
                // Only published feedback is safe to show outside the admin.
                $table->boolean('is_published')->default(false);
                $table->timestamps();

                $table->index('rating');
                $table->index('order_id');
            });
        }

        Schema::table('orders', function (Blueprint $table) {
            if (! Schema::hasColumn('orders', 'promo_code_id')) {
                $table->unsignedBigInteger('promo_code_id')->nullable()->after('discount_amount');
                $table->index('promo_code_id');
            }
            if (! Schema::hasColumn('orders', 'promo_discount')) {
                $table->decimal('promo_discount', 10, 2)->default(0)->after('promo_code_id');
            }
            if (! Schema::hasColumn('orders', 'loyalty_points_redeemed')) {
                $table->unsignedInteger('loyalty_points_redeemed')->default(0)->after('promo_discount');
            }
            if (! Schema::hasColumn('orders', 'loyalty_discount')) {
                $table->decimal('loyalty_discount', 10, 2)->default(0)->after('loyalty_points_redeemed');
            }
            if (! Schema::hasColumn('orders', 'loyalty_points_earned')) {
                // Stamped when the order is paid, so re-saving can't double-earn.
                $table->unsignedInteger('loyalty_points_earned')->default(0)->after('loyalty_discount');
            }
        });

        Schema::table('customers', function (Blueprint $table) {
            if (! Schema::hasColumn('customers', 'loyalty_points_balance')) {
                $table->integer('loyalty_points_balance')->default(0)->after('date_of_birth');
            }
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn('loyalty_points_balance');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'promo_code_id', 'promo_discount', 'loyalty_points_redeemed',
                'loyalty_discount', 'loyalty_points_earned',
            ]);
        });

        Schema::dropIfExists('feedbacks');
        Schema::dropIfExists('discount_campaigns');
        Schema::dropIfExists('promo_redemptions');
        Schema::dropIfExists('promo_codes');
        Schema::dropIfExists('loyalty_transactions');
        Schema::dropIfExists('loyalty_settings');
    }
};
