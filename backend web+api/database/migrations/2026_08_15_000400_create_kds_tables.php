<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * KDS (Kitchen Display System):
 *  kds_stations       → physical screens (Grill, Cold, Beverages, …)
 *  order_items        → 4 new columns: kds_station_id, kds_status,
 *                       kds_sent_at, kds_bumped_at
 *
 * A ticket = one order_item (or a group by order, shown per-station).
 * Workflow: new → sent → preparing → ready → bumped
 */
return new class extends Migration
{
    public function up(): void
    {
        // ── KDS Stations ─────────────────────────────────────────────────────
        if (! Schema::hasTable('kds_stations')) {
            Schema::create('kds_stations', function (Blueprint $table) {
                $table->id();
                $table->string('name');                // "Grill", "Cold Kitchen"…
                $table->unsignedBigInteger('place_id')->nullable();
                $table->index('place_id');
                $table->string('color', 20)->default('#6366f1'); // display accent
                $table->text('description')->nullable();
                // Which food categories this station handles (JSON array of ids)
                $table->json('category_ids')->nullable();
                $table->boolean('is_active')->default(true);
                $table->unsignedSmallInteger('sort_order')->default(0);
                $table->timestamps();

                $table->index(['place_id', 'is_active']);
            });
        }

        // ── Extend order_items for KDS ────────────────────────────────────────
        Schema::table('order_items', function (Blueprint $table) {
            if (! Schema::hasColumn('order_items', 'kds_station_id')) {
                $table->unsignedBigInteger('kds_station_id')->nullable()->after('category_id');
                $table->index('kds_station_id');
            }
            // new | sent | preparing | ready | bumped | recalled
            if (! Schema::hasColumn('order_items', 'kds_status')) {
                $table->string('kds_status', 20)->default('new')->after('kds_station_id');
                $table->index('kds_status');
            }
            if (! Schema::hasColumn('order_items', 'kds_sent_at')) {
                $table->timestamp('kds_sent_at')->nullable()->after('kds_status');
            }
            if (! Schema::hasColumn('order_items', 'kds_bumped_at')) {
                $table->timestamp('kds_bumped_at')->nullable()->after('kds_sent_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropIndex(['kds_station_id']);
            $table->dropIndex(['kds_status']);
            $table->dropColumnIfExists('kds_station_id');
            $table->dropColumnIfExists('kds_status');
            $table->dropColumnIfExists('kds_sent_at');
            $table->dropColumnIfExists('kds_bumped_at');
        });

        Schema::dropIfExists('kds_stations');
    }
};
