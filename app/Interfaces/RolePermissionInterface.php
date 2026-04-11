<?php

namespace App\Interfaces;

use Spatie\Permission\Models\Role;

interface RolePermissionInterface
{
    public function list(array $filter = [], bool $pagination = false, int $perPage = 10);

    public function listPermission(array $filter = [], bool $group = false, bool $pagination = false, int $perPage = 10);

    public function store($form): ?Role;

    public function getById($id, bool $withPermission = false): ?Role;

    public function update($id, $form): ?Role;

    public function delete($id): ?int;
}
