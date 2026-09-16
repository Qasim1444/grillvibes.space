<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('permissions')->where('key', 'kiosk.config')->delete();
    }

    public function down(): void
    {
        DB::table('permissions')->insert([
            'name' => 'Manage Kiosk Config',
            'key' => 'kiosk.config',
            'group' => 'QR & Kiosk',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
};
