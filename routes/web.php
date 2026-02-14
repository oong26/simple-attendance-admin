<?php

use App\Http\Controllers\ApiKeyController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\Systems\ApiSessionController;
use App\Http\Controllers\Systems\SessionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\ShiftController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\HolidayController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\SettingController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect('/login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Departments
    Route::resource('departments', DepartmentController::class);

    // Shifts
    Route::resource('shifts', ShiftController::class);

    // Employees
    Route::resource('employees', EmployeeController::class);

    // Holidays
    Route::resource('holidays', HolidayController::class);

    // Attendance
    Route::get('attendances', [AttendanceController::class, 'index'])->name('attendances.index');
    Route::get('attendance/monitor', [AttendanceController::class, 'monitor'])->name('attendance.monitor');

    // Settings
    Route::get('settings', [SettingController::class, 'index'])->name('settings.index');
    Route::post('settings', [SettingController::class, 'update'])->name('settings.update');

    Route::prefix('products')
        ->name('products.')
        ->group(function () {
            Route::get('', [ProductController::class, 'index'])
                ->middleware('permission:products.view')
                ->name('index');
            Route::get('/create', [ProductController::class, 'create'])
                ->middleware('permission:products.create')
                ->name('create');
            Route::post('', [ProductController::class, 'store'])
                ->middleware('permission:products.create')
                ->name('store');
            Route::get('/{product}', [ProductController::class, 'show'])
                ->middleware('permission:products.view')
                ->name('show');
            Route::get('/{product}/edit', [ProductController::class, 'edit'])
                ->middleware('permission:products.edit')
                ->name('edit');
            Route::put('/{product}', [ProductController::class, 'update'])
                ->middleware('permission:products.edit')
                ->name('update');
            Route::delete('/{product}', [ProductController::class, 'destroy'])
                ->middleware('permission:products.delete')
                ->name('destroy');
        });
    Route::prefix('users')
        ->name('users.')
        ->group(function () {
            Route::get('', [UserController::class, 'index'])
                ->middleware('permission:users.view')
                ->name('index');
            Route::get('/create', [UserController::class, 'create'])
                ->middleware('permission:users.create')
                ->name('create');
            Route::post('', [UserController::class, 'store'])
                ->middleware('permission:users.create')
                ->name('store');
            Route::get('/{user}', [UserController::class, 'show'])
                ->middleware('permission:users.view')
                ->name('show');
            Route::get('/{user}/edit', [UserController::class, 'edit'])
                ->middleware('permission:users.edit')
                ->name('edit');
            Route::put('/{user}', [UserController::class, 'update'])
                ->middleware('permission:users.edit')
                ->name('update');
            Route::delete('/{user}', [UserController::class, 'destroy'])
                ->middleware('permission:users.delete')
                ->name('destroy');
        });
    Route::prefix('roles')
        ->name('roles.')
        ->group(function () {
            Route::get('', [RoleController::class, 'index'])
                ->middleware('permission:roles.view')
                ->name('index');
            Route::get('/create', [RoleController::class, 'create'])
                ->middleware('permission:roles.create')
                ->name('create');
            Route::post('', [RoleController::class, 'store'])
                ->middleware('permission:roles.create')
                ->name('store');
            Route::get('/{role}', [RoleController::class, 'show'])
                ->middleware('permission:roles.view')
                ->name('show');
            Route::get('/{role}/edit', [RoleController::class, 'edit'])
                ->middleware('permission:roles.edit')
                ->name('edit');
            Route::put('/{role}', [RoleController::class, 'update'])
                ->middleware('permission:roles.edit')
                ->name('update');
            Route::delete('/{role}', [RoleController::class, 'destroy'])
                ->middleware('permission:roles.delete')
                ->name('destroy');
        });
    Route::prefix('api-keys')
        ->name('api-keys.')
        ->group(function () {
            Route::get('', [ApiKeyController::class, 'index'])
                ->middleware('permission:api-keys.view')
                ->name('index');
            Route::get('/create', [ApiKeyController::class, 'create'])
                ->middleware('permission:api-keys.create')
                ->name('create');
            Route::post('', [ApiKeyController::class, 'store'])
                ->middleware('permission:api-keys.create')
                ->name('store');
            Route::get('/{api}', [ApiKeyController::class, 'show'])
                ->middleware('permission:api-keys.view')
                ->name('show');
            Route::get('/{api}/edit', [ApiKeyController::class, 'edit'])
                ->middleware('permission:api-keys.edit')
                ->name('edit');
            Route::put('/{api}', [ApiKeyController::class, 'update'])
                ->middleware('permission:api-keys.edit')
                ->name('update');
            Route::delete('/{api}', [ApiKeyController::class, 'destroy'])
                ->middleware('permission:api-keys.delete')
                ->name('destroy');
        });
    Route::patch('/api-keys/{id}/toggle', [ApiKeyController::class, 'toggle'])
        ->middleware('permission:api-keys.edit')
        ->name('api-keys.toggle');
    Route::put('/api-keys/{id}/regenerate', [ApiKeyController::class, 'regenerate'])
        ->middleware('permission:api-keys.edit')
        ->name('api-keys.regenerate');
    Route::prefix('session')
        ->name('session.')
        ->group(function() {
            Route::get('', [SessionController::class, 'index'])
                ->middleware('permission:sessions.view')
                ->name('index');
            Route::delete('/{id}/deactivate', [SessionController::class, 'deactivate'])
                ->middleware('permission:sessions.deactivate')
                ->name('deactivate');
        });
    Route::prefix('api-session')
        ->name('api-session.')
        ->group(function() {
            Route::get('', [ApiSessionController::class, 'index'])
                ->middleware('permission:api-sessions.view')
                ->name('index');
            Route::delete('/{id}/deactivate', [ApiSessionController::class, 'deactivate'])
                ->middleware('permission:api-sessions.deactivate')
                ->name('deactivate');
        });
});

require __DIR__.'/settings.php';
