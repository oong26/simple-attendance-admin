<?php

namespace App\Repositories;

use App\Http\Resources\UserResource;
use App\Interfaces\UserInterface;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserRepository implements UserInterface {
    public function list(array $filter = [], bool $pagination = false, int $perPage = 10)
    {
        $name = $filter['q'] ?? null;
        $email = $filter['q'] ?? null;
        $relations = ['roles:id,name,guard_name'];
        $data = User::with($relations)
            ->when($name, function ($query) use ($name) {
                $query->where('name', 'ILIKE', "%$name%");
            })
            ->when($email, function ($query) use ($email) {
                $query->orWhere('email', 'ILIKE', "%$email%");
            })
            ->latest();
        if ($pagination) {
            return $data->paginate($perPage)->through(
                fn ($user) => UserResource::make($user)->toArray(request())
            );
        }
        return $data->get()->map(
            fn ($user) => UserResource::make($user)->toArray(request())
        );
    }

    public function store($form): User|null
    {
        $form['password'] = Hash::make('12345678');
        return User::create($form);
    }

    public function getById($id): object|null
    {
        return (object) UserResource::make(User::with('roles:id,name,guard_name')
            ->find($id))
            ->toArray(request());
    }

    public function update($id, $form): User|null
    {
        $user = User::find($id);
        if (!$user) {
            return null;
        }
        $user->update($form);

        return $user;
    }

    public function delete($id): int
    {
        return User::findOrFail($id)->delete();
    }
}