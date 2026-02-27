<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ApiKeyController;
use App\Http\Controllers\DeductionSettingController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\Systems\ApiSessionController;
use App\Http\Controllers\Systems\SessionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\HolidayController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\LateDeductionRuleController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect('/login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)
        ->middleware('permission:dashboard.view')
        ->name('dashboard');

    // Departments
    Route::resource('departments', DepartmentController::class);

    // Employees
    Route::resource('employees', EmployeeController::class);
    Route::post('employees/{employee}/face', [EmployeeController::class, 'updateFace'])
        ->name('employees.update-face');
    Route::post('employees/{employee}/verify-face', [EmployeeController::class, 'verifyFace'])->name('employees.verify-face');
    Route::post('employees/verify-face-global', [EmployeeController::class, 'verifyFaceGlobal'])->name('employees.verify-face-global');

    // Holidays
    Route::resource('holidays', HolidayController::class);
    Route::post('/holidays/synchronize', [HolidayController::class, 'synchronize'])
        ->name('holidays.synchronize');

    // Attendance
    Route::get('attendances', [AttendanceController::class, 'index'])
        ->middleware('permission:attendances.view')
        ->name('attendances.index');
    Route::get('attendances/leave', [AttendanceController::class, 'create'])
        ->middleware('permission:attendances.create')
        ->name('attendances.create');
    Route::post('attendances/leave', [AttendanceController::class, 'storeLeave'])
        ->middleware('permission:attendances.create')
        ->name('attendances.store-leave');
    Route::get('attendances/{attendance}/edit', [AttendanceController::class, 'edit'])
        ->middleware('permission:attendances.edit')
        ->name('attendances.edit');
    Route::put('attendances/{attendance}', [AttendanceController::class, 'update'])
        ->middleware('permission:attendances.edit')
        ->name('attendances.update');
    Route::get('attendance/monitor', [AttendanceController::class, 'monitor'])
        ->middleware('permission:monitor.view')
        ->name('attendance.monitor');
    Route::delete('attendances/{attendance}', [AttendanceController::class, 'destroy'])
        ->middleware('permission:attendances.delete')
        ->name('attendances.destroy');

    // Late Deduction
    Route::resource('late-deductions', LateDeductionRuleController::class)
        ->except(['create', 'show', 'edit']);

    // Reports
    Route::prefix('reports')
        ->name('reports.')
        ->group(function () {
            Route::get('monthly-attendance', [ReportController::class, 'monthlyAttendance'])
                ->middleware('permission:monthly-report.view')
                ->name('monthly-attendance');
        });

    // Users
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

    // Roles
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

    // API Keys
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
