<?php

namespace App\Repositories;

use App\Interfaces\ReportInterface;
use App\Models\Attendance;
use App\Models\Employee;
use App\Models\Department;
use Carbon\Carbon;

class ReportRepository implements ReportInterface {
    
    public function monthlyAttendance(string $startDate, string $endDate, ?int $departmentId = null): array
    {
        // Parse the dates
        try {
            $start = Carbon::parse($startDate)->locale('id_ID')->startOfDay();
            $end = Carbon::parse($endDate)->locale('id_ID')->endOfDay();
        } catch (\Exception $e) {
            $start = Carbon::today()->locale('id_ID')->startOfMonth();
            $end = Carbon::today()->locale('id_ID')->endOfMonth();
        }
        
        // Retrieve all active employees, filtered by department if selected
        $employees = Employee::with('department')
            ->when($departmentId, function($q) use ($departmentId) {
                $q->where('department_id', $departmentId);
            })
            ->orderBy('name')
            ->get();
        
        // Extract IDs of filtered employees to narrow down attendance queries
        $employeeIds = $employees->pluck('id')->toArray();
        
        // Retrieve all attendances for the given date range
        $attendances = Attendance::whereBetween('date', [$start->format('Y-m-d'), $end->format('Y-m-d')])
            ->whereIn('employee_id', $employeeIds)
            ->get();
        
        // Group the attendances: attendanceMap[Y-m-d][employee_id] = Attendance Model
        $attendanceMap = [];
        foreach ($attendances as $att) {
            $dateStr = Carbon::parse($att->date)->format('Y-m-d');
            $attendanceMap[$dateStr][$att->employee_id] = [
                'clock_in' => $att->clock_in_time,
                'clock_out' => $att->clock_out_time,
                'status' => $att->status,
                'leave_type' => $att->leave_type,
                'late_minutes' => $att->late_minutes,
                'late_deduction' => $att->late_deduction ?? 0,
            ];
        }

        // Fetch holidays for the given date range
        $holidaysData = \App\Models\Holiday::whereBetween('date', [$start->format('Y-m-d'), $end->format('Y-m-d')])
            ->orWhere(function ($query) use ($start, $end) {
                $query->where('is_recurring', true)
                      // A simplistic approach that works for typical 1-month ranges, but let's just 
                      // assume anything overlapping the month(s) of the range is considered.
                      // For simplicity, we just pull recurring holidays and filter exactly below.
                      ->whereIn(\DB::raw('MONTH(date)'), [$start->month, $end->month]);
            })->get();

        $holidays = [];
        foreach ($holidaysData as $h) {
            $hDate = Carbon::parse($h->date);
            // Since recurring holidays might have different years in the DB, we match by month and day.
            // We'll map them precisely later or just build an array of name per "MM-DD".
            $md = $hDate->format('m-d');
            $holidays[$md][] = $h->name;
        }

        // Prepare calendar structure for the frontend
        $calendar = [];
        $sundayMap = [];
        $otherHolidaysGrouped = [];

        $current = $start->copy();
        while ($current->lte($end)) {
            $dateStr = $current->format('Y-m-d');
            $md = $current->format('m-d');
            $englishDayName = $current->copy()->locale('en')->format('l');

            $dayHolidays = $holidays[$md] ?? [];

            $isSunday = $current->dayOfWeek === Carbon::SUNDAY;
            if ($isSunday) {
                // Group Sundays by month name
                $monthName = $current->translatedFormat('F');
                $sundayMap[$monthName][] = $current->day;
            }

            // Group other holidays safely mapping "exact date integer" if it falls inside
            foreach ($dayHolidays as $hName) {
                $monthName = $current->translatedFormat('F');
                $otherHolidaysGrouped[$hName][$monthName][] = $current->day;
            }

            $calendar[] = [
                'date' => $dateStr, // Ex: 2026-01-26
                'date_string' => $current->translatedFormat('d, M, Y'),
                'day_name' => $current->translatedFormat('l'),
                'english_day_name' => $englishDayName,
                'is_weekend' => $current->isWeekend(),
                'is_sunday' => $isSunday,
                'holidays' => $dayHolidays,
            ];
            
            $current->addDay();
        }

        // Prepare holiday summary for REKAP view
        $holidaysSummary = [];
        foreach ($sundayMap as $monthName => $days) {
            $holidaysSummary[] = [
                'name' => 'Hari Minggu',
                'dates' => implode(', ', $days) . ' ' . $monthName,
                'total' => count($days)
            ];
        }
        
        foreach ($otherHolidaysGrouped as $hName => $monthsMap) {
            foreach ($monthsMap as $monthName => $days) {
                $holidaysSummary[] = [
                    'name' => $hName,
                    'dates' => implode(', ', $days) . ' ' . $monthName,
                    'total' => count($days)
                ];
            }
        }

        $departments = Department::orderBy('name')->get();

        return [
            'startDate' => $start->format('Y-m-d'),
            'endDate' => $end->format('Y-m-d'),
            'monthName' => $start->translatedFormat('d M Y') . ' - ' . $end->translatedFormat('d M Y'), // Fallback generic name
            'departments' => $departments,
            'employees' => $employees,
            'attendanceMap' => $attendanceMap,
            'calendar' => $calendar,
            'holidaysSummary' => $holidaysSummary,
        ];
    }
}
