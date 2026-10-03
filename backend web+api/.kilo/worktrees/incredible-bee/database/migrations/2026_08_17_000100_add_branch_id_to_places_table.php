<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Branch foundation, step 1 — a `place` (seating area) belongs to a `branch`
 * (outlet).
 *
 * Everything the earlier modules built keyed "which outlet" off `place_id`,
 * conflating seating areas with outlets. We settle that here: branches are the
 * outlet, places are seating areas under a branch. This migration guarantees at
 * least one branch exists ("Main Branch"), gives every place a `branch_id`, and
 * attaches the existing places to that branch so later re-key migrations have a
 * branch to resolve to.
 */
return new class extends Migration
{
    public function up(): void
    {
        // A backfill target must exist before any table can resolve a branch.
        if (DB::table('branches')->count() === 0) {
            DB::table('branches')->insert([
                'name' => 'Main Branch',
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $firstBranchId = DB::table('branches')->orderBy('id')->value('id');

        if (! Schema::hasColumn('places', 'branch_id')) {
            Schema::table('places', function (Blueprint $table) {
                $table->foreignId('branch_id')
                    ->nullable()
                    ->after('id')
                    ->constrained('branches')
                    ->nullOnDelete();
            });
        }

        // Every existing seating area belongs to the first (only) branch.
        DB::table('places')->whereNull('branch_id')->update(['branch_id' => $firstBranchId]);
    }

    public function down(): void
    {
        if (Schema::hasColumn('places', 'branch_id')) {
            Schema::table('places', function (Blueprint $table) {
                $table->dropForeign(['branch_id']);
                $table->dropColumn('branch_id');
            });
        }
    }
};
