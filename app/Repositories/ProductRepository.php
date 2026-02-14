<?php

namespace App\Repositories;

use App\Interfaces\ProductInterface;
use App\Models\Product;

class ProductRepository implements ProductInterface {
    public function list(array $filter = [], bool $pagination = false, int $perPage = 10)
    {
        $name = $filter['q'] ?? null;
        $price = $filter['q'] ?? null;
        $data = Product::when($name, function ($query) use ($name) {
                $query->where('name', 'ILIKE', "%$name%");
            })
            ->when($price, function ($query) use ($price) {
                $query->orWhere('price', 'ILIKE', "%$price%");
            })
            ->latest();
        if ($pagination) {
            return $data->paginate($perPage);
        }
        return $data->get();
    }

    public function store($form): Product|null
    {
        return Product::create($form);
    }

    public function getById($id): Product|null
    {
        return Product::find($id);
    }

    public function update($id, $form): Product|null
    {
        $product = Product::find($id);
        if (!$product) {
            return null;
        }
        $product->update($form);

        return $product;
    }

    public function delete($id): int
    {
        return Product::find($id)->delete();
    }
}