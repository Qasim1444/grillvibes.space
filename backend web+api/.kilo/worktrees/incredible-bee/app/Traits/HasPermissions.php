<?php

namespace App\Traits;

use App\Models\Role;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

/**
 * Role/permission helpers for User. Permission keys are resolved once per
 * request (in-memory) and cached across requests, since every page render
 * ships them to Inertia and every guarded route checks them.
 */
trait HasPermissions
{
    /** In-memory memo so a single request resolves the key set only once. */
    protected ?Collection $permissionKeyCache = null;

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class);
    }

    /**
     * Flat list of every permission key granted through the user's roles.
     *
     * @return Collection<int, string>
     */
    public function allPermissionKeys(): Collection
    {
        if ($this->permissionKeyCache !== null) {
            return $this->permissionKeyCache;
        }

        $keys = Cache::remember(
            self::permissionCacheKey($this->getKey()),
            now()->addHours(6),
            fn () => $this->roles()
                ->with('permissions:id,key')
                ->get()
                ->pluck('permissions')
                ->flatten()
                ->pluck('key')
                ->unique()
                ->values()
                ->all()
        );

        return $this->permissionKeyCache = collect($keys);
    }

    /** @return Collection<int, string> */
    public function roleSlugs(): Collection
    {
        return $this->roles()->pluck('slug');
    }

    public function hasRole(string $slug): bool
    {
        return $this->roleSlugs()->contains($slug);
    }

    public function isSuperAdmin(): bool
    {
        return $this->hasRole(Role::SUPER_ADMIN);
    }

    public function hasPermission(string $key): bool
    {
        // Super admin bypasses the matrix entirely — new permissions added by a
        // later migration are granted without re-seeding the pivot.
        if ($this->isSuperAdmin()) {
            return true;
        }

        return $this->allPermissionKeys()->contains($key);
    }

    /**
     * Replace the user's roles and drop the cached key set.
     *
     * @param  array<int, int|string>  $roleIds
     */
    public function syncRoles(array $roleIds): void
    {
        $this->roles()->sync($roleIds);
        $this->forgetPermissionCache();
    }

    public function assignRole(Role $role): void
    {
        $this->roles()->syncWithoutDetaching([$role->getKey()]);
        $this->forgetPermissionCache();
    }

    public function forgetPermissionCache(): void
    {
        $this->permissionKeyCache = null;
        Cache::forget(self::permissionCacheKey($this->getKey()));
    }

    public static function permissionCacheKey(int|string $userId): string
    {
        return "user.{$userId}.permissions";
    }

    /**
     * Flush every member of a role — used after the role's permission matrix
     * changes, since each user caches a flattened copy of it.
     */
    public static function forgetPermissionCacheForRole(Role $role): void
    {
        $role->users()->pluck('users.id')->each(
            fn ($id) => Cache::forget(self::permissionCacheKey($id))
        );
    }
}
