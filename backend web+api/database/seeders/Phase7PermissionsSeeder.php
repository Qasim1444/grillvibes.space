<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Seeds Phase-7 permissions: Inventory, Procurement and food-cost reporting.
 *
 *   Inventory    ingredients master, stock on hand + corrections, recipe builder
 *   Procurement  vendors, purchase orders, goods receipts
 *   Reports      food cost and margin
 *
 * Note what is deliberately absent: there is no "adjust stock upward" permission,
 * because value only enters inventory through a goods receipt. Anyone who can raise
 * stock is doing it by booking a delivery, which is `goods-receipts.create`.
 *
 * Safe to re-run — uses firstOrCreate throughout.
 */
class Phase7PermissionsSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // ── Inventory ────────────────────────────────────────────────────
            ['name' => 'View Ingredients',    'key' => 'inventory.ingredients.view',   'group' => 'Inventory'],
            ['name' => 'Create Ingredients',  'key' => 'inventory.ingredients.create', 'group' => 'Inventory'],
            ['name' => 'Update Ingredients',  'key' => 'inventory.ingredients.update', 'group' => 'Inventory'],
            ['name' => 'Delete Ingredients',  'key' => 'inventory.ingredients.delete', 'group' => 'Inventory'],
            ['name' => 'View Stock',          'key' => 'inventory.stock.view',         'group' => 'Inventory'],
            // Stock takes and write-offs both rewrite a balance, so they share one key.
            ['name' => 'Adjust Stock',        'key' => 'inventory.stock.adjust',       'group' => 'Inventory'],
            ['name' => 'View Recipes',        'key' => 'inventory.recipes.view',       'group' => 'Inventory'],
            ['name' => 'Update Recipes',      'key' => 'inventory.recipes.update',     'group' => 'Inventory'],

            // ── Procurement ──────────────────────────────────────────────────
            ['name' => 'View Vendors',          'key' => 'procurement.vendors.view',          'group' => 'Procurement'],
            ['name' => 'Create Vendors',        'key' => 'procurement.vendors.create',        'group' => 'Procurement'],
            ['name' => 'Update Vendors',        'key' => 'procurement.vendors.update',        'group' => 'Procurement'],
            ['name' => 'Delete Vendors',        'key' => 'procurement.vendors.delete',        'group' => 'Procurement'],
            ['name' => 'View Purchase Orders',  'key' => 'procurement.purchase-orders.view',  'group' => 'Procurement'],
            ['name' => 'Create Purchase Orders', 'key' => 'procurement.purchase-orders.create', 'group' => 'Procurement'],
            ['name' => 'Update Purchase Orders', 'key' => 'procurement.purchase-orders.update', 'group' => 'Procurement'],
            ['name' => 'Delete Purchase Orders', 'key' => 'procurement.purchase-orders.delete', 'group' => 'Procurement'],
            // Sending a PO to a vendor commits the business to spend, so it is a
            // separate right from drafting one.
            ['name' => 'Approve Purchase Orders', 'key' => 'procurement.purchase-orders.approve', 'group' => 'Procurement'],
            ['name' => 'View Goods Receipts',   'key' => 'procurement.goods-receipts.view',   'group' => 'Procurement'],
            // The only action in the system that raises stock and re-values cost.
            ['name' => 'Create Goods Receipts', 'key' => 'procurement.goods-receipts.create', 'group' => 'Procurement'],

            // ── Reports ──────────────────────────────────────────────────────
            ['name' => 'View Food Cost Report', 'key' => 'reports.food-cost.view', 'group' => 'Reports'],
        ];

        $ids = [];

        foreach ($permissions as $perm) {
            $record = Permission::firstOrCreate(
                ['key' => $perm['key']],
                ['name' => $perm['name'], 'group' => $perm['group']]
            );
            $ids[] = $record->id;
        }

        // Inventory and procurement are the branch manager's daily work, so grant
        // the whole set to Manager as well — without overwriting UI choices.
        foreach ([Role::SUPER_ADMIN, 'manager'] as $slug) {
            $role = Role::where('slug', $slug)->first();

            if ($role) {
                $role->permissions()->syncWithoutDetaching($ids);
                User::forgetPermissionCacheForRole($role);
            }
        }

        $this->command?->info('Phase 7 permissions seeded ('.count($ids).' permissions).');
    }
}
