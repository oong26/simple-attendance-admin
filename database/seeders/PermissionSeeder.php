<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            // Dashboard
            'dashboard.view',

            // Products
            'products.view',
            'products.create',
            'products.edit',
            'products.delete',

            // Users
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',

            // Roles
            'roles.view',
            'roles.create',
            'roles.edit',
            'roles.delete',

            // Permissions
            'permissions.view',

            // Sessions
            'sessions.view',
            'sessions.deactivate',

            // API Sessions
            'api-sessions.view',
            'api-sessions.deactivate',

            // API Keys
            'api-keys.view',
            'api-keys.create',
            'api-keys.edit',
            'api-keys.delete',

            // Settings
            'settings.profile.view',
            'settings.profile.update',
            'settings.profile.delete',
            'settings.password.update',
            'settings.2fa',
            'settings.appearance.update',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission, 'guard_name' => 'web']);
        }
    }
}
