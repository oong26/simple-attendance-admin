<?php

namespace App\Interfaces;

use App\Models\Product;

interface ProductInterface {
    public function list(array $filter = [], bool $pagination = false, int $perPage = 10);
    public function store($form): Product|null;
    public function getById($id): Product|null;
    public function update($id, $form): Product|null;
    public function delete($id): int|null;
}