<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Employee;
use App\Models\Shift;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Exception;

class AttendanceController extends Controller
{
    /**
     * Reporting & History
     */
    public function index(Request $request)
    {
        try {
            $date = $request->get('date', Carbon::today()->toDateString());
            $month = $request->get('month'); // YYYY-MM
            $employeeId = $request->get('employee_id');
            $perPage = $request->get('perPage', 20);
            
            $query = Attendance::with(['employee.department', 'employee.shift']);

            if ($month) {
                $query->where('date', 'like', "{$month}%");
            } elseif ($date) {
                $query->where('date', $date);
            }

            if ($employeeId) {
                $query->where('employee_id', $employeeId);
            }

            $list = $query->latest('date')->latest('clock_in_time')->paginate($perPage);
            $employees = Employee::orderBy('name')->get(['id', 'name']);

            return Inertia::render('attendances/index', compact('list', 'date', 'month', 'employees'));
        } catch (Exception $e) {
            Log::error('Attendance Index Error: ' . $e->getMessage());
            return redirect()->route('dashboard')->with('flash', $this->flashMessage('error'));
        }
    }

    /**
     * Real-time Monitor
     */
    public function monitor(Request $request)
    {
        try {
            $today = Carbon::today()->toDateString();
            
            // Get all active employees
            $totalEmployees = Employee::where('is_active', true)->count();

            // Get today's attendance
            $attendances = Attendance::with('employee.department', 'employee.shift')
                ->where('date', $today)
                ->get();

            $presentCount = $attendances->where('status', '!=', 'absent')->count();
            $lateCount = $attendances->where('status', 'late')->count();
            
            // "Not In" are those who haven't clocked in yet
            // This is roughly Total - Present (assuming no specific "Absent" record is created until end of day or manual)
            // Or we can list specific employees who are not in.
            $clockedInEmployeeIds = $attendances->pluck('employee_id')->toArray();
            
            $notInEmployees = Employee::with(['department', 'shift'])
                ->where('is_active', true)
                ->whereNotIn('id', $clockedInEmployeeIds)
                ->get();

            $stats = [
                'total_employees' => $totalEmployees,
                'present' => $presentCount,
                'late' => $lateCount,
                'not_in' => $notInEmployees->count(),
            ];

            return Inertia::render('attendances/monitor', compact('stats', 'attendances', 'notInEmployees'));
        } catch (Exception $e) {
            Log::error('Attendance Monitor Error: ' . $e->getMessage());
            return redirect()->route('dashboard')->with('flash', $this->flashMessage('error'));
        }
    }
}
