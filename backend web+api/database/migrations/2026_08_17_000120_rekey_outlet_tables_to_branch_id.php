<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Branch foundation, step 3 — re-key KDS stations onto `branch_id`.
 *
 * `kds_stations` always meant "outlet" when it said `place_id`. Add the correct
 * `branch_id` and backfill it from the station's place (its branch), defaulting
 * to the first branch. The now-legacy `place_id` column is dropped in a later
 * migration once the code no longer reads it.
 *
 * (This migration originally also re-keyed the stock / wastage / daily-snapshot /
 * transfer tables; those modules were removed, so only KDS remains.)
 */
return new class extends Migration
{
    public function up(): void
    {
        $firstBranchId = DB::table('branches')->orderBy('id')->value('id');

        if (! Schema::hasColumn('kds_stations', 'branch_id')) {
            Schema::table('kds_stations', function (Blueprint $table) {
                $table->foreignId('branch_id')
                    ->nullable()
                    ->after('id')
                    ->constrained('branches')
                    ->nullOnDelete();
            });
        }

        DB::statement(
            'UPDATE kds_stations SET branch_id = COALESCE(
                (SELECT p.branch_id FROM places p WHERE p.id = kds_stations.place_id), ?
            ) WHERE branch_id IS NULL',
            [$firstBranchId]
        );
    }

    public function down(): void
    {
        if (Schema::hasColumn('kds_stations', 'branch_id')) {
            Schema::table('kds_stations', function (Blueprint $table) {
                $table->dropForeign(['branch_id']);
                $table->dropColumn('branch_id');
            });
        }
    }
};
