<?php

use App\Http\Controllers\API\V1\AttendanceController;
use App\Http\Controllers\API\V1\AuthController;
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
        });

        // Attendance Routes
        Route::prefix('attendance')
            ->group(function () {
                Route::post('/clock-in', [AttendanceController::class, 'clockIn']);
                Route::post('/clock-out', [AttendanceController::class, 'clockOut']);
                Route::post('/clock-by-face', [AttendanceController::class, 'clockByFace']);
                Route::post('/clock-by-qrcode', [AttendanceController::class, 'clockByQrcode']);
                Route::get('/history', [AttendanceController::class, 'history']);
                Route::get('/today', [AttendanceController::class, 'today']);
                Route::get('/department', [AttendanceController::class, 'department']);
            });

    });
