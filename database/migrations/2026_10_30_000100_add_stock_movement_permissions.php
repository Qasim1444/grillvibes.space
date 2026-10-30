<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();
        foreach ([
            ['name' => 'Edit Stock Movements', 'key' => 'inventory.stock.update'],
            ['name' => 'Delete Stock Movements', 'key' => 'inventory.stock.delete'],
        ] as $permission) {
            DB::table('permissions')->updateOrInsert(
                ['key' => $permission['key']],
                [...$permission, 'group' => 'Inventory', 'created_at' => $now, 'updated_at' => $now]
            );
        }
    }

    public function down(): void
    {
        $ids = DB::table('permissions')
            ->whereIn('key', ['inventory.stock.update', 'inventory.stock.delete'])
            ->pluck('id');
        DB::table('permission_role')->whereIn('permission_id', $ids)->delete();
        DB::table('permissions')->whereIn('id', $ids)->delete();
    }
};
