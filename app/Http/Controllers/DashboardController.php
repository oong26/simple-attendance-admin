<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Employee;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        $today = Carbon::today()->toDateString();

        $stats = [
            'total_employees' => Employee::count(),
            'active_employees' => Employee::where('is_active', true)->count(),
            'today_attendances' => Attendance::where('date', $today)->count(),
            'today_late' => Attendance::where('date', $today)->where('status', 'late')->count(),
        ];

        $recentLogs = Attendance::with(['employee', 'employee.department'])
            ->latest('created_at')
            ->take(10)
            ->get();

        $employeesByContract = Employee::selectRaw('contract_type as name, count(*) as value')
            ->groupBy('contract_type')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => ucfirst((string) ($item->name ?? 'Unknown')),
                    'value' => (int) $item->value,
                ];
            });

        $employeesByAttendance = Employee::selectRaw('attendance_type as name, count(*) as value')
            ->groupBy('attendance_type')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => ucfirst((string) ($item->name ?? 'Unknown')),
                    'value' => (int) $item->value,
                ];
            });

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recentLogs' => $recentLogs,
            'charts' => [
                'by_contract' => $employeesByContract,
                'by_attendance' => $employeesByAttendance,
            ],
        ]);
    }
}
