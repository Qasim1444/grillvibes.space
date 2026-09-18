<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('permissions')
            ->whereIn('key', ['qr.view', 'qr.create', 'qr.update', 'qr.delete'])
            ->update(['group' => 'QR Codes']);
    }

    public function down(): void
    {
        DB::table('permissions')
            ->whereIn('key', ['qr.view', 'qr.create', 'qr.update', 'qr.delete'])
            ->update(['group' => 'QR Codes']);
    }
};
