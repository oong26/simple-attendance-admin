<?php

namespace App\Http\Middleware;

use App\Models\ApiKey;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

class CheckApiKey
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle($request, Closure $next): Response
    {
        $key = $request->header('X-API-KEY');

        // 1. Missing header
        if (! $key) {
            return response()->json([
                'success' => false,
                'message' => 'Missing API Key.',
            ], 401);
        }

        // 2. Validate against all active keys
        $valid = ApiKey::where('state', true)
            ->get()
            ->contains(fn ($item) => Hash::check($key, $item->key_hash));

        if (! $valid) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid API Key.',
            ], 401);
        }

        return $next($request);
    }
}
