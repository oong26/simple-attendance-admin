<?php

namespace App\Http\Controllers;

use App\Interfaces\HolidayInterface;
use App\Services\HolidayService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Exception;

class HolidayController extends Controller
{
    public function __construct(protected HolidayInterface $holiday)
    {
        $this->middleware('permission:holidays.view')->only(['index']);
        $this->middleware('permission:holidays.create')->only(['create', 'store', 'synchronize']);
        $this->middleware('permission:holidays.edit')->only(['edit', 'update', 'synchronize']);
        $this->middleware('permission:holidays.delete')->only(['destroy']);
    }

    public function index(Request $request)
    {
        try {
            $q = $request->get('q');
            $perPage = $request->get('perPage', 10);
            $filter = ['q' => $q];

            $list = $this->holiday->list($filter, true, $perPage);

            return Inertia::render('holidays/index', compact('list', 'q'));
        } catch (Exception $e) {
            Log::error('Holiday Error: ' . $e->getMessage());
            return redirect()->route('dashboard')->with('flash', $this->flashMessage('error'));
        }
    }

    public function create()
    {
        return Inertia::render('holidays/create');
    }

    public function store(Request $request)
    {
        try {
             $validated = $request->validate([
                'name' => 'required|string|max:255',
                'date' => 'required|date',
                'is_recurring' => 'boolean',
            ]);

            $this->holiday->store($validated);

            return redirect()->route('holidays.index')
                ->with('flash', $this->flashMessage('success', 'Holiday created successfully.'));
        } catch (Exception $e) {
            Log::error('Holiday Store Error: ' . $e->getMessage());
            return back()->with('flash', $this->flashMessage('error'));
        }
    }

    public function edit(string $id)
    {
        try {
             $holiday = $this->holiday->getById($id);
             return Inertia::render('holidays/edit', compact('holiday'));
        } catch (Exception $e) {
             return redirect()->route('holidays.index')->with('flash', $this->flashMessage('error'));
        }
    }

    public function update(Request $request, string $id)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'date' => 'required|date',
                'is_recurring' => 'boolean',
            ]);

            $this->holiday->update($id, $validated);

            return redirect()->route('holidays.index')
                ->with('flash', $this->flashMessage('success', 'Holiday updated successfully.'));
        } catch (Exception $e) {
            Log::error('Holiday Update Error: ' . $e->getMessage());
            return back()->with('flash', $this->flashMessage('error'));
        }
    }

    public function destroy(string $id)
    {
        try {
            $this->holiday->delete($id);
            return redirect()->route('holidays.index')
                ->with('flash', $this->flashMessage('success', 'Holiday deleted successfully.'));
        } catch (Exception $e) {
            Log::error('Holiday Destroy Error: ' . $e->getMessage());
            return back()->with('flash', $this->flashMessage('error'));
        }
    }

    public function synchronize(HolidayService $service)
    {
        try {
            $result = $service->synchronize();
            if (isset($result['error'])) {
                return redirect()
                    ->route('holidays.index')
                    ->with('flash', $this->flashMessage('error', $result['error']));
            }
            $count = $result['count'];
            $year = date('Y');

            return redirect()
                ->route('holidays.index')
                ->with('flash', $this->flashMessage('success', "Successfully synchronized $count national holidays for the year $year"));
        } catch (Exception $e) {
            Log::error('DayOff Synchronize Error');
            Log::error($e);
            return redirect()
                ->route('holidays.index')
                ->with('flash', $this->flashMessage('error', 'Failed to synchronize national holidays'));
        }
    }
}
