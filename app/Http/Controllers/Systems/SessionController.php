<?php

namespace App\Http\Controllers\Systems;

use App\Http\Controllers\Controller;
use App\Interfaces\SessionInterface;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class SessionController extends Controller
{
    public function __construct(protected SessionInterface $session) {
        $this->middleware('permission:sessions.view')->only('index');
        $this->middleware('permission:sessions.deactivate')->only('deactivate');
    }

    public function index(Request $request): Response|RedirectResponse
    {
        try {
            $q = $request->get('q');
            $perPage = $request->get('perPage', 10);
            $filter = ['q' => $q];
            $list = $this->session->list($filter, true, $perPage);

            return Inertia::render('system/session/index', compact('list', 'q'));
        }
        catch (Exception $e) {
            Log::error('Session error');
            Log::error($e);
            return redirect()
                ->route('dashboard')
                ->with('flash', $this->flashMessage('error'));
        }
    }

    public function deactivate($id): Response|RedirectResponse
    {
        try {
            $success = $this->session->deactivate($id);
            if (!$success) {
                return redirect()
                    ->route('session.index')
                    ->with('flash', $this->flashMessage('warning', 'Failed to deactivate session'));
            }
            return redirect()
                ->route('session.index')
                ->with('flash', $this->flashMessage('success', 'Session deactivated'));
        }
        catch (Exception $e) {
            Log::error('Session error');
            Log::error($e);
            return redirect()
                ->route('session.index')
                ->with('flash', $this->flashMessage('error'));
        }
    }
}
