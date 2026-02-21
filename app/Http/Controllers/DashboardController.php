<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

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

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recentLogs' => $recentLogs,
        ]);
    }
}
