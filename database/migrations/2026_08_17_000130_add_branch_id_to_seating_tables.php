<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Branch foundation, step 4 — seating-scoped tables gain a `branch_id` for
 * outlet-level filtering, while keeping `place_id` (the seating area) intact.
 *
 * Dining tables, reservations, waitlist entries, QR codes, and QR sessions
 * belong to a specific seating area — but staff want to scope them by outlet too
 * ("today's reservations at Main Branch"). `branch_id` is derived from the
 * seating area's branch and kept in sync going forward by the controllers.
 * Unlike the outlet tables, `place_id` is NOT dropped here.
 */
return new class extends Migration
{
    public function up(): void
    {
        $firstBranchId = DB::table('branches')->orderBy('id')->value('id');

        foreach (['dining_tables', 'reservations', 'waitlist_entries', 'qr_codes', 'qr_sessions'] as $tbl) {
            if (! Schema::hasColumn($tbl, 'branch_id')) {
                Schema::table($tbl, function (Blueprint $table) {
                    $table->foreignId('branch_id')
                        ->nullable()
                        ->after('place_id')
                        ->constrained('branches')
                        ->nullOnDelete();
                });
            }

            DB::statement(
                "UPDATE {$tbl} SET branch_id = COALESCE(
                    (SELECT p.branch_id FROM places p WHERE p.id = {$tbl}.place_id), ?
                ) WHERE branch_id IS NULL",
                [$firstBranchId]
            );
        }
    }

    public function down(): void
    {
        foreach (['dining_tables', 'reservations', 'waitlist_entries', 'qr_codes', 'qr_sessions'] as $tbl) {
            if (Schema::hasColumn($tbl, 'branch_id')) {
                Schema::table($tbl, function (Blueprint $table) {
                    $table->dropForeign(['branch_id']);
                    $table->dropColumn('branch_id');
                });
            }
        }
    }
};
