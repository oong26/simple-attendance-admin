<?php

namespace App\Interfaces;

use App\Models\Holiday;

interface HolidayInterface {
    public function list(array $filter = [], bool $pagination = false, int $perPage = 10);
    public function store($form): Holiday|null;
    public function getById($id): object|null;
    public function update($id, $form): Holiday|null;
    public function delete($id): int|null;
}
