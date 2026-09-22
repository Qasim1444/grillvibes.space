<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\FoodCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Inertia Food Categories page — replaces the old /api food-categories endpoints.
 * Slugs are auto-generated from the name (kept unique), mirroring the old trait.
 */
class FoodCategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        // Paginate + filter server-side (mirrors the Customers page) so the table
        // requests one slice at a time instead of loading every category.
        $categories = FoodCategory::query()
            ->when($search !== '', fn ($q) => $q->where('name', 'like', "%{$search}%"))
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('FoodCategories', [
            'categories' => $categories,
            'filters' => ['search' => $search],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate($this->rules());
        $data['slug'] = $this->uniqueSlug($data['name']);
        FoodCategory::create($data);

        return back()->with('success', 'Category created.');
    }

    public function update(Request $request, $id): RedirectResponse
    {
        $category = FoodCategory::findOrFail($id);
        $data = $request->validate($this->rules());
        if ($data['name'] !== $category->name) {
            $data['slug'] = $this->uniqueSlug($data['name'], $id);
        }
        $category->update($data);

        return back()->with('success', 'Category updated.');
    }

    public function destroy($id): RedirectResponse
    {
        FoodCategory::findOrFail($id)->delete();

        return back()->with('success', 'Category deleted.');
    }

    private function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'status' => 'required|boolean',
        ];
    }

    /** Slugify $name, appending -2, -3, … until unique (ignoring $ignoreId). */
    private function uniqueSlug(string $name, $ignoreId = null): string
    {
        $base = Str::slug($name) ?: 'category';
        $slug = $base;
        $i = 2;
        while (
            FoodCategory::where('slug', $slug)
                ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }
}
