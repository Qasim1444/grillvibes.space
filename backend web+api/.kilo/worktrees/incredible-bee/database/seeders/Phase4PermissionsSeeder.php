<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Seeds Phase-4 permissions:
 *   Asset & Equipment Maintenance (asset register + maintenance work orders)
 *
 * Safe to re-run — uses firstOrCreate throughout.
 */
class Phase4PermissionsSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // ── Asset register ────────────────────────────────────────────────
            ['name' => 'View Assets',   'key' => 'maintenance.assets.view',   'group' => 'Maintenance'],
            ['name' => 'Create Assets', 'key' => 'maintenance.assets.create', 'group' => 'Maintenance'],
            ['name' => 'Update Assets', 'key' => 'maintenance.assets.update', 'group' => 'Maintenance'],
            ['name' => 'Delete Assets', 'key' => 'maintenance.assets.delete', 'group' => 'Maintenance'],

            // ── Maintenance work orders / logs ────────────────────────────────
            ['name' => 'View Maintenance Logs',   'key' => 'maintenance.logs.view',   'group' => 'Maintenance'],
            ['name' => 'Create Maintenance Logs', 'key' => 'maintenance.logs.create', 'group' => 'Maintenance'],
            ['name' => 'Update Maintenance Logs', 'key' => 'maintenance.logs.update', 'group' => 'Maintenance'],
            ['name' => 'Delete Maintenance Logs', 'key' => 'maintenance.logs.delete', 'group' => 'Maintenance'],
        ];

        $ids = [];

        foreach ($permissions as $perm) {
            $record = Permission::firstOrCreate(
                ['key' => $perm['key']],
                ['name' => $perm['name'], 'group' => $perm['group']]
            );
            $ids[] = $record->id;
        }

        // Assets & maintenance are day-to-day operational screens for outlet
        // managers — grant to Manager too, without overwriting UI-managed choices.
        foreach ([Role::SUPER_ADMIN, 'manager'] as $slug) {
            $role = Role::where('slug', $slug)->first();

            if ($role) {
                $role->permissions()->syncWithoutDetaching($ids);
                User::forgetPermissionCacheForRole($role);
            }
        }

        $this->command?->info('Phase 4 permissions seeded ('.count($ids).' permissions).');
    }
}
