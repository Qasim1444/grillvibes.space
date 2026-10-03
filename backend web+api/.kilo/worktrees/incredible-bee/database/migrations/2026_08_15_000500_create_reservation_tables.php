<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Reservations, Floor Plan & Waitlist:
 *
 *  dining_tables      → physical table master (shape, position on floor plan)
 *  reservations       → future bookings (customer + table + time window)
 *  waitlist_entries   → walk-in queue when no table is free
 */
return new class extends Migration
{
    public function up(): void
    {
        // ── Dining Tables (floor plan nodes) ─────────────────────────────────
        if (! Schema::hasTable('dining_tables')) {
            Schema::create('dining_tables', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('place_id')->nullable();
                $table->index('place_id');
                $table->string('table_number', 20);          // "T-1", "VIP-3"…
                $table->unsignedSmallInteger('capacity')->default(4);
                // circle | rectangle | square
                $table->string('shape', 20)->default('rectangle');
                // Floor plan pixel coords (set by drag-drop editor)
                $table->unsignedSmallInteger('pos_x')->default(0);
                $table->unsignedSmallInteger('pos_y')->default(0);
                // available | occupied | reserved | cleaning
                $table->string('status', 20)->default('available');
                // Which order is currently sitting on this table (nullable)
                $table->unsignedBigInteger('current_order_id')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();

                $table->unique(['place_id', 'table_number']);
                $table->index('status');
            });
        }

        // ── Reservations ──────────────────────────────────────────────────────
        if (! Schema::hasTable('reservations')) {
            Schema::create('reservations', function (Blueprint $table) {
                $table->id();
                $table->foreignId('dining_table_id')->nullable()->constrained()->nullOnDelete();
                $table->unsignedBigInteger('place_id')->nullable();
                $table->index('place_id');
                // Guest info (may or may not be a registered customer)
                $table->unsignedBigInteger('customer_id')->nullable();
                $table->index('customer_id');
                $table->string('guest_name');
                $table->string('guest_phone', 50)->nullable();
                $table->string('guest_email')->nullable();
                $table->unsignedSmallInteger('party_size')->default(2);
                // The booking window
                $table->dateTime('reserved_at');
                $table->unsignedSmallInteger('duration_minutes')->default(90);
                // pending | confirmed | seated | completed | cancelled | no_show
                $table->string('status', 20)->default('pending');
                $table->string('occasion')->nullable();   // Birthday, Anniversary…
                $table->text('notes')->nullable();
                $table->string('source', 30)->default('walk_in');  // walk_in | phone | online | qr
                $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();
                $table->softDeletes();

                $table->index(['place_id', 'reserved_at']);
                $table->index(['status', 'reserved_at']);
            });
        }

        // ── Waitlist Entries ──────────────────────────────────────────────────
        if (! Schema::hasTable('waitlist_entries')) {
            Schema::create('waitlist_entries', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('place_id')->nullable();
                $table->index('place_id');
                $table->string('guest_name');
                $table->string('guest_phone', 50)->nullable();
                $table->unsignedSmallInteger('party_size')->default(2);
                $table->unsignedBigInteger('customer_id')->nullable();
                // waiting | seated | left | expired
                $table->string('status', 20)->default('waiting');
                $table->timestamp('checked_in_at');
                $table->timestamp('notified_at')->nullable();  // when we SMS/called them
                $table->timestamp('seated_at')->nullable();
                $table->unsignedSmallInteger('estimated_wait_minutes')->nullable();
                $table->text('notes')->nullable();
                $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();

                $table->index(['place_id', 'status']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('waitlist_entries');
        Schema::dropIfExists('reservations');
        Schema::dropIfExists('dining_tables');
    }
};
