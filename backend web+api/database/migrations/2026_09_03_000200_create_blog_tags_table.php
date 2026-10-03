<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Blog step 2 — free-form tags.
 *
 * The loose counterpart to `blog_categories`: tags are created inline while
 * writing a post, so a writer never has to leave the editor to add "ramadan".
 * That is the whole distinction between the two taxonomies — categories are
 * curated deliberately, tags accumulate as they are needed.
 *
 * No `is_active` here on purpose. An unwanted tag is deleted rather than hidden;
 * there is nothing to preserve in a label nobody chose carefully.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('blog_tags')) {
            Schema::create('blog_tags', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('slug')->unique();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('blog_tags');
    }
};
