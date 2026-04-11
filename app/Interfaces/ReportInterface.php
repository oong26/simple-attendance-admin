<?php

namespace App\Interfaces;

interface ReportInterface
{
    /**
     * Get the monthly attendance report data.
     *
     * @param  string  $startDate  Format: YYYY-MM-DD
     * @param  string  $endDate  Format: YYYY-MM-DD
     * @param  int|null  $departmentId  Filter by department
     */
    public function monthlyAttendance(string $startDate, string $endDate, ?int $departmentId = null): array;
}
