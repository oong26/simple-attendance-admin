<?php

namespace App\Repositories;

use App\Interfaces\ApiSessionInterface;
use App\Models\PersonalAccessToken;

class ApiSessionRepository implements ApiSessionInterface
{
    public function list(array $filter = [], bool $pagination = false, int $perPage = 10)
    {
        $query = PersonalAccessToken::query()
            ->with('customer:id,name,phone_code,phone') // eager load user
            ->whereNotNull('tokenable_id')
            ->orderByDesc('last_used_at');

        if (!empty($filter['q'])) {
            $q = $filter['q'];
            $query->whereHas('customer', fn($qf) => $qf->where('name', 'like', "%$q%"));
        }

        if ($pagination) {
            return $query->paginate($perPage);
        }

        return $query->get();
    }

    public function deactivate($id): bool
    {
        $session = PersonalAccessToken::find($id);

        if (!$session) {
            return false;
        }

        // Delete session
        $session->delete();

        return true;
    }
}
