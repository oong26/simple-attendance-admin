<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        \Illuminate\Auth\Events\Authenticated::class => [
            \App\Listeners\StoreUserDevice::class,
        ],
    ];

    public function boot(): void
    {
        //
    }
}
