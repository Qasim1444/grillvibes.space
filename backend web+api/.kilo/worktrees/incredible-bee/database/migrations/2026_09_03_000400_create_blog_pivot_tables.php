<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Blog step 4 — both taxonomies attach many-to-many.
 *
 * A post can sit in several categories and carry several tags. The composite
 * unique index on each pivot is what makes syncing idempotent: attaching the
 * same category twice is a database error rather than a duplicate row that
 * would make the post appear twice in one listing.
 *
 * Cascade on both sides. Deleting a category detaches it from its posts and
 * leaves the posts alone — the pivot row is bookkeeping, not content.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('blog_category_post')) {
            Schema::create('blog_category_post', function (Blueprint $table) {
                $table->id();
                $table->foreignId('post_id')->constrained('blog_posts')->cascadeOnDelete();
                $table->foreignId('category_id')->constrained('blog_categories')->cascadeOnDelete();

                $table->unique(['post_id', 'category_id'], 'blog_category_post_unique');
                // Serves /blog/category/{slug}: find the posts for one category.
                $table->index('category_id');
            });
        }

        if (! Schema::hasTable('blog_post_tag')) {
            Schema::create('blog_post_tag', function (Blueprint $table) {
                $table->id();
                $table->foreignId('post_id')->constrained('blog_posts')->cascadeOnDelete();
                $table->foreignId('tag_id')->constrained('blog_tags')->cascadeOnDelete();

                $table->unique(['post_id', 'tag_id'], 'blog_post_tag_unique');
                $table->index('tag_id');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('blog_post_tag');
        Schema::dropIfExists('blog_category_post');
    }
};
