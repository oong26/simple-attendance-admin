<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AppearanceController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:settings.appearance.update')->only('edit');
    }

    public function index(): Response|RedirectResponse
    {
        return Inertia::render('settings/appearance');
    }
}
