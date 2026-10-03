<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('customer_id')->nullable();

            $table->dateTime('order_datetime');
            $table->string('status'); // e.g., "pending", "completed"
            $table->boolean('paid')->default(false);

            $table->enum('type', ['delivery', 'dining', 'on-way']);
            $table->integer('qty');

            $table->decimal('subtotal', 8, 2);
            $table->enum('discount_type', ['amount', 'percentage']);
            $table->decimal('discount_amount', 8, 2);

            $table->decimal('service_charges', 8, 2); // Fixed from string to decimal
            $table->decimal('grand_total', 8, 2);

            $table->timestamps();

            // Foreign keys

            $table->foreign('customer_id')
                ->references('id')
                ->on('customers')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
