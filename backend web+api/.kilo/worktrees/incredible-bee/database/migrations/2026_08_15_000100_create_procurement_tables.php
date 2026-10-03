<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Vendor (supplier) master.
 *
 * This migration originally created the whole Procurement module (purchase
 * orders, goods receipts, stock levels/ledger, transfers). Those features were
 * removed, so only `vendors` remains — it is still referenced as shared master
 * data by Expenses, Assets and Maintenance.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('vendors')) {
            Schema::create('vendors', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('contact_person')->nullable();
                $table->string('phone', 50)->nullable();
                $table->string('email')->nullable();
                $table->text('address')->nullable();
                $table->string('tax_number', 50)->nullable();
                $table->string('payment_terms')->nullable(); // e.g. "Net 30"
                $table->boolean('is_active')->default(true);
                $table->text('notes')->nullable();
                $table->timestamps();
                $table->softDeletes();

                $table->index('is_active');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('vendors');
    }
};
