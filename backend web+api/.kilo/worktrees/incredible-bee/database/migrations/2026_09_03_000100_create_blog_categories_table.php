<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Blog step 1 — curated content categories.
 *
 * Deliberately NOT `food_categories`: that table organises the sellable menu,
 * this one organises articles. A "Recipes" blog category and a "Desserts" menu
 * category are different things with different audiences, and conflating them
 * would mean a menu rename silently retitles published posts.
 *
 * Categories are curated on their own screen — unlike tags, they are not created
 * inline while writing. `slug` is the public URL segment at /blog/category/{slug}.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('blog_categories')) {
            Schema::create('blog_categories', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('slug')->unique();
                $table->text('description')->nullable();

                // Hides the category from public listings without deleting it,
                // which would detach it from every post that used it.
                $table->boolean('is_active')->default(true);

                $table->timestamps();
                $table->softDeletes();

                $table->index('is_active');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('blog_categories');
    }
};
