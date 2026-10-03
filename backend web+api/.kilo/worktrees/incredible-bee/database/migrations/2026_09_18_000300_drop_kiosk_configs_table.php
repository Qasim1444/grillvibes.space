<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('permissions')->where('key', 'kiosk.config')->delete();

        Schema::dropIfExists('kiosk_configs');
    }

    public function down(): void
    {
        // This removed configuration table is intentionally not recreated.
    }
};
