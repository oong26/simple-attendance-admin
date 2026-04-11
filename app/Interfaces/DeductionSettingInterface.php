<?php

namespace App\Interfaces;

interface DeductionSettingInterface
{
    public function get($key, $default = null);

    public function set($key, $value);

    public function all();
}
