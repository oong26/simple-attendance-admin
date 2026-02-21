<?php

namespace App\Repositories;

use App\Interfaces\ReportInterface;
use App\Models\Attendance;
use App\Models\Employee;
use App\Models\Department;
use Carbon\Carbon;

class ReportRepository implements ReportInterface {
    
    public function monthlyAttendance(string $monthYear, ?int $departmentId = null): array
    {
        // Parse the month and year
        try {
            $date = Carbon::parse($monthYear . '-01')->locale('id_ID');
        } catch (\Exception $e) {
            $date = Carbon::today()->locale('id_ID');
            $monthYear = $date->format('Y-m');
        }

        $daysInMonth = $date->daysInMonth;
        
        // Retrieve all active employees, filtered by department if selected
        $employees = Employee::with('department')
            ->when($departmentId, function($q) use ($departmentId) {
                $q->where('department_id', $departmentId);
            })
            ->orderBy('name')
            ->get();
        
        // Extract IDs of filtered employees to narrow down attendance queries
        $employeeIds = $employees->pluck('id')->toArray();
        
        // Retrieve all attendances for the given month, restricted to the filtered employees
        $attendances = Attendance::where('date', 'LIKE', "$monthYear-%")
            ->whereIn('employee_id', $employeeIds)
            ->get();
        
        // Group the attendances: attendanceMap[day][employee_id] = Attendance Model
        $attendanceMap = [];
        foreach ($attendances as $att) {
            $day = (int) Carbon::parse($att->date)->locale('id_ID')->format('d');
            $attendanceMap[$day][$att->employee_id] = [
                'clock_in' => $att->clock_in_time,
                'clock_out' => $att->clock_out_time,
                'status' => $att->status,
                'late_minutes' => $att->late_minutes,
                'late_deduction' => $att->late_deduction ?? 0,
            ];
        }

        // Prepare calendar structure for the frontend
        // We will pass days 1 to $daysInMonth
        $calendar = [];
        for ($i = 1; $i <= $daysInMonth; $i++) {
            $currentDate = $date->copy()->day($i)->locale('id_ID');
            $calendar[] = [
                'day' => $i,
                'date_string' => $currentDate->translatedFormat('d, M, Y'),
                'day_name' => $currentDate->translatedFormat('l'),
                'is_weekend' => $currentDate->isWeekend(),
            ];
        }

        $departments = Department::orderBy('name')->get();

        return [
            'monthYear' => $monthYear,
            'monthName' => $date->translatedFormat('F Y'),
            'departments' => $departments,
            'employees' => $employees,
            'attendanceMap' => $attendanceMap,
            'calendar' => $calendar,
        ];
    }
}
