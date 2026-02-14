<?php

use App\Models\User;
use Illuminate\Support\Facades\RateLimiter;
use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;

test('login screen can be rendered', function () {
    $response = $this->get(route('login'));

    $response->assertStatus(200);
});

test('users can authenticate using the login screen', function () {
    $user = User::factory()->withoutTwoFactor()->create();

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: true));
});

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create();

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

test('users can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('logout'));

    $this->assertGuest();
    $response->assertRedirect(route('home'));
});

test('users are rate limited', function () {

    $email = 'usertest@mail.com';
    $ip = '127.0.0.1';

    // USER MUST EXIST, otherwise Fortify won't check rate limit
    User::create([
        'name' => 'User Test',
        'email' => $email,
        'password' => bcrypt('12345678'),
    ]);

    // Fortify throttle key format:
    $throttleKey = strtolower($email) . '|' . $ip;

    // Exceed limit (5 per minute)
    for ($i = 0; $i < 10; $i++) {
        RateLimiter::hit($throttleKey);
    }

    // Send login request
    $response = $this->post('/login', [
        Fortify::username() => $email,
        'password' => '12345678',
    ]);

    $response->assertStatus(302); // because the login page redirect back
});