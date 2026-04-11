<?php

namespace App\Http\Controllers\Systems;

use App\Http\Controllers\Controller;
use App\Interfaces\ApiSessionInterface;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class ApiSessionController extends Controller
{
    public function __construct(protected ApiSessionInterface $session)
    {
        $this->middleware('permission:api-sessions.view')->only('index');
        $this->middleware('permission:api-sessions.deactivate')->only('deactivate');
    }

    public function index(Request $request): Response|RedirectResponse
    {
        try {
            $q = $request->get('q');
            $perPage = $request->get('perPage', 10);
            $filter = ['q' => $q];
            $list = $this->session->list($filter, true, $perPage);

            return Inertia::render('system/api-session/index', compact('list', 'q'));
        } catch (Exception $e) {
            Log::error('API Session error');
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
            if (! $success) {
                return redirect()
                    ->route('api-session.index')
                    ->with('flash', $this->flashMessage('warning', 'Failed to deactivate session'));
            }

            return redirect()
                ->route('api-session.index')
                ->with('flash', $this->flashMessage('success', 'Session deactivated'));
        } catch (Exception $e) {
            Log::error('API Session error');
            Log::error($e);

            return redirect()
                ->route('api-session.index')
                ->with('flash', $this->flashMessage('error'));
        }
    }
}
