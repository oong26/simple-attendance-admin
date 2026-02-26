<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'date',
        'clock_in_time',
        'clock_out_time',
        'status',
        'attendance_type',
        'leave_type',
        'late_minutes',
        'late_deduction',
        'note',
    ];

    protected $casts = [
        'date' => 'date',
        'late_minutes' => 'integer',
        'late_deduction' => 'integer',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
