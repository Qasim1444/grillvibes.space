<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('roles')) {
            DB::table('roles')->updateOrInsert(
                ['slug' => 'rider'],
                [
                    'name' => 'Rider',
                    'description' => 'Delivery rider mobile app access',
                    'is_locked' => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'vehicle_type')) {
                $table->string('vehicle_type', 50)->nullable()->after('address');
            }

            if (! Schema::hasColumn('users', 'vehicle_number')) {
                $table->string('vehicle_number', 50)->nullable()->after('vehicle_type');
            }

            if (! Schema::hasColumn('users', 'is_available')) {
                $table->boolean('is_available')->default(true)->after('vehicle_number');
            }

            if (! Schema::hasColumn('users', 'last_lat')) {
                $table->decimal('last_lat', 10, 7)->nullable()->after('is_available');
            }

            if (! Schema::hasColumn('users', 'last_lng')) {
                $table->decimal('last_lng', 10, 7)->nullable()->after('last_lat');
            }

            if (! Schema::hasColumn('users', 'last_location_at')) {
                $table->timestamp('last_location_at')->nullable()->after('last_lng');
            }
        });

        Schema::table('orders', function (Blueprint $table) {
            if (! Schema::hasColumn('orders', 'rider_id')) {
                $table->foreignId('rider_id')->nullable()->after('customer_id')->constrained('users')->nullOnDelete();
            }

            if (! Schema::hasColumn('orders', 'delivery_status')) {
                $table->string('delivery_status', 30)->default('unassigned')->after('status');
                $table->index(['rider_id', 'delivery_status']);
            }

            if (! Schema::hasColumn('orders', 'assigned_at')) {
                $table->timestamp('assigned_at')->nullable()->after('delivery_status');
            }

            if (! Schema::hasColumn('orders', 'accepted_at')) {
                $table->timestamp('accepted_at')->nullable()->after('assigned_at');
            }

            if (! Schema::hasColumn('orders', 'picked_up_at')) {
                $table->timestamp('picked_up_at')->nullable()->after('accepted_at');
            }

            if (! Schema::hasColumn('orders', 'on_way_at')) {
                $table->timestamp('on_way_at')->nullable()->after('picked_up_at');
            }

            if (! Schema::hasColumn('orders', 'delivered_at')) {
                $table->timestamp('delivered_at')->nullable()->after('on_way_at');
            }

            if (! Schema::hasColumn('orders', 'delivery_notes')) {
                $table->text('delivery_notes')->nullable()->after('delivered_at');
            }

            if (! Schema::hasColumn('orders', 'delivery_rejection_reason')) {
                $table->text('delivery_rejection_reason')->nullable()->after('delivery_notes');
            }

            if (! Schema::hasColumn('orders', 'delivery_proof_path')) {
                $table->string('delivery_proof_path')->nullable()->after('delivery_rejection_reason');
            }

            if (! Schema::hasColumn('orders', 'cash_collected')) {
                $table->decimal('cash_collected', 10, 2)->nullable()->after('delivery_proof_path');
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'delivery_status')) {
                $table->dropIndex(['rider_id', 'delivery_status']);
            }

            $table->dropConstrainedForeignId('rider_id');
            $table->dropColumn([
                'delivery_status',
                'assigned_at',
                'accepted_at',
                'picked_up_at',
                'on_way_at',
                'delivered_at',
                'delivery_notes',
                'delivery_rejection_reason',
                'delivery_proof_path',
                'cash_collected',
            ]);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'vehicle_type',
                'vehicle_number',
                'is_available',
                'last_lat',
                'last_lng',
                'last_location_at',
            ]);
        });
    }
};
