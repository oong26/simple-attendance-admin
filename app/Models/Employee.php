<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'department_id',
        'shift_id',
        'face_embedding',
        'photo_url',
        'is_active',
        'grace_period_minutes',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'grace_period_minutes' => 'integer',
        'department_id' => 'integer',
        'shift_id' => 'integer',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function shift()
    {
        return $this->belongsTo(Shift::class);
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }
}
