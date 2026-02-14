<?php

namespace App\Services\Auth;

use App\Models\Customer;
use Illuminate\Support\Facades\Hash;

class RegisterService
{
    public function handle(array $data)
    {
        $customer = Customer::create([
            'name'       => $data['name'],
            'phone_code' => $data['phone_code'],
            'phone'      => $data['phone'],
            'password'   => Hash::make($data['password']),
        ]);

        return [$customer];
    }
}
