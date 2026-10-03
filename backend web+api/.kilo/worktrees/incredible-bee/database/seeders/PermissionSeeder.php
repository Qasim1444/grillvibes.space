<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Seeds the permission catalogue plus three starter roles. Idempotent —
 * re-running adds newly declared permissions without touching existing ones or
 * clobbering role matrices that were edited in the UI.
 */
class PermissionSeeder extends Seeder
{
    /**
     * group => [ moduleKey => [label, [actions...]] ]
     *
     * @return array<string, array<string, array{0: string, 1: array<int, string>}>>
     */
    public static function catalogue(): array
    {
        return [
            'Overview' => [
                'dashboard' => ['Dashboard', ['view']],
            ],
            'Orders' => [
                'pos' => ['POS / New Order', ['view']],
                'orders' => ['Orders', ['view', 'create', 'update', 'delete']],
            ],
            'Restaurant' => [
                'food-categories' => ['Food Categories', ['view', 'create', 'update', 'delete']],
                'food-items' => ['Food Items', ['view', 'create', 'update', 'delete']],
                'places' => ['Places', ['view', 'create', 'update', 'delete']],
            ],
            'Blog' => [
                'blog' => ['Blog Posts', ['view', 'create', 'update', 'delete']],
            ],
            'People' => [
                'users' => ['Users', ['view', 'create', 'update', 'delete']],
                'customers' => ['Customers', ['view', 'create', 'update', 'delete']],
                'roles' => ['Roles & Permissions', ['view', 'create', 'update', 'delete']],
            ],
            'Account' => [
                'profile' => ['Profile', ['view', 'update']],
                'change-password' => ['Change Password', ['view', 'update']],
            ],
            'HR' => [
                'hr.designations' => ['Designations', ['view', 'create', 'update', 'delete']],
                'hr.employees' => ['Employees', ['view', 'create', 'update', 'delete']],
                'hr.attendance' => ['Attendance', ['view', 'create', 'update', 'delete']],
                'hr.leaves' => ['Leaves', ['view', 'create', 'update', 'delete', 'approve']],
                'hr.overtime' => ['Overtime', ['view', 'create', 'update', 'delete', 'approve']],
                'hr.loans' => ['Loans & Advances', ['view', 'create', 'update', 'delete']],
                'hr.payroll' => ['Payroll', ['view', 'create', 'approve', 'delete']],
            ],
            'CRM' => [
                'crm.loyalty' => ['Loyalty Points', ['view', 'update']],
                'crm.promo-codes' => ['Promo Codes', ['view', 'create', 'update', 'delete']],
                'crm.discounts' => ['Discount Campaigns', ['view', 'create', 'update', 'delete']],
                'crm.feedback' => ['Feedback', ['view', 'update', 'delete']],
            ],
            'Settings' => [
                'settings' => ['Settings', ['view', 'create', 'update', 'delete']],
            ],
        ];
    }

    /** Human labels for the action suffixes. */
    private const ACTION_LABELS = [
        'view' => 'View',
        'create' => 'Create',
        'update' => 'Update',
        'delete' => 'Delete',
        'approve' => 'Approve',
    ];

    /** @return array<int, string> */
    public static function allKeys(): array
    {
        $keys = [];

        foreach (self::catalogue() as $modules) {
            foreach ($modules as $module => [$label, $actions]) {
                foreach ($actions as $action) {
                    $keys[] = "{$module}.{$action}";
                }
            }
        }

        return $keys;
    }

    public function run(): void
    {
        foreach (self::catalogue() as $group => $modules) {
            foreach ($modules as $module => [$label, $actions]) {
                foreach ($actions as $action) {
                    Permission::updateOrCreate(
                        ['key' => "{$module}.{$action}"],
                        [
                            'name' => self::ACTION_LABELS[$action].' '.$label,
                            'group' => $group,
                        ]
                    );
                }
            }
        }

        $superAdmin = Role::updateOrCreate(
            ['slug' => Role::SUPER_ADMIN],
            [
                'name' => 'Super Admin',
                'description' => 'Full access to every module. Cannot be edited or deleted.',
                'is_locked' => true,
            ]
        );
        // Kept in sync so the matrix UI shows everything ticked, even though
        // hasPermission() short-circuits for this slug anyway.
        $superAdmin->permissions()->sync(Permission::pluck('id'));

        $this->seedRole('manager', 'Manager', 'Everything except user, role and settings management.', function (string $key) {
            return ! Str::startsWith($key, ['users.', 'roles.', 'settings.']);
        });

        $this->seedRole('cashier', 'Cashier', 'POS, orders and customers only.', function (string $key) {
            return Str::startsWith($key, ['dashboard.', 'pos.', 'orders.', 'customers.'])
                && ! Str::endsWith($key, '.delete');
        });

        // Bootstrap: without this the very first deploy locks everyone out, since
        // no user has a role yet and every route now requires a permission.
        if ($superAdmin->users()->doesntExist()) {
            User::orderBy('id')->first()?->assignRole($superAdmin);
        }
    }

    private function seedRole(string $slug, string $name, string $description, callable $filter): void
    {
        $role = Role::firstOrCreate(
            ['slug' => $slug],
            ['name' => $name, 'description' => $description]
        );

        // Add newly introduced permissions without removing choices that were
        // deliberately changed through the Roles & Permissions screen.
        $keys = collect(self::allKeys())->filter($filter);
        $role->permissions()->syncWithoutDetaching(
            Permission::whereIn('key', $keys)->pluck('id')
        );
        User::forgetPermissionCacheForRole($role);
    }
}
