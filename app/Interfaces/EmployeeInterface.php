<?php

namespace App\Interfaces;

use App\Models\Employee;

interface EmployeeInterface {
    public function list(array $filter = [], bool $pagination = false, int $perPage = 10);
    public function store($form, $photo = null): Employee|null;
    public function getById($id): object|null;
    public function update($id, $form, $photo = null): Employee|null;
    public function delete($id): int|null;
}
