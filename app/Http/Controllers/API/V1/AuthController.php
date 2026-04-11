<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\CustomerResource;
use App\Services\Auth\LoginService;
use App\Services\Auth\LogoutService;
use App\Services\Auth\RegisterService;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function register(RegisterRequest $request, RegisterService $service)
    {
        [$customer, $token] = $service->handle($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Registered successfully.',
            'token' => $token,
            'customer' => new CustomerResource($customer),
        ]);
    }

    public function login(LoginRequest $request, LoginService $service)
    {
        $result = $service->handle($request->validated(), $request);

        // If there is an error message
        if (isset($result['error'])) {
            return response()->json([
                'success' => false,
                'message' => $result['error'],
            ], 401);
        }

        // Success
        return response()->json([
            'success' => true,
            'message' => 'Login successful.',
            'token' => $result['token'],
            'customer' => new CustomerResource($result['customer']),
        ]);
    }

    public function profile(Request $request)
    {
        return new CustomerResource($request->user());
    }

    public function logout(Request $request, LogoutService $service)
    {
        $service->handle($request->user());

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }
}
