<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Laravel\Sanctum\PersonalAccessToken as SanctumPersonalAccessToken;

class PersonalAccessToken extends SanctumPersonalAccessToken
{
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'tokenable_id', 'id');
    }
}
