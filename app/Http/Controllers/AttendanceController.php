<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Employee;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Exception;
use App\Interfaces\AttendanceInterface;

class AttendanceController extends Controller
{
    public function __construct(protected AttendanceInterface $attendance) {
        $this->middleware('permission:attendances.view')->only(['index']);
        $this->middleware('permission:attendances.create')->only(['create', 'storeLeave']);
        $this->middleware('permission:attendances.edit')->only(['edit', 'update']);
        $this->middleware('permission:attendances.delete')->only(['destroy']);
        $this->middleware('permission:monitor.view')->only(['monitor']);
    }
    /**
     * Reporting & History
     */
    public function index(Request $request)
    {
        try {
            $date = $request->get('date', Carbon::today()->toDateString());
            $month = $request->get('month'); // YYYY-MM
            $employeeId = $request->get('employee_id');
            $status = $request->get('status');
            $perPage = $request->get('perPage', 20);
            
            $query = Attendance::with(['employee.department']);

            if ($month) {
                $query->where('date', 'like', "{$month}%");
            } elseif ($date) {
                $query->where('date', $date);
            }

            if ($employeeId) {
                $query->where('employee_id', $employeeId);
            }

            if ($status) {
                $query->where('status', $status);
            }

            $list = $query->latest('date')->latest('clock_in_time')->paginate($perPage);
            $employees = Employee::orderBy('name')->get(['id', 'name']);

            return Inertia::render('attendances/index', compact('list', 'date', 'month', 'status', 'employees'));
        } catch (Exception $e) {
            Log::error('Attendance Index Error: ' . $e->getMessage());
            return redirect()->route('dashboard')->with('flash', $this->flashMessage('error'));
        }
    }

    /**
     * Delete method
     */
    public function destroy($id)
    {
        try {
            $this->attendance->delete($id);

            return redirect()
                ->route('attendances.index')
                ->with('flash', $this->flashMessage('success', 'Successfully deleting attendance'));
        }
        catch (Exception $e) {
            return redirect()
                ->route('attendances.index')
                ->with('flash', $this->flashMessage('error'));
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
            $attendances = Attendance::with('employee.department')
                ->where('date', $today)
                ->get();

            $presentCount = $attendances->where('status', '!=', 'absent')->count();
            $lateCount = $attendances->where('status', 'late')->count();
            
            // "Not In" are those who haven't clocked in yet
            // This is roughly Total - Present (assuming no specific "Absent" record is created until end of day or manual)
            // Or we can list specific employees who are not in.
            $clockedInEmployeeIds = $attendances->pluck('employee_id')->toArray();
            
            $notInEmployees = Employee::with(['department'])
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

    /**
     * Create Leave Request
     */
    public function create()
    {
        $employees = Employee::orderBy('name')->where('is_active', true)->get(['id', 'name']);
        $holidays = \App\Models\Holiday::all(['date', 'name'])->map(function ($holiday) {
            return [
                'date' => Carbon::parse($holiday->date)->format('Y-m-d'),
                'name' => $holiday->name
            ];
        });
        return Inertia::render('attendances/leave', compact('employees', 'holidays'));
    }

    /**
     * Store Leave Request
     */
    public function storeLeave(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'leave_type' => 'required|in:cuti,izin',
            'date' => 'required|date',
            'note' => 'nullable|string',
            'is_arrive_late' => 'nullable|boolean',
        ]);

        $isHoliday = \App\Models\Holiday::whereDate('date', $validated['date'])->first();
        if ($isHoliday) {
            return redirect()->back()->withErrors(['date' => 'Selected date is a holiday: ' . $isHoliday->name]);
        }

        try {
            $status = !empty($validated['is_arrive_late']) ? 'arrive_late' : 'leave';

            $this->attendance->store([
                'employee_id' => $validated['employee_id'],
                'date' => $validated['date'],
                'leave_type' => $validated['leave_type'],
                'status' => $status,
                'note' => $validated['note'] ?? null,
                'clock_in_time' => null,
                'clock_out_time' => null,
                'late_minutes' => 0,
                'late_deduction' => 0,
            ]);

            return redirect()
                ->route('attendances.index')
                ->with('flash', $this->flashMessage('success', 'Successfully submitted leave request.'));
        } catch (Exception $e) {
            Log::error('Attendance Store Leave Error: ' . $e->getMessage());
            return redirect()
                ->back()
                ->with('flash', $this->flashMessage('error', 'Failed to submit leave request.'));
        }
    }

    /**
     * Edit Leave Request
     */
    public function edit(Attendance $attendance)
    {
        if (!in_array($attendance->status, ['leave', 'arrive_late'])) {
            return redirect()->route('attendances.index')->with('flash', $this->flashMessage('error', 'Only leave or arrive late requests can be edited.'));
        }

        $employees = Employee::orderBy('name')->where('is_active', true)->get(['id', 'name']);
        $holidays = \App\Models\Holiday::all(['date', 'name'])->map(function ($holiday) {
            return [
                'date' => Carbon::parse($holiday->date)->format('Y-m-d'),
                'name' => $holiday->name
            ];
        });

        return Inertia::render('attendances/edit', compact('attendance', 'employees', 'holidays'));
    }

    /**
     * Update Leave Request
     */
    public function update(Request $request, Attendance $attendance)
    {
        if (!in_array($attendance->status, ['leave', 'arrive_late'])) {
            return redirect()->route('attendances.index')->with('flash', $this->flashMessage('error', 'Only leave or arrive late requests can be updated.'));
        }

        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'leave_type' => 'required|in:cuti,izin',
            'date' => 'required|date',
            'note' => 'nullable|string',
            'is_arrive_late' => 'nullable|boolean',
        ]);

        $isHoliday = \App\Models\Holiday::whereDate('date', $validated['date'])->first();
        if ($isHoliday) {
            return redirect()->back()->withErrors(['date' => 'Selected date is a holiday: ' . $isHoliday->name]);
        }

        try {
            $status = !empty($validated['is_arrive_late']) ? 'arrive_late' : 'leave';

            $this->attendance->update($attendance->id, [
                'employee_id' => $validated['employee_id'],
                'date' => $validated['date'],
                'leave_type' => $validated['leave_type'],
                'status' => $status,
                'note' => $validated['note'] ?? null,
            ]);

            return redirect()
                ->route('attendances.index')
                ->with('flash', $this->flashMessage('success', 'Successfully updated leave request.'));
        } catch (Exception $e) {
            Log::error('Attendance Update Leave Error: ' . $e->getMessage());
            return redirect()
                ->back()
                ->with('flash', $this->flashMessage('error', 'Failed to update leave request.'));
        }
    }
}
