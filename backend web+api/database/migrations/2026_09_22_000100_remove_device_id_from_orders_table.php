<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('orders', 'device_id')) {
            return;
        }

        Schema::table('orders', function (Blueprint $table) {
            if (Schema::getConnection()->getDriverName() !== 'sqlite') {
                $table->dropForeign(['device_id']);
            }

            $table->dropColumn('device_id');
        });
    }

    public function down(): void
    {
        if (Schema::hasColumn('orders', 'device_id')) {
            return;
        }

        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('device_id')
                ->nullable()
                ->after('customer_id')
                ->constrained('whatsapps')
                ->nullOnDelete();
        });
    }
};
