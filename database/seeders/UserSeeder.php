<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $password = Hash::make('12345678');

        $superadmin = User::firstOrCreate([
            'name' => 'Superadmin',
            'email' => 'superadmin@mail.com',
            'password' => $password,
        ]);
        $superadmin->assignRole('superadmin');

        $admin = User::firstOrCreate([
            'name' => 'Admin',
            'email' => 'admin@mail.com',
            'password' => $password,
        ]);
        $admin->assignRole('admin');

        $staff = User::firstOrCreate([
            'name' => 'Staff',
            'email' => 'staff@mail.com',
            'password' => $password,
        ]);
        $staff->assignRole('staff');
    }
}
