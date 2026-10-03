<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Route guard for a permission key: ->middleware('can.access:hr.payroll.view').
 * Several keys may be passed and any one of them grants access, which lets a
 * route be reachable from more than one module (e.g. POS needs orders.create).
 *
 * Hiding a sidebar link is cosmetic; this is what actually blocks a typed URL.
 */
class EnsurePermission
{
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        $user = $request->user();

        if (! $user) {
            abort(403);
        }

        foreach ($permissions as $permission) {
            if ($user->hasPermission($permission)) {
                return $next($request);
            }
        }

        abort(403, 'You do not have permission to access this page.');
    }
}
