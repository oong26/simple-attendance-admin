<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'department_id',
        'job_title',
        'face_embedding',
        'photo',
        'photo_url',
        'contract_type',
        'attendance_type',
        'contract_end_date',
        'is_active',
        'grace_period_minutes',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'grace_period_minutes' => 'integer',
        'department_id' => 'integer',
        'face_embedding' => 'array',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }
}
