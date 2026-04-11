<?php

namespace App\Repositories;

use App\Interfaces\SettingInterface;
use App\Models\Setting;

class SettingRepository implements SettingInterface
{
    public function get($key, $default = null)
    {
        return Setting::where('key', $key)->value('value') ?? $default;
    }

    public function set($key, $value)
    {
        return Setting::updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );
    }

    public function all()
    {
        return Setting::all()->pluck('value', 'key');
    }
}
