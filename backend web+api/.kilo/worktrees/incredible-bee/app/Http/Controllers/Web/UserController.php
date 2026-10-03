<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Inertia Users page — replaces the old /api user-management endpoints.
 * Passwords are hashed; on update the password is only changed when provided.
 */
class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        $users = User::select('id', 'name', 'email', 'phone', 'address', 'created_at')
            ->with('roles:id,name', 'branches:id,name')
            ->when($search !== '', fn ($q) => $q->where(function ($w) use ($search) {
                $w->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            }))
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (User $user) => [
                ...$user->only('id', 'name', 'email', 'phone', 'address', 'created_at'),
                'role_ids' => $user->roles->pluck('id'),
                'role_names' => $user->roles->pluck('name')->implode(', '),
                'branch_ids' => $user->branches->pluck('id'),
                'branch_names' => $user->branches->pluck('name')->implode(', '),
            ]);

        return Inertia::render('Users', [
            'users' => $users,
            'roles' => Role::orderBy('name')->get(['id', 'name']),
            'branches' => Branch::where('status', true)->orderBy('name')->get(['id', 'name']),
            'filters' => ['search' => $search],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:1000',
            'password' => 'required|min:6',
            'role_ids' => 'array',
            'role_ids.*' => 'integer|exists:roles,id',
            'branch_ids' => 'array',
            'branch_ids.*' => 'integer|exists:branches,id',
        ]);
        $roleIds = $data['role_ids'] ?? [];
        $branchIds = $data['branch_ids'] ?? [];
        unset($data['role_ids'], $data['branch_ids']);

        $data['password'] = Hash::make($data['password']);
        $user = User::create($data);
        $user->syncRoles($roleIds);
        $user->branches()->sync($branchIds);

        return back()->with('success', 'User created.');
    }

    public function update(Request $request, $id): RedirectResponse
    {
        $user = User::findOrFail($id);
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,'.$id,
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:1000',
            'password' => 'nullable|min:6',
            'role_ids' => 'array',
            'role_ids.*' => 'integer|exists:roles,id',
            'branch_ids' => 'array',
            'branch_ids.*' => 'integer|exists:branches,id',
        ]);

        $user->name = $data['name'];
        $user->email = $data['email'];
        $user->phone = $data['phone'] ?? null;
        $user->address = $data['address'] ?? null;
        if ($request->filled('password')) {
            $user->password = Hash::make($data['password']);
        }
        $user->save();
        $user->syncRoles($data['role_ids'] ?? []);
        $user->branches()->sync($data['branch_ids'] ?? []);

        return back()->with('success', 'User updated.');
    }

    public function assignRoles(Request $request, $id): RedirectResponse
    {
        $user = User::findOrFail($id);

        $data = $request->validate([
            'role_ids'   => 'array',
            'role_ids.*' => 'integer|exists:roles,id',
        ]);

        $user->syncRoles($data['role_ids'] ?? []);

        return back()->with('success', 'Roles updated for ' . $user->name . '.');
    }

    public function destroy(Request $request, $id): RedirectResponse
    {
        $user = User::findOrFail($id);

        // Deleting yourself ends your own session mid-request; and removing the
        // last super admin would leave nobody able to administer roles.
        if ((int) $id === (int) $request->user()->id) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        if ($user->isSuperAdmin() && $this->superAdminCount() <= 1) {
            return back()->with('error', 'This is the only Super Admin — assign another before deleting.');
        }

        $user->forgetPermissionCache();
        $user->delete();

        return back()->with('success', 'User deleted.');
    }

    private function superAdminCount(): int
    {
        return User::whereHas('roles', fn ($q) => $q->where('slug', Role::SUPER_ADMIN))->count();
    }
}
