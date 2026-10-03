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
        Schema::create('food_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('foodcategory_id');
            $table->string('name');
            $table->string('image');
            $table->text('description');
            $table->string('code')->unique();
            $table->boolean('status')->default(true);
            $table->decimal('price', 8, 2);

            $table->timestamps();
            $table->foreign('foodcategory_id')
                ->references('id')
                ->on('food_categories')
                ->onDelete('cascade');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('food_items');
    }
};
