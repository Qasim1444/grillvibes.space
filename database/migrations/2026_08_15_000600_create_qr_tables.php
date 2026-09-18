<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * QR-code dine-in ordering:
 *
 *  qr_codes      → one QR per table (or per zone). Stores the signed token
 *                  that ties a scan to a specific place + table.
 *  qr_sessions   → tracks an active guest ordering session (cart + metadata)
 *                  so the guest can build a cart over multiple page views.
 */
return new class extends Migration
{
    public function up(): void
    {
        // ── QR Codes ──────────────────────────────────────────────────────────
        if (! Schema::hasTable('qr_codes')) {
            Schema::create('qr_codes', function (Blueprint $table) {
                $table->id();
                // The unique slug embedded in the QR URL: /menu/{slug}
                $table->string('slug', 64)->unique();
                $table->unsignedBigInteger('place_id')->nullable();
                $table->index('place_id');
                $table->unsignedBigInteger('dining_table_id')->nullable();
                $table->index('dining_table_id');
                $table->string('label')->nullable();        // "Table 5 - Window"
                $table->boolean('is_active')->default(true);
                $table->unsignedInteger('scan_count')->default(0);
                $table->timestamp('last_scanned_at')->nullable();
                $table->timestamps();
            });
        }

        // ── QR / Guest Sessions ────────────────────────────────────────────────
        if (! Schema::hasTable('qr_sessions')) {
            Schema::create('qr_sessions', function (Blueprint $table) {
                $table->id();
                $table->string('session_token', 64)->unique();
                $table->foreignId('qr_code_id')->nullable()->constrained()->nullOnDelete();
                $table->unsignedBigInteger('place_id')->nullable();
                $table->unsignedBigInteger('dining_table_id')->nullable();
                // Guest info collected at order-time (optional)
                $table->string('guest_name')->nullable();
                $table->string('guest_phone', 50)->nullable();
                // Cart state: JSON [{fooditems_id, category_id, quantity, price, note}]
                $table->json('cart')->nullable();
                // The order created when the guest submits
                $table->unsignedBigInteger('order_id')->nullable();
                $table->index('order_id');
                // active | ordered | expired
                $table->string('status', 20)->default('active');
                $table->timestamp('expires_at');
                $table->timestamps();

                $table->index(['session_token', 'status']);
                $table->index('place_id');
            });
        }

    }

    public function down(): void
    {
        Schema::dropIfExists('qr_sessions');
        Schema::dropIfExists('qr_codes');
    }
};
