<?php

use App\Services\LoyaltyService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/**
 * Sweeps loyalty lots past their `expires_at`. Harmless to run when
 * `points_expiry_days` is 0 — nothing carries an expiry date then.
 */
Artisan::command('loyalty:expire', function (LoyaltyService $loyalty) {
    $points = $loyalty->expireDuePoints();

    $this->info($points > 0 ? "Expired {$points} loyalty point(s)." : 'No loyalty points were due to expire.');
})->purpose('Write off loyalty points whose expiry date has passed');

Schedule::command('loyalty:expire')->dailyAt('00:20');
