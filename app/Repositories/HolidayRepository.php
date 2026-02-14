<?php

namespace App\Repositories;

use App\Interfaces\HolidayInterface;
use App\Models\Holiday;

class HolidayRepository implements HolidayInterface {
    public function list(array $filter = [], bool $pagination = false, int $perPage = 10)
    {
        $name = $filter['q'] ?? null;
        $data = Holiday::when($name, function ($query) use ($name) {
                $query->where('name', 'LIKE', "%$name%");
            })
            ->orWhere('date', 'LIKE', "%$name%")
            ->orderBy('date', 'desc');
        if ($pagination) {
            return $data->paginate($perPage);
        }
        return $data->get();
    }

    public function store($form): Holiday|null
    {
        return Holiday::create($form);
    }

    public function getById($id): object|null
    {
        return Holiday::find($id);
    }

    public function update($id, $form): Holiday|null
    {
        $holiday = Holiday::find($id);
        if (!$holiday) {
            return null;
        }
        $holiday->update($form);

        return $holiday;
    }

    public function delete($id): int
    {
        return Holiday::findOrFail($id)->delete();
    }
}
