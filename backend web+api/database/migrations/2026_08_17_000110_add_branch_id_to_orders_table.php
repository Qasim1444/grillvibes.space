<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Branch foundation, step 2 — orders gain a `branch_id`.
 *
 * `place_id` stays: for a dine-in order it is the seating area (table) the guest
 * sits at. `branch_id` is the outlet that owns the sale, and is what Branch
 * Reports, KDS routing and stock consumption all key on. It is derived from the
 * order's seating area's branch, falling back to the first branch.
 */
return new class extends Migration
{
    public function up(): void
    {
        $firstBranchId = DB::table('branches')->orderBy('id')->value('id');

        if (! Schema::hasColumn('orders', 'branch_id')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->foreignId('branch_id')
                    ->nullable()
                    ->after('place_id')
                    ->constrained('branches')
                    ->nullOnDelete();
            });
        }

        DB::statement(
            'UPDATE orders SET branch_id = COALESCE(
                (SELECT p.branch_id FROM places p WHERE p.id = orders.place_id), ?
            ) WHERE branch_id IS NULL',
            [$firstBranchId]
        );
    }

    public function down(): void
    {
        if (Schema::hasColumn('orders', 'branch_id')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->dropForeign(['branch_id']);
                $table->dropColumn('branch_id');
            });
        }
    }
};
