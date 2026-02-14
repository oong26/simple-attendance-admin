<?php

namespace App\Repositories;

use App\Interfaces\DepartmentInterface;
use App\Models\Department;

class DepartmentRepository implements DepartmentInterface {
    public function list(array $filter = [], bool $pagination = false, int $perPage = 10)
    {
        $name = $filter['q'] ?? null;
        $data = Department::when($name, function ($query) use ($name) {
                $query->where('name', 'LIKE', "%$name%");
            })
            ->latest();
        if ($pagination) {
            return $data->paginate($perPage);
        }
        return $data->get();
    }

    public function store($form): Department|null
    {
        return Department::create($form);
    }

    public function getById($id): object|null
    {
        return Department::find($id);
    }

    public function update($id, $form): Department|null
    {
        $department = Department::find($id);
        if (!$department) {
            return null;
        }
        $department->update($form);

        return $department;
    }

    public function delete($id): int
    {
        return Department::findOrFail($id)->delete();
    }
}
