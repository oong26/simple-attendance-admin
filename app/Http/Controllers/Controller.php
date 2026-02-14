<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;

abstract class Controller extends BaseController
{
    protected function errorMessage(): String
    {
        $message = config('constant.error_message');
        if (empty($message)) {
            return 'Something was wrong';
        }
        return $message;
    }

    protected function flashMessage(string $type, $message = null, $payload = null): array
    {
        return [
            'type' => $type,
            'message' => $type == 'error' && !$message ? $this->errorMessage() : $message,
            'payload' => $payload
        ];
    }
}
