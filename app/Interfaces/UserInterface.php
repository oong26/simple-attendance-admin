<?php

namespace App\Interfaces;

use App\Models\User;

interface UserInterface
{
    public function list(array $filter = [], bool $pagination = false, int $perPage = 10);

    public function store($form): ?User;

    public function getById($id): ?object;

    public function update($id, $form): ?User;

    public function delete($id): ?int;
}
