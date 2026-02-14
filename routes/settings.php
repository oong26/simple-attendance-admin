<?php

use App\Http\Controllers\Settings\AppearanceController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SettingsIndexController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::get('settings', SettingsIndexController::class)
        ->middleware('auth')
        ->name('settings.index');

    Route::get('settings/profile', [ProfileController::class, 'edit'])
        ->middleware('permission:settings.profile.view')
        ->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])
        ->middleware('permission:settings.profile.update')
        ->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])
        ->middleware('permission:settings.profile.update')
        ->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])
        ->middleware('permission:settings.password.update')
        ->name('user-password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware(['throttle:6,1', 'permission:settings.password.update'])
        ->name('user-password.update');

Route::get('settings/appearance', [AppearanceController::class, 'index'])
        ->middleware('permission:settings.appearance.update')
        ->name('appearance.edit');

    Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->middleware('permission:settings.2fa')
        ->name('two-factor.show');
});
