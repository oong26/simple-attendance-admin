<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $superadmin = Role::where('name', 'superadmin')->first();
        $admin      = Role::where('name', 'admin')->first();
        $staff      = Role::where('name', 'staff')->first();

        /** 
         * SUPERADMIN = ALL PERMISSIONS 
         */
        $superadmin->syncPermissions(Permission::all());

        /**
         * ADMIN PERMISSIONS 
         * Can view + manage users, roles, API keys, sessions, settings
         * But cannot edit permissions themselves (security practice)
         */
        $adminPermissions = [
            'dashboard.view',

            'monitor.view',

            'departments.view',
            'departments.create',
            'departments.edit',
            'departments.delete',

            'employees.view',
            'employees.create',
            'employees.edit',
            'employees.delete',

            'holidays.view',
            'holidays.create',
            'holidays.edit',
            'holidays.delete',

            'attendances.view',
            'attendances.create',
            'attendances.edit',
            'attendances.delete',

            'monthly-report.view',

            'users.view',
            'users.create',
            'users.edit',
            'users.delete',

            'late-deductions.view',
            'late-deductions.create',
            'late-deductions.delete',

            'roles.view',
            'roles.create',
            'roles.edit',
            'roles.delete',

            'sessions.view',
            'sessions.deactivate',

            'api-sessions.view',
            'api-sessions.deactivate',

            'settings.profile.view',
            'settings.profile.update',
            'settings.profile.delete',
            'settings.password.update',
            'settings.2fa',
            'settings.appearance.update',
        ];

        $admin->syncPermissions($adminPermissions);

        /**
         * STAFF PERMISSIONS 
         * Usually limited to viewing data + maybe editing profile
         */
        $staffPermissions = [
            'dashboard.view',

            'settings.profile.view',
            'settings.profile.update',
            'settings.profile.delete',
            'settings.password.update',
        ];

        $staff->syncPermissions($staffPermissions);
    }
}
