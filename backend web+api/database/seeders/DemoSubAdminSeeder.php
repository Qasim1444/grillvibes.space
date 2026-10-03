<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Demo "Sub Admin" role + login.
 *
 * A "sub-admin" is not a special account type — it's just a Role with a subset
 * of permissions, the same mechanism as the seeded Manager/Cashier roles. This
 * seeder creates a deliberately narrow role and a demo user so the contrast with
 * Super Admin (admin@gmail.com) is visible in the UI: a trimmed sidebar, hidden
 * create/update/delete buttons, and 403s on routes the role can't reach.
 *
 * Idempotent — re-running never removes matrix choices made through the Roles
 * & Permissions screen. Depends on the permission catalogue (PermissionSeeder),
 * so it runs after the permission seeders in DatabaseSeeder.
 */
class DemoSubAdminSeeder extends Seeder
{
    /**
     * A narrow slice of the catalogue:
     *  - sees Dashboard, POS, Orders and Customers
     *  - can create orders, but NOT update/delete them
     *  - read-only menu (food categories/items) and customers
     *  - no Users, Roles, Settings, HR, CRM, Procurement, Inventory, etc.
     *
     * @var array<int, string>
     */
    private const PERMISSION_KEYS = [
        'dashboard.view',
        'pos.view',
        'orders.view',
        'orders.create',
        'customers.view',
        'food-categories.view',
        'food-items.view',
    ];

    public function run(): void
    {
        $role = Role::firstOrCreate(
            ['slug' => 'sub-admin'],
            [
                'name' => 'Sub Admin',
                'description' => 'Scoped access: dashboard, POS, orders (view/create) plus read-only menu & customers.',
            ]
        );

        // Attach the subset without detaching anything edited through the UI.
        $role->permissions()->syncWithoutDetaching(
            Permission::whereIn('key', self::PERMISSION_KEYS)->pluck('id')
        );
        User::forgetPermissionCacheForRole($role);

        // Demo login to sit alongside admin@gmail.com for the permission demo.
        $user = User::firstOrCreate(
            ['email' => 'subadmin@gmail.com'],
            [
                'name' => 'Sub Admin',
                'password' => Hash::make('12345678'),
            ]
        );
        $user->assignRole($role);
    }
}
