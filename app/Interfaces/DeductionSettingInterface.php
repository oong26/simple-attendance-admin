<?php

namespace App\Interfaces;

use App\Models\Setting;

interface DeductionSettingInterface {
    public function get($key, $default = null);
    public function set($key, $value);
    public function all();
}
