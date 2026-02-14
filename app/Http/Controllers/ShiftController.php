<?php

namespace App\Http\Controllers;

use App\Interfaces\ShiftInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Exception;

class ShiftController extends Controller
{
    public function __construct(protected ShiftInterface $shift)
    {
    }

    public function index(Request $request)
    {
        try {
            $q = $request->get('q');
            $perPage = $request->get('perPage', 10);
            $filter = ['q' => $q];

            $list = $this->shift->list($filter, true, $perPage);

            return Inertia::render('shifts/index', compact('list', 'q'));
        } catch (Exception $e) {
            Log::error('Shift Error: ' . $e->getMessage());
            return redirect()->route('dashboard')->with('flash', $this->flashMessage('error'));
        }
    }

    public function create()
    {
        return Inertia::render('shifts/create');
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'start_time' => 'required|date_format:H:i',
                'end_time' => 'required|date_format:H:i',
            ]);

            $this->shift->store($validated);

            return redirect()->route('shifts.index')
                ->with('flash', $this->flashMessage('success', 'Shift created successfully.'));
        } catch (Exception $e) {
            Log::error('Shift Store Error: ' . $e->getMessage());
            return back()->with('flash', $this->flashMessage('error'));
        }
    }

    public function edit(string $id)
    {
        try {
            $shift = $this->shift->getById($id);
            return Inertia::render('shifts/edit', compact('shift'));
        } catch (Exception $e) {
            return redirect()->route('shifts.index')->with('flash', $this->flashMessage('error'));
        }
    }

    public function update(Request $request, string $id)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'start_time' => 'required|date_format:H:i',
                'end_time' => 'required|date_format:H:i',
            ]);

            $this->shift->update($id, $validated);

            return redirect()->route('shifts.index')
                ->with('flash', $this->flashMessage('success', 'Shift updated successfully.'));
        } catch (Exception $e) {
            Log::error('Shift Update Error: ' . $e->getMessage());
            return back()->with('flash', $this->flashMessage('error'));
        }
    }

    public function destroy(string $id)
    {
        try {
            $this->shift->delete($id);
            return redirect()->route('shifts.index')
                ->with('flash', $this->flashMessage('success', 'Shift deleted successfully.'));
        } catch (Exception $e) {
            Log::error('Shift Destroy Error: ' . $e->getMessage());
            return back()->with('flash', $this->flashMessage('error'));
        }
    }
}
