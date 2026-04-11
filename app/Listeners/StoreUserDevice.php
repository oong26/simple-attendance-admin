<?php

namespace App\Listeners;

use App\Services\DeviceService;
use Illuminate\Auth\Events\Authenticated;
use Illuminate\Support\Facades\DB;

class StoreUserDevice
{
    protected $deviceService;

    public function __construct(DeviceService $deviceService)
    {
        $this->deviceService = $deviceService;
    }

    public function handle(Authenticated $event)
    {
        \Log::info('Login listener');
        $device = $this->deviceService->detect();

        \Log::info('Session ID: '.session()->getId());
        DB::table('sessions')
            ->where('id', session()->getId())
            ->update(['device' => $device]);
    }
}
