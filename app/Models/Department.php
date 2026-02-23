<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'workdays', 'lat', 'long', 'attendance_radius'];

    protected $casts = [
        'workdays' => 'array',
    ];

    public function employees()
    {
        return $this->hasMany(Employee::class);
    }
}
