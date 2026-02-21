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

        $data = Attendance::with(['employee.department'])
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

        $employee = \App\Models\Employee::with('department')->find($employeeId);
        if (!$employee) return null;

        // Calculate status
        $status = 'present';
        $lateMinutes = 0;
        $lateDeduction = 0;
        
        $todayDayName = Carbon::parse($timestamp)->format('l');
        $workdays = $employee->department?->workdays ?? [];
        $todaySchedule = collect($workdays)->firstWhere('day', $todayDayName);

        if ($todaySchedule && isset($todaySchedule['is_working']) && $todaySchedule['is_working'] && !empty($todaySchedule['start_time'])) {
            $shiftStart = Carbon::parse($date . ' ' . $todaySchedule['start_time']);
            $clockIn = Carbon::parse($timestamp);
            
            $shiftStartSeconds = $shiftStart->secondsSinceMidnight();
            $clockInSeconds = $clockIn->secondsSinceMidnight();
            
            $globalGrace = \App\Models\Setting::where('key', 'grace_period')->value('value') ?? 15;
            $graceContext = $employee->grace_period_override ?? $globalGrace;
            
            if ($clockInSeconds > ($shiftStartSeconds + ($graceContext * 60)) && $employee->attendance_type === 'onsite') {
                $status = 'late';
                $lateMinutes = floor(($clockInSeconds - $shiftStartSeconds) / 60);
                
                $deductionRate = \App\Models\LateDeductionRule::where('is_active', true)->value('amount_per_minute') ?? \App\Models\Setting::where('key', 'late_deduction_per_minute')->value('value') ?? 0;
                $lateDeduction = $lateMinutes * intval($deductionRate);
            }
        }

        return Attendance::create([
            'employee_id' => $employeeId,
            'date' => $date,
            'clock_in_time' => $timestamp,
            'status' => $status,
            'late_minutes' => $lateMinutes,
            'late_deduction' => $lateDeduction,
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
