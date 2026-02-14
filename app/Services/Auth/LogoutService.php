<?php

namespace App\Services\Auth;

class LogoutService
{
    public function handle($user)
    {
        $user->currentAccessToken()->delete();
    }
}
