<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddServiceChargesPercentageToOrdersTable extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // decimal(total_digits, decimal_places) — adjust as needed
            $table->decimal('service_charges_percentage', 5, 2)
                ->default(0)
                ->after('service_charges');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('service_charges_percentage');
        });
    }
}
