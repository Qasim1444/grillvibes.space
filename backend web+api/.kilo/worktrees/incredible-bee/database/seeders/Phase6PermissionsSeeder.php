<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Seeds Phase-6 permissions:
 *   Expense Voucher Claims (bundle expenses → reimbursed from a petty-cash float)
 *
 * Safe to re-run — uses firstOrCreate throughout.
 */
class Phase6PermissionsSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            ['name' => 'View Vouchers',    'key' => 'vouchers.view',    'group' => 'Finance'],
            ['name' => 'Create Vouchers',  'key' => 'vouchers.create',  'group' => 'Finance'],
            ['name' => 'Update Vouchers',  'key' => 'vouchers.update',  'group' => 'Finance'],
            ['name' => 'Delete Vouchers',  'key' => 'vouchers.delete',  'group' => 'Finance'],
            ['name' => 'Approve Vouchers', 'key' => 'vouchers.approve', 'group' => 'Finance'],
        ];

        $ids = [];

        foreach ($permissions as $perm) {
            $record = Permission::firstOrCreate(
                ['key' => $perm['key']],
                ['name' => $perm['name'], 'group' => $perm['group']]
            );
            $ids[] = $record->id;
        }

        // Voucher claims sit next to expenses and petty cash as a day-to-day
        // operational finance screen — grant to Manager too, without overwriting
        // UI choices.
        foreach ([Role::SUPER_ADMIN, 'manager'] as $slug) {
            $role = Role::where('slug', $slug)->first();

            if ($role) {
                $role->permissions()->syncWithoutDetaching($ids);
                User::forgetPermissionCacheForRole($role);
            }
        }

        $this->command?->info('Phase 6 permissions seeded ('.count($ids).' permissions).');
    }
}
