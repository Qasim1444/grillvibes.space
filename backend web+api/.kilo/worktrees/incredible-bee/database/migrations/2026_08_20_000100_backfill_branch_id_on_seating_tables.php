<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Branch foundation, follow-up — re-run the seating backfill.
 *
 * Step 4 (add_branch_id_to_seating_tables) backfilled every row that existed at
 * the time, but the reservation controllers kept writing `place_id` only, so
 * anything created afterwards — dining tables added from the floor plan in
 * particular — landed with a null `branch_id`. Those rows disappear as soon as a
 * screen filters by outlet, which is exactly what the Reservations and Floor Plan
 * pages now do. Re-run the backfill for the seating tables those screens read;
 * the controllers set `branch_id` from here on, so this should not be needed again.
 */
return new class extends Migration
{
    /** Seating tables read by the Reservations and Floor Plan screens. */
    private const TABLES = ['dining_tables', 'reservations', 'waitlist_entries'];

    public function up(): void
    {
        $firstBranchId = DB::table('branches')->orderBy('id')->value('id');

        // Nothing to resolve to — a fresh install runs step 1 first, which seeds one.
        if (! $firstBranchId) {
            return;
        }

        foreach (self::TABLES as $table) {
            if (! Schema::hasColumn($table, 'branch_id')) {
                continue;
            }

            // Prefer the seating area's own outlet; fall back to the first branch
            // for rows that never had a place either.
            DB::statement(
                "UPDATE {$table} SET branch_id = COALESCE(
                    (SELECT p.branch_id FROM places p WHERE p.id = {$table}.place_id), ?
                ) WHERE branch_id IS NULL",
                [$firstBranchId]
            );
        }
    }

    public function down(): void
    {
        // Data backfill only — the columns belong to step 4, so there is nothing
        // to reverse here without guessing which rows were originally null.
    }
};
