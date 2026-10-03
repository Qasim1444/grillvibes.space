<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Roles & the permission matrix. `is_locked` roles (Super Admin) are read-only:
 * that role is the escape hatch that keeps the app administrable, so it must
 * not be editable or deletable from the UI.
 */
class RoleController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        $roles = Role::query()
            ->withCount('users')
            ->with('permissions:id,key')
            ->when($search !== '', fn ($q) => $q->where(function ($w) use ($search) {
                $w->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            }))
            ->orderBy('id')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Role $role) => [
                'id' => $role->id,
                'name' => $role->name,
                'slug' => $role->slug,
                'description' => $role->description,
                'is_locked' => $role->is_locked,
                'users_count' => $role->users_count,
                'permission_ids' => $role->permissions->pluck('id'),
                'permissions_count' => $role->permissions->count(),
            ]);

        return Inertia::render('Roles', [
            'roles' => $roles,
            // The full catalogue drives the matrix modal; grouped client-side.
            'permissions' => Permission::orderBy('id')->get(['id', 'name', 'key', 'group']),
            'filters' => ['search' => $search],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);

        $role = Role::create([
            'name' => $data['name'],
            'slug' => Str::slug($data['name']),
            'description' => $data['description'] ?? null,
        ]);
        $role->permissions()->sync($data['permission_ids'] ?? []);

        return back()->with('success', 'Role created.');
    }

    public function update(Request $request, $id): RedirectResponse
    {
        $role = Role::findOrFail($id);

        if ($role->is_locked) {
            return back()->with('error', 'The Super Admin role cannot be modified.');
        }

        $data = $this->validated($request, $role->id);

        $role->update([
            'name' => $data['name'],
            'slug' => Str::slug($data['name']),
            'description' => $data['description'] ?? null,
        ]);
        $role->permissions()->sync($data['permission_ids'] ?? []);

        // Members carry a flattened copy of the matrix in cache.
        User::forgetPermissionCacheForRole($role);

        return back()->with('success', 'Role updated.');
    }

    public function destroy($id): RedirectResponse
    {
        $role = Role::findOrFail($id);

        if ($role->is_locked) {
            return back()->with('error', 'The Super Admin role cannot be deleted.');
        }

        if ($role->users()->exists()) {
            return back()->with('error', 'Reassign the users on this role before deleting it.');
        }

        $role->delete();

        return back()->with('success', 'Role deleted.');
    }

    /** @return array<string, mixed> */
    private function validated(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('roles', 'name')->ignore($ignoreId),
            ],
            'description' => 'nullable|string|max:500',
            'permission_ids' => 'array',
            'permission_ids.*' => 'integer|exists:permissions,id',
        ]);
    }
}
