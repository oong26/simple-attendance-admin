<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Employee;
use App\Models\Setting;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Exception;

class AttendanceController extends Controller
{
    public function clockIn(Request $request)
    {
        try {
            $request->validate([
                'employee_id' => 'required|exists:employees,id',
                'face_embedding' => 'nullable|string', // To be used for verification if needed
                'photo' => 'nullable|file|image', // To be stored as proof
            ]);

            $employee = Employee::with('shift')->find($request->employee_id);

            if (!$employee->is_active) {
                return response()->json(['message' => 'Employee is inactive'], 403);
            }

            $today = Carbon::today()->toDateString();
            $now = Carbon::now();

            // Check if already clocked in
            $existing = Attendance::where('employee_id', $employee->id)
                ->where('date', $today)
                ->first();

            if ($existing) {
                return response()->json(['message' => 'Already clocked in today'], 400);
            }

            // Calculate Late
            $status = 'present';
            $lateMinutes = 0;
            
            if ($employee->shift) {
                $shiftStart = Carbon::parse($today . ' ' . $employee->shift->start_time);
                
                // Grace Period
                $gracePeriod = $employee->grace_period_minutes;
                if ($gracePeriod === null) {
                    $globalSetting = Setting::where('key', 'global_grace_period')->first();
                    $gracePeriod = $globalSetting ? (int)$globalSetting->value : 0;
                }

                $lateThreshold = $shiftStart->copy()->addMinutes($gracePeriod);

                if ($now->gt($lateThreshold)) {
                    $status = 'late';
                    $lateMinutes = $shiftStart->diffInMinutes($now);
                }
            }

            $attendance = Attendance::create([
                'employee_id' => $employee->id,
                'date' => $today,
                'clock_in_time' => $now->toTimeString(),
                'status' => $status,
                'late_minutes' => $lateMinutes,
            ]);

            return response()->json([
                'message' => 'Clock in successful',
                'data' => $attendance,
            ]);

        } catch (Exception $e) {
            Log::error('API ClockIn Error: ' . $e->getMessage());
            return response()->json(['message' => 'Server Error'], 500);
        }
    }

    public function clockOut(Request $request)
    {
        try {
            $request->validate([
                'employee_id' => 'required|exists:employees,id',
            ]);

            $today = Carbon::today()->toDateString();
            $now = Carbon::now();

            $attendance = Attendance::where('employee_id', $request->employee_id)
                ->where('date', $today)
                ->first();

            if (!$attendance) {
                return response()->json(['message' => 'No attendance record found for today'], 404);
            }

            if ($attendance->clock_out_time) {
                return response()->json(['message' => 'Already clocked out'], 400);
            }

            $attendance->update([
                'clock_out_time' => $now->toTimeString(),
            ]);

            return response()->json([
                'message' => 'Clock out successful',
                'data' => $attendance,
            ]);

        } catch (Exception $e) {
            Log::error('API ClockOut Error: ' . $e->getMessage());
            return response()->json(['message' => 'Server Error'], 500);
        }
    }
}
