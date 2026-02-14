<?php

namespace App\Repositories;

use App\Interfaces\ApiKeyInterface;
use App\Models\ApiKey;
use Illuminate\Support\Facades\Hash;

class ApiKeyRepository implements ApiKeyInterface {
    public function list(array $filter = [], bool $pagination = false, int $perPage = 10)
    {
        $name = $filter['q'] ?? null;
        $data = ApiKey::when($name, function ($query) use ($name) {
                $query->where('name', 'ILIKE', "%$name%");
            })
            ->latest();
        if ($pagination) {
            return $data->paginate($perPage);
        }
        return $data->get();
    }

    public function store($form): array
    {
        $rawKey = bin2hex(random_bytes(32)); // secure 64-char key

        // Save only the hashed key
        $apiKey = ApiKey::create([
            'name'     => $form['name'],
            'key_hash' => Hash::make($rawKey),
            'state'    => true, // optional default
        ]);

        // Return model + raw key so controller can show once
        return [
            'model' => $apiKey,
            'raw_key' => $rawKey,
        ];
    }

    public function getById($id): ApiKey|null
    {
        return ApiKey::find($id);
    }

    public function update($id, $form): ApiKey|null
    {
        $apiKey = ApiKey::find($id);
        if (!$apiKey) {
            return null;
        }
        $apiKey->update($form);

        return $apiKey;
    }

    public function delete($id): int
    {
        return ApiKey::find($id)->delete();
    }

    public function toggle($id): void
    {
        $apiKey = ApiKey::findOrFail($id);

        $apiKey->state = !$apiKey->state;
        $apiKey->save();
    }

    public function regenerate($id): string|null
    {
        $apiKey = ApiKey::findOrFail($id);

        // Generate new raw key
        $rawKey = bin2hex(random_bytes(32)); // secure 64-char key

        // Save hashed version
        $apiKey->update([
            'key_hash' => Hash::make($rawKey),
        ]);

        return $rawKey; // Return ONLY raw key to show once
    }
}