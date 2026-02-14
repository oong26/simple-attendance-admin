<?php

namespace App\Services\Auth;

use App\Models\Customer;
use Illuminate\Support\Facades\Hash;

class LoginService
{
    public function handle(array $data, $request)
    {
        // Normalize phone input
        [$phone_code, $phone] = $this->normalizePhone($data['phone']);

        $customer = Customer::where('phone_code', $phone_code)
            ->where('phone', $phone)
            ->first();

        if (! $customer || ! Hash::check($data['password'], $customer->password)) {
            return ['error' => 'Invalid credentials'];
        }

        if (is_null($customer->phone_verified_at)) {
            return ['error' => 'You must confirm this phone first'];
        }

        // Create the token
        $tokenObj = $customer->createToken('api-token');

        // Save user-agent into personal_access_tokens table
        $tokenObj->accessToken->user_agent = $request->userAgent();
        $tokenObj->accessToken->ip_address = $request->ip(); // OPTIONAL
        if ($request->get('device')) {
            $tokenObj->accessToken->device = $request->get('device');
        }
        $tokenObj->accessToken->save();

        return [
            'customer' => $customer,
            'token'    => $tokenObj->plainTextToken,
        ];
    }

    private function normalizePhone(string $rawPhone): array
    {
        // Remove spaces, + symbol, non-numeric chars
        $phone = preg_replace('/\D/', '', $rawPhone);

        // Example: 628123456789 → 62 + 8123456789
        // Extract country code (assuming 2–3 digits)
        if (str_starts_with($phone, '62')) {
            $phone_code = '62';
            $phone = substr($phone, 2); // remove 62 prefix
        } elseif (str_starts_with($phone, '0')) {
            $phone_code = '62';
            $phone = substr($phone, 1);
        } else {
            // fallback
            $phone_code = substr($phone, 0, 2);
            $phone = substr($phone, 2);
        }

        return [$phone_code, $phone];
    }
}
