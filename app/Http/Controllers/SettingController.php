<?php

namespace App\Http\Controllers;

use App\Interfaces\SettingInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Exception;

class SettingController extends Controller
{
    public function index()
    {
        try {
            // Fetch all settings as key-value pairs
            $settings = Setting::all()->pluck('value', 'key');
            
            return Inertia::render('settings/index', compact('settings'));
        } catch (Exception $e) {
            Log::error('Setting Error: ' . $e->getMessage());
            return redirect()->route('dashboard')->with('flash', $this->flashMessage('error'));
        }
    }

    public function update(Request $request)
    {
        try {
            $validated = $request->validate([
                'global_grace_period' => 'required|integer|min:0',
            ]);

            foreach ($validated as $key => $value) {
                Setting::updateOrCreate(['key' => $key], ['value' => $value]);
            }

            return back()->with('flash', $this->flashMessage('success', 'Settings updated successfully.'));
        } catch (Exception $e) {
            Log::error('Setting Update Error: ' . $e->getMessage());
            return back()->with('flash', $this->flashMessage('error'));
        }
    }
}
