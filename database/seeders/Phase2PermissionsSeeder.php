<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Seeds all Phase-2 permissions:
 *   KDS (Kitchen Display System)
 *   Reservations, Floor Plan & Waitlist
 *   QR Codes
 *
 * Safe to re-run — uses firstOrCreate throughout.
 */
class Phase2PermissionsSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // ── KDS Stations ──────────────────────────────────────────────────
            ['name' => 'View KDS Stations',   'key' => 'kds.stations.view',   'group' => 'KDS'],
            ['name' => 'Create KDS Stations', 'key' => 'kds.stations.create', 'group' => 'KDS'],
            ['name' => 'Update KDS Stations', 'key' => 'kds.stations.update', 'group' => 'KDS'],
            ['name' => 'Delete KDS Stations', 'key' => 'kds.stations.delete', 'group' => 'KDS'],
            // Board covers view + bump + status updates (kitchen staff role)
            ['name' => 'View & Operate KDS Board', 'key' => 'kds.board.view', 'group' => 'KDS'],

            // ── Reservations ──────────────────────────────────────────────────
            ['name' => 'View Reservations',   'key' => 'reservations.view',   'group' => 'Reservations'],
            ['name' => 'Create Reservations', 'key' => 'reservations.create', 'group' => 'Reservations'],
            ['name' => 'Update Reservations', 'key' => 'reservations.update', 'group' => 'Reservations'],
            ['name' => 'Delete Reservations', 'key' => 'reservations.delete', 'group' => 'Reservations'],

            // ── QR Codes ──────────────────────────────────────────────────────
            ['name' => 'View QR Codes',   'key' => 'qr.view',   'group' => 'QR & Kiosk'],
            ['name' => 'Create QR Codes', 'key' => 'qr.create', 'group' => 'QR & Kiosk'],
            ['name' => 'Update QR Codes', 'key' => 'qr.update', 'group' => 'QR & Kiosk'],
            ['name' => 'Delete QR Codes', 'key' => 'qr.delete', 'group' => 'QR & Kiosk'],

        ];

        $ids = [];

        foreach ($permissions as $perm) {
            $record = Permission::firstOrCreate(
                ['key' => $perm['key']],
                ['name' => $perm['name'], 'group' => $perm['group']]
            );
            $ids[] = $record->id;
        }

        // Reservations and KDS are day-to-day operational screens. Grant new
        // entries to Manager too, without overwriting any UI-managed choices.
        foreach ([Role::SUPER_ADMIN, 'manager'] as $slug) {
            $role = Role::where('slug', $slug)->first();

            if ($role) {
                $role->permissions()->syncWithoutDetaching($ids);
                User::forgetPermissionCacheForRole($role);
            }
        }

        $this->command?->info('Phase 2 permissions seeded (' . count($ids) . ' permissions).');
    }
}
