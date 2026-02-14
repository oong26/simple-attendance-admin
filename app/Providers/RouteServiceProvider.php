<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class RouteServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        RateLimiter::for('api', function ($request) {
            return Limit::perMinute(60)->by($request->ip());
        });

        RateLimiter::for('register', function ($request) {
            return Limit::perMinute(3)->by($request->ip());
        });

        RateLimiter::for('login', function ($request) {
            return Limit::perMinute(10)->by($request->ip());
        });
    }
}
