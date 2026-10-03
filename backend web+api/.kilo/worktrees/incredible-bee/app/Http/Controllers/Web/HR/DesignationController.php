<?php

namespace App\Http\Controllers\Web\HR;

use App\Http\Controllers\Controller;
use App\Models\Designation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class DesignationController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        $designations = Designation::query()
            ->withCount('employees')
            ->when($search !== '', fn ($q) => $q->where('name', 'like', "%{$search}%"))
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('HR/Designations', [
            'designations' => $designations,
            'filters' => ['search' => $search],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Designation::create($this->validated($request));

        return redirect()->back()->with('success', 'Designation created.');
    }

    public function update(Request $request, $id): RedirectResponse
    {
        $designation = Designation::findOrFail($id);
        $designation->update($this->validated($request, (int) $id));

        return redirect()->back()->with('success', 'Designation updated.');
    }

    public function destroy($id): RedirectResponse
    {
        $designation = Designation::findOrFail($id);

        // The FK is nullOnDelete, so deleting would silently un-title staff.
        if ($designation->employees()->exists()) {
            return redirect()->back()->with('error', 'This designation is assigned to employees — reassign them first.');
        }

        $designation->delete();

        return redirect()->back()->with('success', 'Designation deleted.');
    }

    private function validated(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('designations', 'name')->ignore($ignoreId)],
            'description' => ['nullable', 'string', 'max:255'],
        ]);
    }
}
