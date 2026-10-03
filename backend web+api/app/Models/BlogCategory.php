<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * A curated blog category.
 *
 * Distinct from {@see FoodCategory}, which organises the sellable menu. This one
 * organises articles, and the two are renamed for different reasons.
 */
class BlogCategory extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['name', 'slug', 'description', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function posts(): BelongsToMany
    {
        return $this->belongsToMany(BlogPost::class, 'blog_category_post', 'category_id', 'post_id');
    }

    /** Posts the public may actually read — used for public category counts. */
    public function publishedPosts(): BelongsToMany
    {
        return $this->posts()->published();
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
