<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Branch foundation, step 5 — retire the legacy `place_id` column from
 * `kds_stations` now that all code reads `branch_id`.
 *
 * Split out from the add/backfill migration on purpose: the reference-swap in
 * the models, controllers and pages is verified against a DB that still carries
 * both columns before anything is destroyed. The index that was keyed on
 * `place_id` is re-created against `branch_id`.
 *
 * (This migration originally also cleaned up the stock / wastage / daily-snapshot /
 * transfer and purchase tables; those modules were removed, so only KDS remains.)
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('kds_stations', 'place_id')) {
            Schema::table('kds_stations', function (Blueprint $table) {
                $table->dropIndex(['place_id', 'is_active']);
                $table->dropIndex(['place_id']);
            });
            Schema::table('kds_stations', fn (Blueprint $t) => $t->dropColumn('place_id'));
            Schema::table('kds_stations', fn (Blueprint $t) => $t->index(['branch_id', 'is_active']));
        }
    }

    public function down(): void
    {
        // Re-add the legacy column (unindexed) so the migration is reversible;
        // the earlier add/backfill migration owns the branch_id side.
        if (! Schema::hasColumn('kds_stations', 'place_id')) {
            Schema::table('kds_stations', fn (Blueprint $t) => $t->unsignedBigInteger('place_id')->nullable()->after('id'));
        }
    }
};
