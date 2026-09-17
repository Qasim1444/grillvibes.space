<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use App\Support\CurrentBranch;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'branding' => function () use ($request) {
                $logo = $request->user() ? Setting::orderBy('id')->value('logo') : null;

                return ['logo' => $logo ? asset($logo) : null];
            },
            'auth' => [
                'user' => $request->user()
                    ? $request->user()->only('id', 'name', 'email', 'phone', 'address')
                    : null,
                // Drives sidebar filtering and v-if guards on action buttons via
                // the usePermissions() composable. Backed by a per-user cache.
                'permissions' => fn () => $request->user()?->allPermissionKeys() ?? [],
                'roles' => fn () => $request->user()?->roleSlugs() ?? [],
                // The outlet the UI is currently scoped to. Null before any
                // branch exists (fresh install pre-seed).
                'branch' => fn () => $request->user() ? CurrentBranch::get() : null,
            ],
            // Outlets available in the topbar switcher.
            'branches' => fn () => $request->user() ? CurrentBranch::all() : [],
            // One-off messages surfaced after redirects (e.g. after a save/delete).
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
