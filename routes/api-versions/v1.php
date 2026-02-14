<?php

use App\Http\Controllers\API\v1\AuthController;
use Illuminate\Support\Facades\Route;

Route::middleware(['api-key'])
    ->prefix('v1')
    ->group(function () {

        Route::post('/register', [AuthController::class, 'register'])
            ->middleware('throttle:register');

        Route::post('/login', [AuthController::class, 'login'])
            ->middleware('throttle:login');

        Route::middleware('auth:sanctum')->group(function () {
            Route::get('/profile', [AuthController::class, 'profile']);
            Route::post('/logout', [AuthController::class, 'logout']);

            // Attendance Routes
            Route::post('/attendance/clock-in', [\App\Http\Controllers\API\v1\AttendanceController::class, 'clockIn']);
            Route::post('/attendance/clock-out', [\App\Http\Controllers\API\v1\AttendanceController::class, 'clockOut']);
        });

    });