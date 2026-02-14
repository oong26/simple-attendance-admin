<?php

namespace App\Repositories;

use App\Interfaces\ShiftInterface;
use App\Models\Shift;

class ShiftRepository implements ShiftInterface {
    public function list(array $filter = [], bool $pagination = false, int $perPage = 10)
    {
        $name = $filter['q'] ?? null;
        $data = Shift::when($name, function ($query) use ($name) {
                $query->where('name', 'LIKE', "%$name%");
            })
            ->orderBy('start_time');
        if ($pagination) {
            return $data->paginate($perPage);
        }
        return $data->get();
    }

    public function store($form): Shift|null
    {
        return Shift::create($form);
    }

    public function getById($id): object|null
    {
        return Shift::find($id);
    }

    public function update($id, $form): Shift|null
    {
        $shift = Shift::find($id);
        if (!$shift) {
            return null;
        }
        $shift->update($form);

        return $shift;
    }

    public function delete($id): int
    {
        return Shift::findOrFail($id)->delete();
    }
}
