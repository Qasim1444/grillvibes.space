<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();
        $permissions = [
            ['name' => 'View Profile', 'key' => 'profile.view', 'group' => 'Account'],
            ['name' => 'Update Profile', 'key' => 'profile.update', 'group' => 'Account'],
            ['name' => 'View Change Password', 'key' => 'change-password.view', 'group' => 'Account'],
            ['name' => 'Update Change Password', 'key' => 'change-password.update', 'group' => 'Account'],
        ];

        foreach ($permissions as $permission) {
            DB::table('permissions')->updateOrInsert(
                ['key' => $permission['key']],
                [...$permission, 'updated_at' => $now, 'created_at' => $now]
            );
        }

        $permissionIds = DB::table('permissions')
            ->whereIn('key', array_column($permissions, 'key'))
            ->pluck('id');
        $roleIds = DB::table('roles')->pluck('id');

        foreach ($roleIds as $roleId) {
            foreach ($permissionIds as $permissionId) {
                DB::table('permission_role')->updateOrInsert([
                    'role_id' => $roleId,
                    'permission_id' => $permissionId,
                ]);
            }
        }
    }

    public function down(): void
    {
        $ids = DB::table('permissions')
            ->whereIn('key', ['profile.view', 'profile.update', 'change-password.view', 'change-password.update'])
            ->pluck('id');

        DB::table('permission_role')->whereIn('permission_id', $ids)->delete();
        DB::table('permissions')->whereIn('id', $ids)->delete();
    }
};
