<?php

namespace App\Repositories;

use App\Interfaces\AttendanceInterface;
use App\Models\Attendance;
use App\Models\Shift;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AttendanceRepository implements AttendanceInterface {
    public function list(array $filter = [], bool $pagination = false, int $perPage = 10)
    {
        $date = $filter['date'] ?? null;
        $month = $filter['month'] ?? null;
        $employeeId = $filter['employee_id'] ?? null;

        $data = Attendance::with(['employee.department', 'employee.shift'])
            ->when($date, function ($query) use ($date) {
                $query->whereDate('date', $date);
            })
            ->when($month, function ($query) use ($month) {
                // $month is expected to be 'YYYY-MM'
                $query->where('date', 'LIKE', "$month%");
            })
            ->when($employeeId, function ($query) use ($employeeId) {
                $query->where('employee_id', $employeeId);
            })
            ->orderBy('date', 'desc')
            ->orderBy('clock_in_time', 'desc');

        if ($pagination) {
            return $data->paginate($perPage);
        }
        return $data->get();
    }

    public function monitor()
    {
        $today = Carbon::today()->toDateString();
        
        $stats = [
            'total_employees' => \App\Models\Employee::count(),
            'present' => Attendance::whereDate('date', $today)->where('status', '!=', 'absent')->count(),
            'late' => Attendance::whereDate('date', $today)->where('status', 'late')->count(),
        ];

        $recentClockIns = Attendance::with('employee')
            ->whereDate('date', $today)
            ->latest('clock_in_time')
            ->take(5)
            ->get();
            
        return compact('stats', 'recentClockIns');
    }

    public function store($form): Attendance|null
    {
        return Attendance::create($form);
    }

    public function getById($id): object|null
    {
        return Attendance::find($id);
    }

    public function update($id, $form): Attendance|null
    {
        $attendance = Attendance::find($id);
        if (!$attendance) return null;
        $attendance->update($form);
        return $attendance;
    }

    public function delete($id): int|null
    {
        return Attendance::destroy($id);
    }

    public function clockIn($employeeId, $timestamp)
    {
        // Check for existing attendance today
        $date = Carbon::parse($timestamp)->toDateString();
        $existing = Attendance::where('employee_id', $employeeId)->whereDate('date', $date)->first();
        if ($existing) return $existing;

        $employee = \App\Models\Employee::with('shift')->find($employeeId);
        if (!$employee) return null;

        // Calculate status
        $status = 'present';
        $lateMinutes = 0;
        
        if ($employee->shift) {
            $shiftStart = Carbon::parse($employee->shift->start_time);
            $clockIn = Carbon::parse($timestamp);
            
            // Assuming shift start is on the same day for calculation simplicity, or just comparing times
            // Need to handle time comparison carefully. 
            // Simplified logic: compare H:i:s
            $shiftStartSeconds = $shiftStart->secondsSinceMidnight();
            $clockInSeconds = $clockIn->secondsSinceMidnight();
            
            // Get grace period from settings or employee override
            // For now, hardcode or fetch setting. 
            // NOTE: Ideally, we should inject SettingRepository or similar, but for now simple fetch using Model or DB
            $globalGrace = \App\Models\Setting::where('key', 'grace_period')->value('value') ?? 15;
            $graceContext = $employee->grace_period_override ?? $globalGrace;
            
            if ($clockInSeconds > ($shiftStartSeconds + ($graceContext * 60))) {
                $status = 'late';
                $lateMinutes = floor(($clockInSeconds - $shiftStartSeconds) / 60);
            }
        }

        return Attendance::create([
            'employee_id' => $employeeId,
            'date' => $date,
            'clock_in_time' => $timestamp,
            'status' => $status,
            'late_minutes' => $lateMinutes,
        ]);
    }

    public function clockOut($employeeId, $timestamp)
    {
        $date = Carbon::parse($timestamp)->toDateString();
        $attendance = Attendance::where('employee_id', $employeeId)->whereDate('date', $date)->first();
        
        if ($attendance) {
            $attendance->update(['clock_out_time' => $timestamp]);
            return $attendance;
        }
        return null;
    }
}
