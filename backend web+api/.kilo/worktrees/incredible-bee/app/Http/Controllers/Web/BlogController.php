<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\BlogTag;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BlogController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        return Inertia::render('Blog', [
            'posts' => BlogPost::query()
                ->with(['author:id,name', 'categories:id,name', 'tags:id,name'])
                ->when($search !== '', fn ($query) => $query->where(function ($query) use ($search) {
                    $query->where('title', 'like', "%{$search}%")
                        ->orWhere('excerpt', 'like', "%{$search}%");
                }))
                ->latest()
                ->paginate(10)
                ->withQueryString(),
            'categories' => BlogCategory::active()->orderBy('name')->get(['id', 'name']),
            'tags' => BlogTag::orderBy('name')->get(['id', 'name']),
            'filters' => ['search' => $search],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        $data['slug'] = $this->uniqueSlug($data['title']);
        $post = BlogPost::create($data);
        $post->categories()->sync($data['category_ids'] ?? []);
        $post->tags()->sync($data['tag_ids'] ?? []);

        return back()->with('success', 'Blog post created.');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $post = BlogPost::findOrFail($id);
        $data = $this->validated($request);

        if ($data['title'] !== $post->title) {
            $data['slug'] = $this->uniqueSlug($data['title'], $post->id);
        }

        $post->update($data);
        $post->categories()->sync($data['category_ids'] ?? []);
        $post->tags()->sync($data['tag_ids'] ?? []);

        return back()->with('success', 'Blog post updated.');
    }

    public function destroy(int $id): RedirectResponse
    {
        BlogPost::findOrFail($id)->delete();

        return back()->with('success', 'Blog post deleted.');
    }

    public function storeCategory(Request $request): RedirectResponse
    {
        $data = $request->validate(['name' => 'required|string|max:255']);
        BlogCategory::create([
            'name' => $data['name'],
            'slug' => $this->uniqueTaxonomySlug(BlogCategory::class, $data['name']),
            'is_active' => true,
        ]);

        return back()->with('success', 'Blog category created.');
    }

    public function updateCategory(Request $request, int $id): RedirectResponse
    {
        $category = BlogCategory::findOrFail($id);
        $data = $request->validate(['name' => 'required|string|max:255']);
        $category->update([
            'name' => $data['name'],
            'slug' => $this->uniqueTaxonomySlug(BlogCategory::class, $data['name'], $category->id),
        ]);

        return back()->with('success', 'Blog category updated.');
    }

    public function destroyCategory(int $id): RedirectResponse
    {
        BlogCategory::findOrFail($id)->delete();

        return back()->with('success', 'Blog category deleted.');
    }

    public function storeTag(Request $request): RedirectResponse
    {
        $data = $request->validate(['name' => 'required|string|max:255']);
        BlogTag::create([
            'name' => $data['name'],
            'slug' => $this->uniqueTaxonomySlug(BlogTag::class, $data['name']),
        ]);

        return back()->with('success', 'Blog tag created.');
    }

    public function updateTag(Request $request, int $id): RedirectResponse
    {
        $tag = BlogTag::findOrFail($id);
        $data = $request->validate(['name' => 'required|string|max:255']);
        $tag->update([
            'name' => $data['name'],
            'slug' => $this->uniqueTaxonomySlug(BlogTag::class, $data['name'], $tag->id),
        ]);

        return back()->with('success', 'Blog tag updated.');
    }

    public function destroyTag(int $id): RedirectResponse
    {
        BlogTag::findOrFail($id)->delete();

        return back()->with('success', 'Blog tag deleted.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'nullable|string|max:1000',
            'body' => 'required|string',
            'featured_image' => 'nullable|string|max:255',
            'status' => 'required|in:draft,published,scheduled',
            'published_at' => 'nullable|date',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'integer|exists:blog_categories,id',
            'tag_ids' => 'nullable|array',
            'tag_ids.*' => 'integer|exists:blog_tags,id',
        ]);
    }

    private function uniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title) ?: 'post';
        $slug = $base;
        $suffix = 2;

        while (BlogPost::where('slug', $slug)
            ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
            ->exists()) {
            $slug = $base.'-'.$suffix++;
        }

        return $slug;
    }

    private function uniqueTaxonomySlug(string $model, string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name) ?: 'item';
        $slug = $base;
        $suffix = 2;

        while ($model::where('slug', $slug)
            ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
            ->exists()) {
            $slug = $base.'-'.$suffix++;
        }

        return $slug;
    }
}
