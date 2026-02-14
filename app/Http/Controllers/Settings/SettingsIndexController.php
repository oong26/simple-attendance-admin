<?php

namespace App\Http\Controllers\Settings;

use Illuminate\Http\Request;

class SettingsIndexController
{
    public function __invoke(Request $request)
    {
        $user = $request->user();

        // List of settings routes in priority order:
        $routes = [
            ['permission' => 'settings.profile.view', 'route' => 'profile.edit'],
            ['permission' => 'settings.password.update', 'route' => 'user-password.edit'],
            ['permission' => 'settings.2fa', 'route' => 'two-factor.show'],
            ['permission' => 'settings.appearance.update', 'route' => 'appearance.edit'],
        ];
    
        foreach ($routes as $item) {
            if ($user->can($item['permission'])) {
                \Log::info('go route: ' . $item['route']);
                return redirect()->route($item['route']);
            }
        }

        // If user has NO settings permissions at all
        abort(403, 'You do not have permission to access settings.');
    }
}
