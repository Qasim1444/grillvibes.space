<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use App\Models\BlogComment;
use App\Models\BlogTag;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicBlogController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $tag = trim((string) $request->query('tag', ''));
        $published = fn ($query) => $query->published();

        return Inertia::render('PublicBlog', [
            'posts' => BlogPost::query()
                ->published()
                ->with(['categories:id,name', 'tags:id,name,slug'])
                ->when($search !== '', fn ($query) => $query->where(function ($query) use ($search) {
                    $query->where('title', 'like', "%{$search}%")
                        ->orWhere('excerpt', 'like', "%{$search}%")
                        ->orWhere('body', 'like', "%{$search}%");
                }))
                ->when($tag !== '', fn ($query) => $query->whereHas('tags', fn ($query) => $query->where('slug', $tag)))
                ->latest('published_at')
                ->get(['id', 'title', 'slug', 'excerpt', 'body', 'featured_image', 'published_at']),
            'recentPosts' => BlogPost::query()
                ->published()
                ->latest('published_at')
                ->take(5)
                ->get(['id', 'title', 'slug', 'published_at']),
            'tags' => BlogTag::query()
                ->whereHas('posts', $published)
                ->orderBy('name')
                ->get(['id', 'name', 'slug']),
            'filters' => ['search' => $search, 'tag' => $tag],
        ]);
    }

    public function show(string $slug): Response
    {
        $post = BlogPost::query()
            ->published()
            ->with(['categories:id,name', 'tags:id,name,slug', 'author:id,name', 'comments.replies'])
            ->where('slug', $slug)
            ->firstOrFail();

        $recentPosts = BlogPost::query()
            ->published()
            ->where('id', '!=', $post->id)
            ->latest('published_at')
            ->take(5)
            ->get(['id', 'title', 'slug', 'published_at']);

        return Inertia::render('PublicBlogPost', [
            'post' => $post,
            'recentPosts' => $recentPosts,
        ]);
    }

    public function comment(Request $request, string $slug): \Illuminate\Http\RedirectResponse
    {
        $post = BlogPost::published()->where('slug', $slug)->firstOrFail();
        $data = $request->validate([
            'author_name' => ['required', 'string', 'max:100'],
            'author_email' => ['nullable', 'email', 'max:255'],
            'body' => ['required', 'string', 'max:2000'],
            'parent_id' => ['nullable', 'integer', 'exists:blog_comments,id'],
        ]);
        if (!empty($data['parent_id']) && !BlogComment::whereKey($data['parent_id'])->where('blog_post_id', $post->id)->exists()) {
            abort(422, 'That comment does not belong to this post.');
        }
        BlogComment::create([...$data, 'blog_post_id' => $post->id, 'user_id' => auth()->id()]);
        return back()->with('success', $data['parent_id'] ? 'Reply posted.' : 'Comment posted.');
    }
}
