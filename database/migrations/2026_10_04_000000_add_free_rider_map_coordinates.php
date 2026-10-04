<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'current_latitude')) {
                $table->decimal('current_latitude', 18, 15)->nullable()->after('last_location_at');
            }

            if (! Schema::hasColumn('users', 'current_longitude')) {
                $table->decimal('current_longitude', 18, 15)->nullable()->after('current_latitude');
            }

            if (! Schema::hasColumn('users', 'location_updated_at')) {
                $table->timestamp('location_updated_at')->nullable()->after('current_longitude');
            }
        });

        Schema::table('orders', function (Blueprint $table) {
            if (! Schema::hasColumn('orders', 'delivery_latitude')) {
                $table->decimal('delivery_latitude', 18, 15)->nullable()->after('cash_collected');
            }

            if (! Schema::hasColumn('orders', 'delivery_longitude')) {
                $table->decimal('delivery_longitude', 18, 15)->nullable()->after('delivery_latitude');
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'delivery_longitude')) {
                $table->dropColumn('delivery_longitude');
            }

            if (Schema::hasColumn('orders', 'delivery_latitude')) {
                $table->dropColumn('delivery_latitude');
            }
        });

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'location_updated_at')) {
                $table->dropColumn('location_updated_at');
            }

            if (Schema::hasColumn('users', 'current_longitude')) {
                $table->dropColumn('current_longitude');
            }

            if (Schema::hasColumn('users', 'current_latitude')) {
                $table->dropColumn('current_latitude');
            }
        });
    }
};
