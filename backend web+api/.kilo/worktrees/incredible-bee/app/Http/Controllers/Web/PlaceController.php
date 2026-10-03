<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Place;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Inertia Places page — replaces the old /api places endpoints.
 * CRUD actions redirect back with a flash message; Inertia refreshes the props.
 */
class PlaceController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        $places = Place::query()
            ->with('branch:id,name')
            ->when($search !== '', fn ($q) => $q->where('name', 'like', "%{$search}%"))
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Places', [
            'places' => $places->through(fn (Place $place) => [
                'id' => $place->id,
                'name' => $place->name,
                'branch_id' => $place->branch_id,
                'branch_name' => $place->branch?->name,
                'status' => $place->status,
            ]),
            'branches' => Branch::query()->orderBy('name')->get(['id', 'name']),
            'filters' => ['search' => $search],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Place::create($request->validate($this->rules()));

        return back()->with('success', 'Place created.');
    }

    public function update(Request $request, $id): RedirectResponse
    {
        Place::findOrFail($id)->update($request->validate($this->rules()));

        return back()->with('success', 'Place updated.');
    }

    public function destroy($id): RedirectResponse
    {
        Place::findOrFail($id)->delete();

        return back()->with('success', 'Place deleted.');
    }

    private function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'branch_id' => 'required|exists:branches,id',
            'status' => 'required|boolean',
        ];
    }
}
