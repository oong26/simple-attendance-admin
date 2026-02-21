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
    }

    public function monthlyAttendance(Request $request)
    {
        $month = $request->get('month', Carbon::today()->locale('id_ID')->format('Y-m'));
        $departmentId = $request->get('department_id') ? (int) $request->get('department_id') : null;
        
        $data = $this->reportRepository->monthlyAttendance($month, $departmentId);

        return Inertia::render('reports/monthly', [
            'monthYear' => $data['monthYear'],
            'monthName' => $data['monthName'],
            'departments' => $data['departments'],
            'employees' => $data['employees'],
            'attendanceMap' => $data['attendanceMap'],
            'calendar' => $data['calendar'],
            'selectedDepartment' => $departmentId,
        ]);
    }
}
