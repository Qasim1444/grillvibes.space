<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

/**
 * A blog article.
 *
 * Public visibility is decided in exactly one place — {@see scopePublished()} —
 * and both the public controller and any future feed/sitemap must go through it.
 * Duplicating that condition is how drafts leak.
 */
class BlogPost extends Model
{
    use HasFactory, SoftDeletes;

    public const STATUS_DRAFT = 'draft';
    public const STATUS_PUBLISHED = 'published';
    public const STATUS_SCHEDULED = 'scheduled';

    /** Offered in the editor's status picker. */
    public const STATUSES = [
        self::STATUS_DRAFT => 'Draft',
        self::STATUS_PUBLISHED => 'Published',
        self::STATUS_SCHEDULED => 'Scheduled',
    ];

    protected $fillable = [
        'title', 'slug', 'excerpt', 'body', 'featured_image',
        'status', 'published_at', 'author_id', 'meta_title', 'meta_description',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'views' => 'integer',
    ];

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(BlogCategory::class, 'blog_category_post', 'post_id', 'category_id')
            // Ordered by name so listings are deterministic. With many-to-many
            // there is no "first" category otherwise, and an arbitrary order
            // makes the same post render differently between requests.
            ->orderBy('name');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(BlogTag::class, 'blog_post_tag', 'post_id', 'tag_id')->orderBy('name');
    }

    /**
     * The single definition of "the public can see this".
     *
     * Both conditions are required. A future `published_at` therefore schedules
     * the post — it goes live when the clock passes it, with nothing to run.
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query
            ->whereIn('status', [self::STATUS_PUBLISHED, self::STATUS_SCHEDULED])
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    /** Published, but dated forward — live later, invisible now. */
    public function scopeScheduled(Builder $query): Builder
    {
        return $query
            ->where('status', self::STATUS_SCHEDULED)
            ->whereNotNull('published_at')
            ->where('published_at', '>', now());
    }

    /** Mirrors {@see scopePublished()} for a single loaded row. */
    public function isPublished(): bool
    {
        return in_array($this->status, [self::STATUS_PUBLISHED, self::STATUS_SCHEDULED], true)
            && $this->published_at !== null
            && $this->published_at->lessThanOrEqualTo(now());
    }

    public function isScheduled(): bool
    {
        return $this->status === self::STATUS_SCHEDULED
            && $this->published_at !== null
            && $this->published_at->greaterThan(now());
    }

    /**
     * What the listing card shows. Falls back to the opening of the body so a
     * writer who skipped the excerpt still gets a readable card instead of a
     * blank one.
     */
    public function summary(int $length = 180): string
    {
        if (filled($this->excerpt)) {
            return $this->excerpt;
        }

        // Tags are stripped because `body` may contain HTML and this lands in a
        // card and a <meta> description, where markup would be noise at best.
        return Str::limit(trim(strip_tags((string) $this->body)), $length);
    }

    /** Rough reading time, for the "4 min read" line on a post. */
    public function readingMinutes(): int
    {
        $words = str_word_count(strip_tags((string) $this->body));

        return max(1, (int) ceil($words / 200));
    }
}
