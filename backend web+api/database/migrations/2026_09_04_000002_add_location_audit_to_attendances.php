<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            // Check-in GPS data
            $table->decimal('check_in_latitude', 17, 14)
                ->nullable()
                ->after('check_in');

            $table->decimal('check_in_longitude', 17, 14)
                ->nullable()
                ->after('check_in_latitude');

            $table->decimal('check_in_accuracy', 8, 2)
                ->nullable()
                ->after('check_in_longitude');

            $table->unsignedInteger('check_in_distance_meters')
                ->nullable()
                ->after('check_in_accuracy');

            // Check-out GPS data
            $table->decimal('check_out_latitude', 17, 14)
                ->nullable()
                ->after('check_out');

            $table->decimal('check_out_longitude', 17, 14)
                ->nullable()
                ->after('check_out_latitude');

            $table->decimal('check_out_accuracy', 8, 2)
                ->nullable()
                ->after('check_out_longitude');

            $table->unsignedInteger('check_out_distance_meters')
                ->nullable()
                ->after('check_out_accuracy');
        });
    }

    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropColumn([
                'check_in_latitude',
                'check_in_longitude',
                'check_in_accuracy',
                'check_in_distance_meters',

                'check_out_latitude',
                'check_out_longitude',
                'check_out_accuracy',
                'check_out_distance_meters',
            ]);
        });
    }
};
