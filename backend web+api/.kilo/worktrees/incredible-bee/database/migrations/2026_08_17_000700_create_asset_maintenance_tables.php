<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Asset & equipment maintenance.
 *
 *   assets              — the equipment register (ovens, fridges, POS, furniture…),
 *                         one row per physical item, scoped to the outlet it lives at.
 *   maintenance_records — the work-order log against an asset: preventive services,
 *                         corrective repairs, inspections. Completing a record rolls
 *                         the asset's next_maintenance_date forward by its interval.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->string('asset_code', 50)->unique();          // AST-YYYYMMDD-XXXX
            $table->string('name');
            $table->string('category', 40)->default('other');    // kitchen_equipment|refrigeration|hvac|pos_hardware|furniture|vehicle|utility|other
            $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
            $table->string('location', 120)->nullable();
            $table->string('serial_number', 100)->nullable();
            $table->foreignId('vendor_id')->nullable()->constrained('vendors')->nullOnDelete();
            $table->date('purchase_date')->nullable();
            $table->decimal('purchase_cost', 14, 2)->default(0);
            $table->date('warranty_expiry')->nullable();
            $table->string('status', 20)->default('active');     // active|under_maintenance|retired|disposed
            $table->unsignedInteger('maintenance_interval_days')->nullable();
            $table->date('last_maintenance_date')->nullable();
            $table->date('next_maintenance_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['status', 'category']);
            $table->index('branch_id');
        });

        Schema::create('maintenance_records', function (Blueprint $table) {
            $table->id();
            $table->string('maintenance_number', 50)->unique();  // MNT-YYYYMMDD-XXXX
            $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
            $table->string('type', 20)->default('corrective');   // preventive|corrective|inspection|calibration
            $table->string('status', 20)->default('scheduled');  // scheduled|in_progress|completed|cancelled
            $table->date('scheduled_date')->nullable();
            $table->date('completed_date')->nullable();
            $table->string('performed_by', 120)->nullable();
            $table->foreignId('vendor_id')->nullable()->constrained('vendors')->nullOnDelete();
            $table->decimal('cost', 14, 2)->default(0);
            $table->decimal('downtime_hours', 8, 2)->default(0);
            $table->string('description');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['status', 'scheduled_date']);
            $table->index('asset_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_records');
        Schema::dropIfExists('assets');
    }
};
