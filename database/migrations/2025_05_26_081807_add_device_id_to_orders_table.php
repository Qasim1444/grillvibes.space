<?php

use Illuminate\Database\Migrations\Migration;
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Order device tracking was removed. Kept as a no-op so existing
        // migration history remains valid while fresh databases skip the column.
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
