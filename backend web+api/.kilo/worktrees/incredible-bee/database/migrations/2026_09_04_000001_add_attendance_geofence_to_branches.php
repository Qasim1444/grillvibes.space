<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('branches', function (Blueprint $table) {
            $table->decimal('latitude', 17, 14)
                ->nullable()
                ->after('status');

            $table->decimal('longitude', 17, 14)
                ->nullable()
                ->after('latitude');

            $table->unsignedInteger('attendance_radius_meters')
                ->default(100)
                ->after('longitude');

            $table->time('attendance_start_time')
                ->nullable()
                ->after('attendance_radius_meters');
        });
    }

    public function down(): void
    {
        Schema::table('branches', function (Blueprint $table) {
            $table->dropColumn([
                'latitude',
                'longitude',
                'attendance_radius_meters',
                'attendance_start_time',
            ]);
        });
    }
};
