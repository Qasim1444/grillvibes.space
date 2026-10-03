<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * A free-form blog tag, created inline while writing a post.
 *
 * No soft deletes and no active flag: an unwanted tag is simply removed. There
 * is nothing worth preserving in a label that was never curated.
 */
class BlogTag extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug'];

    public function posts(): BelongsToMany
    {
        return $this->belongsToMany(BlogPost::class, 'blog_post_tag', 'tag_id', 'post_id');
    }

    public function publishedPosts(): BelongsToMany
    {
        return $this->posts()->published();
    }
}
