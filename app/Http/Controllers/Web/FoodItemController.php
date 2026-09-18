<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\FoodCategory;
use App\Models\FoodItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Inertia Food Items page — replaces the old /api food-items endpoints.
 * Image uploads arrive as multipart (Inertia switches to FormData when a File
 * is present; edits are POSTed with a _method=PUT spoof).
 */
class FoodItemController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        // Paginate + filter server-side (mirrors the Customers page); ->through()
        // maps each row to the shape the table needs while keeping the paginator.
        $items = FoodItem::with('foodCategory')
            ->when($search !== '', fn ($q) => $q->where(function ($w) use ($search) {
                $w->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhereHas('foodCategory', fn ($c) => $c->where('name', 'like', "%{$search}%"));
            }))
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString()
            ->through(fn ($item) => [
                'id' => $item->id,
                'foodcategory_id' => $item->foodcategory_id,
                'foodcategory_name' => $item->foodCategory?->name,
                'name' => $item->name,
                'image' => $item->image,
                'description' => $item->description,
                'code' => $item->code,
                'price' => $item->price,
                'status' => $item->status,
            ]);

        return Inertia::render('FoodItems', [
            'items' => $items,
            'categories' => FoodCategory::orderBy('name')->get(['id', 'name']),
            'filters' => ['search' => $search],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate($this->rules());
        if ($image = $request->file('image')) {
            $data['image'] = $this->uploadImage($image);
        }
        FoodItem::create($data);

        return back()->with('success', 'Food item created.');
    }

    public function update(Request $request, $id): RedirectResponse
    {
        $item = FoodItem::findOrFail($id);
        $data = $request->validate($this->rules($id));

        unset($data['image']);

        if ($request->hasFile('image')) {
            $data['image'] = $this->uploadImage($request->file('image'));
        }

        $item->update($data);

        return back()->with('success', 'Food item updated.');
    }

    public function destroy($id): RedirectResponse
    {
        FoodItem::findOrFail($id)->delete();

        return back()->with('success', 'Food item deleted.');
    }

    private function rules($id = null): array
    {
        return [
            'foodcategory_id' => 'required|exists:food_categories,id',
            'name' => 'required|string|max:255',
            'image' => $id
                ? 'nullable|image|mimes:jpeg,png,jpg,gif|max:8048'
                : 'required|image|mimes:jpeg,png,jpg,gif|max:8048',
            'description' => 'required|string',
            'code' => 'required|string|max:255|unique:food_items,code,'.($id ?? 'NULL').',id',
            'price' => 'required|numeric|min:0',
            'status' => 'required|boolean',
        ];
    }

    /** Store an uploaded image on the public disk, return its absolute URL. */
    private function uploadImage($image): string
    {
        $filename = date('YmdHis').'.'.$image->getClientOriginalExtension();
        Storage::disk('public')->putFileAs('images', $image, $filename);

        return asset('storage/images/'.$filename);
    }
}
