<?php

namespace App\Http\Controllers;

use App\Models\FoodCategory;
use App\Models\FoodItem;
use App\Models\DiningTable;
use App\Models\BlogPost;
use App\Models\Reservation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class HomeController extends Controller
{
    /**
     * Public marketing landing page.
     *
     * The site root serves the marketing site to signed-out visitors.
     * Authenticated users don't need the marketing pitch, so they are sent
     * straight to their dashboard.
     */
    public function index(Request $request)
    {
        if (Auth::check()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('HomePage', $this->publicMenu());
    }

    public function product()
    {
        return Inertia::render('ProductPage', $this->publicMenu());
    }

    public function storeReservation(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'dining_table_id' => 'required|integer|exists:dining_tables,id',
              'guest_name' => 'required|string|max:255',
              'guest_phone' => 'nullable|string|max:50',
              'guest_email' => 'required|email|max:255',
              'party_size' => 'required|integer|min:1|max:20',
              'reserved_at' => 'required|date|after_or_equal:now',
              'duration_minutes' => 'nullable|integer|min:15|max:480',
              'occasion' => 'nullable|string|max:255',
              'notes' => 'nullable|string',
        ]);

        $table = DiningTable::findOrFail($data['dining_table_id']);
        if (! $table->is_active || ! $table->isAvailable() || $table->capacity < $data['party_size']) {
            throw ValidationException::withMessages([
                'dining_table_id' => 'Please choose an available table that fits your party.',
            ]);
        }

        Reservation::create([
            ...$data,
            'status' => 'pending',
            'source' => 'online',
        ]);

        return back()->with('success', 'Reservation request received.');
    }

    private function publicMenu(): array
    {
        return [
            'categories' => FoodCategory::query()
                ->where('status', true)
                ->orderBy('name')
                ->get(['id', 'name', 'slug']),
            'foodItems' => FoodItem::query()
                ->with('foodCategory:id,name,slug')
                ->where('status', true)
                ->orderBy('name')
                ->get(['id', 'foodcategory_id', 'name', 'description', 'price', 'image']),
            'tables' => DiningTable::query()
                ->where('is_active', true)
                ->orderBy('table_number')
                ->get(['id', 'table_number', 'capacity', 'shape', 'status']),
            'blogPosts' => BlogPost::query()
                ->published()
                ->with(['categories:id,name'])
                ->latest('published_at')
                ->take(3)
                ->get(['id', 'title', 'slug', 'excerpt', 'body', 'featured_image', 'published_at']),
            // Published customer reviews for the public testimonials section
            'feedback' => \App\Models\Feedback::query()
                ->where('is_published', true)
                ->with('customer:id,name')
                ->orderByDesc('id')
                ->take(6)
                ->get(['id', 'customer_id', 'rating', 'comment', 'created_at']),
        ];
    }
}
