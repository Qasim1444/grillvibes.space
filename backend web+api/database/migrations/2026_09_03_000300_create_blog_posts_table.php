<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Blog step 3 — the articles themselves.
 *
 * Visibility is decided by two columns together, never by one alone:
 *
 *     public  ⟺  status = 'published'  AND  published_at <= now()
 *
 * That pairing is what makes scheduling work without a scheduler. A post set to
 * `published` with a future `published_at` simply is not visible yet, and becomes
 * visible when the clock passes it — no cron job, no queue worker, nothing to
 * fail silently overnight. See BlogPost::scopePublished().
 *
 * `status = 'draft'` is invisible regardless of date, so a draft can never leak
 * through a date filter.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('blog_posts')) {
            Schema::create('blog_posts', function (Blueprint $table) {
                $table->id();
                $table->string('title');

                // The public URL segment at /blog/{slug}. Frozen once the post has
                // been published, because changing it breaks every link already
                // shared — enforced in BlogPostController, not here.
                $table->string('slug')->unique();

                // Short summary for listing cards and social/SEO description.
                // Derived from `body` when left blank rather than shown empty.
                $table->text('excerpt')->nullable();

                $table->longText('body');

                // Absolute URL, matching the existing food-item convention
                // (Storage::disk('public') + asset('storage/images/…')).
                $table->string('featured_image')->nullable();

                $table->string('status', 20)->default('draft'); // draft | published | scheduled

                // Nullable until first published. Doubles as the public sort key,
                // so a back-dated post lands in the right place chronologically.
                $table->timestamp('published_at')->nullable();

                // Kept on delete: an article outlives the account that wrote it,
                // and a byline reading "Unknown" is better than a broken join.
                $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();

                $table->unsignedBigInteger('views')->default(0);

                // Fall back to title/excerpt when blank — no need to retype both.
                $table->string('meta_title')->nullable();
                $table->string('meta_description', 500)->nullable();

                $table->timestamps();
                $table->softDeletes();

                // The public listing query: published rows, newest first.
                $table->index(['status', 'published_at']);
                $table->index('author_id');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('blog_posts');
    }
};
