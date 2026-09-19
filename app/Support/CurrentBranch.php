<?php

namespace App\Support;

use App\Models\Branch;
use App\Models\User;
use Illuminate\Support\Collection;

/**
 * Resolves the outlet (branch) the current request operates on.
 *
 * The active branch is kept in the session so it survives across page loads.
 * Every branch-scoped query (KDS, reports, HR, finance) reads id()
 * to filter to a single outlet; the topbar switcher writes it via set().
 */
class CurrentBranch
{
    private const SESSION_KEY = 'current_branch_id';

    /** In-request memo so a single request resolves the branch only once. */
    private static ?int $memo = null;

    /**
     * The active branch id. Falls back to the first active branch (then any
     * branch) so a fresh session or a deleted selection never yields null
     * when at least one outlet exists.
     */
    public static function id(): ?int
    {
        if (self::$memo !== null) {
            return self::$memo;
        }

        $selected = session(self::SESSION_KEY);

        $available = self::all();

        if ($selected && $available->contains('id', (int) $selected)) {
            return self::$memo = (int) $selected;
        }

        $fallback = $available->firstWhere('status', true)?->id
            ?? $available->first()?->id;

        return self::$memo = $fallback ? (int) $fallback : null;
    }

    /** The active Branch model, or null when no outlet exists yet. */
    public static function get(): ?Branch
    {
        $id = self::id();

        return $id ? Branch::find($id) : null;
    }

    /** Persist the user's outlet choice for subsequent requests. */
    public static function set(int $branchId): void
    {
        session([self::SESSION_KEY => $branchId]);
        self::$memo = $branchId;
    }

    /**
     * Branches available in the switcher (active first, then by name).
     *
     * @return Collection<int, Branch>
     */
    public static function all(): Collection
    {
        $user = auth()->user();

        $query = Branch::orderByDesc('status')->orderBy('name');

        if ($user instanceof User && ! $user->isSuperAdmin() && $user->branches()->exists()) {
            $query->whereIn('id', $user->branches()->select('branches.id'));
        }

        return $query->get(['id', 'name', 'status']);
    }

    /** Clear the in-request memo (test isolation). */
    public static function flush(): void
    {
        self::$memo = null;
    }
}
