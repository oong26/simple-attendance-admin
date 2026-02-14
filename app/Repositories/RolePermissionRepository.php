<?php

namespace App\Repositories;

use App\Interfaces\RolePermissionInterface;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionRepository implements RolePermissionInterface {
    
    public function list(array $filter = [], bool $pagination = false, int $perPage = 10)
    {
        $name = $filter['q'] ?? null;
        $data = Role::when($name, function ($query) use ($name) {
                $query->where('name', 'ILIKE', "%$name%");
            })
            ->latest();
        if ($pagination) {
            return $data->paginate($perPage);
        }
        return $data->get();
    }

    public function listPermission(array $filter = [], bool $group = false, bool $pagination = false, int $perPage = 10)
    {
        $name = $filter['q'] ?? null;
        $data = Permission::when($name, function ($query) use ($name) {
                $query->where('name', 'ILIKE', "%$name%");
            })
            ->latest();
        if ($pagination) {
            return $data->paginate($perPage);
        }
        if ($group) {
            $data = $data->get();

            $groups = [];

            foreach ($data as $permission) {
                // permission.name => "products.view"
                $arr = explode('.', $permission->name);
                $group = $arr[0];
                $action = $arr[1];
                if (isset($arr[2])) {
                    $action .= " {$arr[2]}";
                }

                $groups[$group][] = [
                    'id' => $permission->id,
                    'name' => $permission->name,
                    'action' => $action,
                ];
            }

            return $groups;
        }
        return $data->get();
    }

    public function store($form): Role|null
    {
        $form['name'] = strtolower($form['name']);
        $role = Role::create($form);
        if (!empty($form['permissions'])) {
            $role->givePermissionTo($form['permissions']);
        }
        return $role;
    }

    public function getById($id, bool $withPermission = false): Role|null
    {
        $relations = $withPermission ? ['permissions:id,name,guard_name'] : [];
        return Role::with($relations)->find($id);
    }

    public function update($id, $form): Role|null
    {
        $role = Role::find($id);
        if (!$role) {
            return null;
        }
        // Update role name
        $role->update([
            'name' => strtolower($form['name'])
        ]);

        // Sync permissions (best practice)
        $role->syncPermissions($form['permissions'] ?? []);

        return $role;
    }

    public function delete($id): int
    {
        return Role::find($id)->delete();
    }
}