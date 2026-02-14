<?php

namespace App\Interfaces;

use App\Models\ApiKey;

interface ApiKeyInterface {
    public function list(array $filter = [], bool $pagination = false, int $perPage = 10);
    public function store($form): array;
    public function getById($id): ApiKey|null;
    public function update($id, $form): ApiKey|null;
    public function delete($id): int|null;
    public function toggle($id): void;
    public function regenerate($id): string|null;
}