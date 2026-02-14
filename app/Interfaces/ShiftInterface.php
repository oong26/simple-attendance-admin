<?php

namespace App\Interfaces;

use App\Models\Shift;

interface ShiftInterface {
    public function list(array $filter = [], bool $pagination = false, int $perPage = 10);
    public function store($form): Shift|null;
    public function getById($id): object|null;
    public function update($id, $form): Shift|null;
    public function delete($id): int|null;
}
