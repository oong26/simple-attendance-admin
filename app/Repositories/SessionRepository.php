<?php

namespace App\Repositories;

use App\Interfaces\SessionInterface;
use App\Models\Session;

class SessionRepository implements SessionInterface
{
    public function list(array $filter = [], bool $pagination = false, int $perPage = 10)
    {
        $query = Session::query()
            ->with('user:id,name,email') // eager load user
            ->whereNotNull('user_id')
            ->orderByDesc('last_activity');

        if (!empty($filter['q'])) {
            $q = $filter['q'];
            $query->whereHas('user', fn($qf) => $qf->where('name', 'like', "%$q%"));
        }

        if ($pagination) {
            return $query->paginate($perPage);
        }

        return $query->get();
    }

    public function deactivate($id): bool
    {
        $session = Session::find($id);

        if (!$session) {
            return false;
        }

        // Delete session
        $session->delete();

        return true;
    }
}
