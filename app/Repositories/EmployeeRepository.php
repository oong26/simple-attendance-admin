<?php

namespace App\Repositories;

use App\Interfaces\EmployeeInterface;
use App\Models\Employee;
use Illuminate\Support\Facades\Storage;

class EmployeeRepository implements EmployeeInterface
{
    public function list(array $filter = [], bool $pagination = false, int $perPage = 10)
    {
        $name = $filter['q'] ?? null;
        $data = Employee::with(['department'])
            ->when($name, function ($query) use ($name) {
                $query->where('name', 'LIKE', "%$name%")
                    ->orWhere('email', 'LIKE', "%$name%")
                    ->orWhere('employee_number',  'LIKE', "%$name%");
            })
            ->latest();
        if ($pagination) {
            return $data->paginate($perPage);
        }

        return $data->get();
    }

    public function store($form, $photo = null, $facePhoto = null): ?Employee
    {
        if ($photo) {
            $path = $photo->store('photos', 'public');
            $form['photo'] = '/storage/'.$path;
        }

        if ($facePhoto) {
            $path = $facePhoto->store('photos', 'public');
            $form['photo_url'] = '/storage/'.$path;
        }

        return Employee::create($form);
    }

    public function getById($id): ?object
    {
        return Employee::with(['department'])->find($id);
    }

    public function update($id, $form, $photo = null, $facePhoto = null): ?Employee
    {
        $employee = Employee::find($id);
        if (! $employee) {
            return null;
        }

        if ($photo) {
            // Delete old cover photo if exists
            if ($employee->photo) {
                $oldPath = str_replace('/storage/', '', $employee->photo);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $photo->store('photos', 'public');
            $form['photo'] = '/storage/'.$path;
        }

        if ($facePhoto) {
            // Delete old face photo if exists
            if ($employee->photo_url) {
                $oldPath = str_replace('/storage/', '', $employee->photo_url);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $facePhoto->store('photos', 'public');
            $form['photo_url'] = '/storage/'.$path;
        }

        // Filter out null values for specific fields to prevent overwriting existing data
        // if they were not provided in the form but sent as null from the frontend
        $updateData = array_filter($form, function ($value, $key) {
            return ! in_array($key, ['face_embedding', 'photo', 'photo_url']) || ! is_null($value);
        }, ARRAY_FILTER_USE_BOTH);

        $employee->update($updateData);

        return $employee;
    }

    public function delete($id): int
    {
        $employee = Employee::findOrFail($id);
        if ($employee->photo) {
            $oldPath = str_replace('/storage/', '', $employee->photo);
            Storage::disk('public')->delete($oldPath);
        }
        if ($employee->photo_url) {
            $oldPath = str_replace('/storage/', '', $employee->photo_url);
            Storage::disk('public')->delete($oldPath);
        }

        return $employee->delete();
    }
}
