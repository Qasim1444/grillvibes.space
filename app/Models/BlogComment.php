<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BlogComment extends Model
{
    protected $fillable = ['blog_post_id', 'parent_id', 'user_id', 'author_name', 'author_email', 'body', 'is_approved'];

    protected $casts = ['is_approved' => 'boolean'];

    public function post(): BelongsTo { return $this->belongsTo(BlogPost::class, 'blog_post_id'); }
    public function parent(): BelongsTo { return $this->belongsTo(self::class, 'parent_id'); }
    public function replies(): HasMany { return $this->hasMany(self::class, 'parent_id')->oldest(); }
}
