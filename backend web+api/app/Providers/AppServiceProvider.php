<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Every permission key works as a Gate ability without defining each one.
        // Returning null (rather than false) on a miss lets any explicitly
        // defined gate/policy still have its say.
        Gate::before(function (User $user, string $ability) {
            return $user->hasPermission($ability) ?: null;
        });
    }
}
