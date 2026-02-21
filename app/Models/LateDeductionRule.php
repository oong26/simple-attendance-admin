<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LateDeductionRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'amount_per_minute',
        'is_active',
    ];

    protected $casts = [
        'amount_per_minute' => 'integer',
        'is_active' => 'boolean',
    ];
}
