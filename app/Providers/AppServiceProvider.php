<?php

namespace App\Providers;

use App\Interfaces\ApiKeyInterface;
use App\Interfaces\ApiSessionInterface;
use App\Interfaces\ProductInterface;
use App\Interfaces\RolePermissionInterface;
use App\Interfaces\SessionInterface;
use App\Interfaces\UserInterface;
use App\Repositories\ApiKeyRepository;
use App\Repositories\ApiSessionRepository;
use App\Repositories\ProductRepository;
use App\Repositories\RolePermissionRepository;
use App\Repositories\SessionRepository;
use App\Repositories\UserRepository;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(ProductInterface::class, ProductRepository::class);
        $this->app->bind(UserInterface::class, UserRepository::class);
        $this->app->bind(SessionInterface::class, SessionRepository::class);
        $this->app->bind(ApiSessionInterface::class, ApiSessionRepository::class);
        $this->app->bind(ApiKeyInterface::class, ApiKeyRepository::class);
        $this->app->bind(RolePermissionInterface::class, RolePermissionRepository::class);

        // Attendance System
        $this->app->bind(\App\Interfaces\DepartmentInterface::class, \App\Repositories\DepartmentRepository::class);
        $this->app->bind(\App\Interfaces\ShiftInterface::class, \App\Repositories\ShiftRepository::class);
        $this->app->bind(\App\Interfaces\EmployeeInterface::class, \App\Repositories\EmployeeRepository::class);
        $this->app->bind(\App\Interfaces\HolidayInterface::class, \App\Repositories\HolidayRepository::class);
        $this->app->bind(\App\Interfaces\AttendanceInterface::class, \App\Repositories\AttendanceRepository::class);
        $this->app->bind(\App\Interfaces\SettingInterface::class, \App\Repositories\SettingRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
