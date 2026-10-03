<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Seeds Phase-5 permissions:
 *   Expense & Petty-Cash Management (expenses + petty-cash floats/ledger)
 *
 * Safe to re-run — uses firstOrCreate throughout.
 */
class Phase5PermissionsSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // ── Expenses ──────────────────────────────────────────────────────
            ['name' => 'View Expenses',    'key' => 'expenses.view',    'group' => 'Finance'],
            ['name' => 'Create Expenses',  'key' => 'expenses.create',  'group' => 'Finance'],
            ['name' => 'Update Expenses',  'key' => 'expenses.update',  'group' => 'Finance'],
            ['name' => 'Delete Expenses',  'key' => 'expenses.delete',  'group' => 'Finance'],
            ['name' => 'Approve Expenses', 'key' => 'expenses.approve', 'group' => 'Finance'],

            // ── Petty cash ────────────────────────────────────────────────────
            ['name' => 'View Petty Cash',   'key' => 'petty-cash.view',   'group' => 'Finance'],
            ['name' => 'Create Petty Cash', 'key' => 'petty-cash.create', 'group' => 'Finance'],
            ['name' => 'Update Petty Cash', 'key' => 'petty-cash.update', 'group' => 'Finance'],
            ['name' => 'Delete Petty Cash', 'key' => 'petty-cash.delete', 'group' => 'Finance'],
        ];

        $ids = [];

        foreach ($permissions as $perm) {
            $record = Permission::firstOrCreate(
                ['key' => $perm['key']],
                ['name' => $perm['name'], 'group' => $perm['group']]
            );
            $ids[] = $record->id;
        }

        // Expenses & petty cash are day-to-day operational finance screens for
        // outlet managers — grant to Manager too, without overwriting UI choices.
        foreach ([Role::SUPER_ADMIN, 'manager'] as $slug) {
            $role = Role::where('slug', $slug)->first();

            if ($role) {
                $role->permissions()->syncWithoutDetaching($ids);
                User::forgetPermissionCacheForRole($role);
            }
        }

        $this->command?->info('Phase 5 permissions seeded ('.count($ids).' permissions).');
    }
}
