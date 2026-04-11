<?php

namespace App\Interfaces;

interface SessionInterface
{
    public function list(array $filter = [], bool $pagination = false, int $perPage = 10);

    public function deactivate($id): bool;
}
