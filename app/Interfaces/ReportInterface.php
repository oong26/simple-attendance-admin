<?php

namespace App\Interfaces;

interface ReportInterface {
    /**
     * Get the monthly attendance report data.
     *
     * @param string $monthYear Format: YYYY-MM
     * @param int|null $departmentId Filter by department
     * @return array
     */
    public function monthlyAttendance(string $monthYear, ?int $departmentId = null): array;
}
