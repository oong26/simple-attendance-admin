<?php

namespace App\Http\Controllers;

use App\Interfaces\ReportInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class ReportController extends Controller
{
    private ReportInterface $reportRepository;

    public function __construct(ReportInterface $reportRepository)
    {
        $this->reportRepository = $reportRepository;
        $this->middleware('permission:monthly-report.view')->only(['monthlyAttendance']);
    }

    public function monthlyAttendance(Request $request)
    {
        $startDate = $request->get('start_date', Carbon::today()->locale('id_ID')->startOfMonth()->format('Y-m-d'));
        $endDate = $request->get('end_date', Carbon::today()->locale('id_ID')->endOfMonth()->format('Y-m-d'));
        $departmentId = $request->get('department_id') ? (int) $request->get('department_id') : null;
        
        $data = $this->reportRepository->monthlyAttendance($startDate, $endDate, $departmentId);

        return Inertia::render('reports/monthly', [
            'startDate' => $data['startDate'],
            'endDate' => $data['endDate'],
            'monthName' => $data['monthName'],
            'departments' => $data['departments'],
            'employees' => $data['employees'],
            'attendanceMap' => $data['attendanceMap'],
            'calendar' => $data['calendar'],
            'holidaysSummary' => $data['holidaysSummary'],
            'selectedDepartment' => $departmentId,
        ]);
    }
}
