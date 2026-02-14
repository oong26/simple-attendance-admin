<?php

namespace App\Interfaces;

use App\Models\User;

interface UserInterface {
    public function list(array $filter = [], bool $pagination = false, int $perPage = 10);
    public function store($form): User|null;
    public function getById($id): object|null;
    public function update($id, $form): User|null;
    public function delete($id): int|null;
}