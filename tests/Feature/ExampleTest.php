<?php

it('logs in a customer without use api key', function () {
    $response = $this->postJson('/api/v1/login', [
        'phone' => '085331053300',
        'password' => '12345678',
    ]);

    $response->assertStatus(401);
});
