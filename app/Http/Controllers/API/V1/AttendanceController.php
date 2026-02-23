<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Employee;
use App\Models\LateDeductionRule;
use App\Models\Setting;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Exception;

class AttendanceController extends Controller
{
    public function today(Request $request)
    {
        try {
            $customer = $request->user();
            
            // The customer is essentially the user. Match by phone or phone_number.
            $employee = Employee::where('phone', $customer->phone)
                ->orWhere('phone', $customer->phone_number)
                ->first();

            if (!$employee) {
                return response()->json([
                    'success' => false, 
                    'message' => 'Employee profile not linked to this account.'
                ], 404);
            }

            $today = Carbon::today()->toDateString();
            $attendance = Attendance::where('employee_id', $employee->id)
                ->where('date', $today)
                ->first();

            $totalHours = '0h 0m';
            if ($attendance && $attendance->clock_in_time && $attendance->clock_out_time) {
                $in = Carbon::parse($attendance->clock_in_time);
                $out = Carbon::parse($attendance->clock_out_time);
                $diffMin = $in->diffInMinutes($out);
                $hours = floor($diffMin / 60);
                $mins = $diffMin % 60;
                $totalHours = "{$hours}h {$mins}m";
            }

            return response()->json([
                'success' => true,
                'employee' => [
                    'id' => $employee->id,
                    'name' => $employee->name,
                    'is_active' => $employee->is_active,
                ],
                'attendance' => $attendance,
                'total_hours' => $totalHours,
            ]);
        } catch (Exception $e) {
            Log::error('API Today Attendance Error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Server Error'], 500);
        }
    }

    public function history(Request $request)
    {
        try {
            $month = $request->input('month', Carbon::today()->month);
            $year = $request->input('year', Carbon::today()->year);

            $attendances = Attendance::with('employee')
                ->whereMonth('date', $month)
                ->whereYear('date', $year)
                ->orderBy('date', 'desc')
                ->get();

            $totalWorkDays = $attendances->count();
            $onTimeCount = $attendances->where('status', 'present')->count();
            
            $punctuality = 0;
            if ($totalWorkDays > 0) {
                $punctuality = round(($onTimeCount / $totalWorkDays) * 100);
            }

            // Calculate total hours
            $totalMinutesWorked = 0;
            $formattedLogs = [];

            foreach ($attendances as $att) {
                $dateObj = Carbon::parse($att->date);
                
                $inTimeStr = null;
                $outTimeStr = null;
                $hoursStr = '-';
                
                if ($att->clock_in_time) {
                    $inTimeStr = Carbon::parse($att->clock_in_time)->format('h:i A');
                }
                if ($att->clock_out_time) {
                    $outTimeStr = Carbon::parse($att->clock_out_time)->format('h:i A');
                }

                if ($att->clock_in_time && $att->clock_out_time) {
                    $in = Carbon::parse($att->clock_in_time);
                    $out = Carbon::parse($att->clock_out_time);
                    $diffMins = $in->diffInMinutes($out);
                    
                    $totalMinutesWorked += $diffMins;
                    
                    $h = floor($diffMins / 60);
                    $m = $diffMins % 60;
                    $hoursStr = "{$h}h " . str_pad($m, 2, '0', STR_PAD_LEFT) . "m";
                }

                // Map status
                $statusMap = [
                    'present' => 'on-time',
                    'late' => 'late',
                    'absent' => 'absent',
                    'leave' => 'leave',
                ];
                
                $uiStatus = $statusMap[$att->status] ?? 'on-time';

                // Icons configuration
                $inIcon = 'login';
                $inIconColor = 'bg-blue-50 text-blue-500';
                $inTimeColor = 'text-slate-700';

                if ($uiStatus === 'late') {
                    $inIcon = 'schedule';
                    $inIconColor = 'bg-amber-50 text-amber-500';
                    $inTimeColor = 'text-amber-600';
                }

                $formattedLogs[] = [
                    'id' => $att->id,
                    'employeeName' => $att->employee ? $att->employee->name : 'Unknown',
                    'month' => strtoupper($dateObj->format('M')),
                    'day' => $dateObj->day,
                    'dayName' => $dateObj->format('l'),
                    'status' => $uiStatus,
                    'totalHours' => $hoursStr,
                    'inTime' => $inTimeStr,
                    'outTime' => $outTimeStr,
                    'inIcon' => $inIcon,
                    'inIconColor' => $inIconColor,
                    'inTimeColor' => $inTimeColor,
                    'errorMessage' => $uiStatus === 'absent' ? 'No Check-in Recorded' : null,
                ];
            }

            $totalH = floor($totalMinutesWorked / 60);
            $totalM = $totalMinutesWorked % 60;

            // Trend is mock logic for demonstration
            // In a real app we'd query last month to calculate string +4.2%
            $punctualityLabel = 'Good';
            if ($punctuality >= 95) $punctualityLabel = 'Excellent';
            elseif ($punctuality < 80) $punctualityLabel = 'Needs Improvement';

            return response()->json([
                'success' => true,
                'summary' => [
                    'total_hours' => $totalH,
                    'total_minutes' => $totalM,
                    'work_days' => $totalWorkDays,
                    'punctuality' => $punctuality,
                    'punctuality_label' => $punctualityLabel,
                ],
                'logs' => $formattedLogs
            ]);
        } catch (Exception $e) {
            Log::error('API History Error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Server Error'], 500);
        }
    }

    public function department(Request $request)
    {
        try {
            $department = \App\Models\Department::first();
            
            if (!$department) {
                return response()->json([
                    'success' => false,
                    'message' => 'No department found.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'department' => [
                    'id' => $department->id,
                    'name' => $department->name,
                    'workdays' => $department->workdays ?? [],
                ]
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('API Department Error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Server Error'], 500);
        }
    }

    public function clockIn(Request $request)
    {
        try {
            $request->validate([
                'employee_id' => 'required|exists:employees,id',
                'face_embedding' => 'nullable|array', // Received from PWA
                'photo' => 'nullable|file|image',
            ]);

            $employee = Employee::with('department')->find($request->employee_id);

            if (!$employee->is_active) {
                return response()->json(['message' => 'Employee is inactive'], 403);
            }

            // Face Verification
            if ($request->has('face_embedding') && $request->face_embedding) {
                if (!$employee->face_embedding) {
                    return response()->json(['message' => 'Face not registered for this employee'], 400);
                }

                $inputEmbedding = $request->face_embedding;
                $dbEmbedding = $employee->face_embedding;

                if (count($inputEmbedding) !== 128 || !is_array($dbEmbedding) || count($dbEmbedding) !== 128) {
                    return response()->json(['message' => 'Invalid embedding structure'], 400);
                }

                $distance = 0;
                for ($i = 0; $i < 128; $i++) {
                    $distance += pow((float)$inputEmbedding[$i] - (float)$dbEmbedding[$i], 2);
                }
                $distance = sqrt($distance);

                if ($distance > 0.45) {
                    return response()->json(['message' => 'Face does not match'], 401);
                }
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
            
            $todayDayName = Carbon::now()->format('l');
            $workdays = $employee->department?->workdays ?? [];
            $todaySchedule = collect($workdays)->firstWhere('day', $todayDayName);

            if ($todaySchedule && isset($todaySchedule['is_working']) && $todaySchedule['is_working'] && !empty($todaySchedule['start_time'])) {
                $shiftStart = Carbon::parse($today . ' ' . $todaySchedule['start_time']);
                
                // Grace Period
                $gracePeriod = $employee->grace_period_minutes;
                if ($gracePeriod === null) {
                    $globalSetting = Setting::where('key', 'global_grace_period')->first();
                    $gracePeriod = $globalSetting ? (int)$globalSetting->value : 0;
                }

                $lateThreshold = $shiftStart->copy()->addMinutes($gracePeriod);

                if ($now->gt($lateThreshold) && $employee->attendance_type === 'onsite') {
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
                'face_embedding' => 'nullable|array',
            ]);

            $employee = Employee::find($request->employee_id);

            // Face Verification
            if ($request->has('face_embedding') && $request->face_embedding) {
                if (!$employee->face_embedding) {
                    return response()->json(['message' => 'Face not registered for this employee'], 400);
                }

                $inputEmbedding = $request->face_embedding;
                $dbEmbedding = $employee->face_embedding;

                if (count($inputEmbedding) !== 128 || !is_array($dbEmbedding) || count($dbEmbedding) !== 128) {
                    return response()->json(['message' => 'Invalid embedding structure'], 400);
                }

                $distance = 0;
                for ($i = 0; $i < 128; $i++) {
                    $distance += pow((float)$inputEmbedding[$i] - (float)$dbEmbedding[$i], 2);
                }
                $distance = sqrt($distance);

                if ($distance > 0.45) {
                    return response()->json(['message' => 'Face does not match'], 401);
                }
            }

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

    public function clockByFace(Request $request)
    {
        try {
            $request->validate([
                'face_embedding' => 'required|array',
            ]);

            $inputEmbedding = $request->face_embedding;
            $employees = Employee::with('department')->where('is_active', true)->whereNotNull('face_embedding')->get();
            
            $bestMatch = null;
            $bestDistance = 1.0;
            $threshold = 0.45;

            foreach ($employees as $employee) {
                $dbEmbedding = $employee->face_embedding;
                
                if (is_array($dbEmbedding) && count($dbEmbedding) === 128) {
                    $distance = 0;
                    for ($i = 0; $i < 128; $i++) {
                        $distance += pow((float)$inputEmbedding[$i] - (float)$dbEmbedding[$i], 2);
                    }
                    $distance = sqrt($distance);

                    if ($distance < $bestDistance) {
                        $bestDistance = $distance;
                        $bestMatch = $employee;
                    }
                }
            }

            if (!$bestMatch || $bestDistance > $threshold) {
                return response()->json(['message' => 'Face not recognized'], 401);
            }

            $today = Carbon::today()->toDateString();
            $now = Carbon::now();

            // Check existing attendance for today
            $attendance = Attendance::where('employee_id', $bestMatch->id)
                ->where('date', $today)
                ->first();

            // CLOCK IN LOGIC
            if (!$attendance || ($attendance && $attendance->status === 'arrive_late' && !$attendance->clock_in_time)) {
                $status = 'present';
                $lateMinutes = 0;
                
                $todayDayName = Carbon::now()->format('l');
                $workdays = $bestMatch->department?->workdays ?? [];
                $todaySchedule = collect($workdays)->firstWhere('day', $todayDayName);

                if ($todaySchedule && isset($todaySchedule['is_working']) && $todaySchedule['is_working'] && !empty($todaySchedule['start_time'])) {
                    $shiftStart = Carbon::parse($today . ' ' . $todaySchedule['start_time']);
                    
                    $gracePeriod = $bestMatch->grace_period_minutes;
                    if ($gracePeriod === null) {
                        $globalSetting = Setting::where('key', 'global_grace_period')->first();
                        $gracePeriod = $globalSetting ? (int)$globalSetting->value : 0;
                    }

                    $lateThreshold = $shiftStart->copy()->addMinutes($gracePeriod);

                    if ($now->gt($lateThreshold) && $bestMatch->attendance_type === 'onsite') {
                        $status = 'late';
                        $lateMinutes = $shiftStart->diffInMinutes($now);
                    }
                }

                // Calculate late deduction
                $totalDeduction = null;
                $isArriveLatePermission = $attendance && $attendance->status === 'arrive_late';

                if ($bestMatch->attendance_type == 'onsite') {
                    if ($status === 'late') {
                        if ($isArriveLatePermission) {
                            $totalDeduction = 0;
                        } else {
                            $lateDeductionRule = LateDeductionRule::where('is_active', true)->first();
                            if ($lateDeductionRule) {
                                $totalDeduction = $lateDeductionRule->amount_per_minute * (int) $lateMinutes;
                            }
                        }
                    }
                }

                if ($isArriveLatePermission) {
                    $attendance->update([
                        'clock_in_time' => $now->toTimeString(),
                        'status' => $status,
                        'attendance_type' => 'face',
                        'late_minutes' => $lateMinutes,
                        'late_deduction' => $totalDeduction,
                    ]);
                    $newAttendance = $attendance->fresh();
                } else {
                    $newAttendance = Attendance::create([
                        'employee_id' => $bestMatch->id,
                        'date' => $today,
                        'clock_in_time' => $now->toTimeString(),
                        'status' => $status,
                        'attendance_type' => 'face',
                        'late_minutes' => $lateMinutes,
                        'late_deduction' => $totalDeduction,
                    ]);
                }

                return response()->json([
                    'message' => 'Clock in successful',
                    'action' => 'clock_in',
                    'employee_name' => $bestMatch->name,
                    'data' => $newAttendance,
                ]);
            }

            // CLOCK OUT LOGIC
            if ($attendance && !$attendance->clock_out_time) {
                $attendance->update([
                    'clock_out_time' => $now->toTimeString(),
                ]);

                return response()->json([
                    'message' => 'Clock out successful',
                    'action' => 'clock_out',
                    'employee_name' => $bestMatch->name,
                    'data' => $attendance,
                ]);
            }

            // ALREADY DONE BOTH
            return response()->json([
                'message' => 'Already clocked out today',
                'action' => 'completed',
                'employee_name' => $bestMatch->name
            ], 400);

        } catch (Exception $e) {
            Log::error('API ClockByFace Error: ' . $e->getMessage());
            return response()->json(['message' => 'Server Error'], 500);
        }
    }

    public function clockByQrcode(Request $request)
    {
        try {
            $request->validate([
                'qrcode_data' => 'required|string',
            ]);

            $qrData = json_decode($request->qrcode_data, true);

            if (!$qrData || !isset($qrData['employee_id'])) {
                return response()->json(['message' => 'Invalid QR Code data'], 400);
            }

            $employeeId = $qrData['employee_id'];
            
            $employee = Employee::with('department')->find($employeeId);

            if (!$employee) {
                return response()->json(['message' => 'Employee not found'], 404);
            }

            if (!$employee->is_active) {
                return response()->json(['message' => 'Employee is inactive'], 403);
            }

            $today = Carbon::today()->toDateString();
            $now = Carbon::now();

            // Check existing attendance for today
            $attendance = Attendance::where('employee_id', $employee->id)
                ->where('date', $today)
                ->first();

            // CLOCK IN LOGIC
            if (!$attendance || ($attendance && $attendance->status === 'arrive_late' && !$attendance->clock_in_time)) {
                $status = 'present';
                $lateMinutes = 0;
                
                $todayDayName = Carbon::now()->format('l');
                $workdays = $employee->department?->workdays ?? [];
                $todaySchedule = collect($workdays)->firstWhere('day', $todayDayName);

                if ($todaySchedule && isset($todaySchedule['is_working']) && $todaySchedule['is_working'] && !empty($todaySchedule['start_time'])) {
                    $shiftStart = Carbon::parse($today . ' ' . $todaySchedule['start_time']);
                    
                    $gracePeriod = $employee->grace_period_minutes;
                    if ($gracePeriod === null) {
                        $globalSetting = Setting::where('key', 'global_grace_period')->first();
                        $gracePeriod = $globalSetting ? (int)$globalSetting->value : 0;
                    }

                    $lateThreshold = $shiftStart->copy()->addMinutes($gracePeriod);

                    if ($now->gt($lateThreshold) && $employee->attendance_type === 'onsite') {
                        $status = 'late';
                        $lateMinutes = $shiftStart->diffInMinutes($now);
                    }
                }

                // Calculate late deduction
                $totalDeduction = null;
                $isArriveLatePermission = $attendance && $attendance->status === 'arrive_late';

                if ($employee->attendance_type == 'onsite') {
                    if ($status === 'late') {
                        if ($isArriveLatePermission) {
                            $totalDeduction = 0;
                        } else {
                            $lateDeductionRule = LateDeductionRule::where('is_active', true)->first();
                            if ($lateDeductionRule) {
                                $totalDeduction = $lateDeductionRule->amount_per_minute * (int) $lateMinutes;
                            }
                        }
                    }
                }

                if ($isArriveLatePermission) {
                    $attendance->update([
                        'clock_in_time' => $now->toTimeString(),
                        'status' => $status,
                        'attendance_type' => 'qrcode',
                        'late_minutes' => $lateMinutes,
                        'late_deduction' => $totalDeduction,
                    ]);
                    $newAttendance = $attendance->fresh();
                } else {
                    $newAttendance = Attendance::create([
                        'employee_id' => $employee->id,
                        'date' => $today,
                        'clock_in_time' => $now->toTimeString(),
                        'status' => $status,
                        'attendance_type' => 'qrcode',
                        'late_minutes' => $lateMinutes,
                        'late_deduction' => $totalDeduction,
                    ]);
                }

                return response()->json([
                    'message' => 'Clock in successful',
                    'action' => 'clock_in',
                    'employee_name' => $employee->name,
                    'data' => $newAttendance,
                ]);
            }

            // CLOCK OUT LOGIC
            if ($attendance && !$attendance->clock_out_time) {
                $attendance->update([
                    'clock_out_time' => $now->toTimeString(),
                ]);

                return response()->json([
                    'message' => 'Clock out successful',
                    'action' => 'clock_out',
                    'employee_name' => $employee->name,
                    'data' => $attendance,
                ]);
            }

            // ALREADY DONE BOTH
            return response()->json([
                'message' => 'Already clocked out today',
                'action' => 'completed',
                'employee_name' => $employee->name
            ], 400);

        } catch (Exception $e) {
            Log::error('API ClockByQrcode Error: ' . $e->getMessage());
            return response()->json(['message' => 'Server Error'], 500);
        }
    }
}
