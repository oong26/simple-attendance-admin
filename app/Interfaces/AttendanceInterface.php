<?php

namespace App\Interfaces;

use App\Models\Attendance;

interface AttendanceInterface {
    public function list(array $filter = [], bool $pagination = false, int $perPage = 10);
    public function monitor();
    public function store($form): Attendance|null;
    // We don't necessarily need update/delete/getById for attendance yet based on the current controller, but adding them for consistency/future use if helpful, or stick to list/monitor/store.
    // The current controller supports index (list) and monitor. And API clock_in/out (which might use store/update).
    // Let's add them to be safe.
    public function getById($id): object|null;
    public function update($id, $form): Attendance|null;
    public function delete($id): int|null;
    public function clockIn($employeeId, $timestamp);
    public function clockOut($employeeId, $timestamp);
}
