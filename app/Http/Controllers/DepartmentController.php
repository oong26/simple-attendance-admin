<?php

namespace App\Http\Controllers;

use App\Interfaces\DepartmentInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Exception;

class DepartmentController extends Controller
{
    public function __construct(protected DepartmentInterface $department)
    {
        // Add permissions middleware if needed
    }

    public function index(Request $request)
    {
        try {
            $q = $request->get('q');
            $perPage = $request->get('perPage', 10);
            $filter = ['q' => $q];

            $list = $this->department->list($filter, true, $perPage);

            return Inertia::render('departments/index', compact('list', 'q'));
        } catch (Exception $e) {
            Log::error('Department Error: ' . $e->getMessage());
            return redirect()->route('dashboard')->with('flash', $this->flashMessage('error'));
        }
    }

    public function create()
    {
        return Inertia::render('departments/create');
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:departments,name',
            ]);

            $this->department->store($validated);

            return redirect()->route('departments.index')
                ->with('flash', $this->flashMessage('success', 'Department created successfully.'));
        } catch (Exception $e) {
            Log::error('Department Store Error: ' . $e->getMessage());
            return back()->with('flash', $this->flashMessage('error'));
        }
    }

    public function edit(string $id)
    {
        try {
            $department = $this->department->getById($id);
            return Inertia::render('departments/edit', compact('department'));
        } catch (Exception $e) {
             return redirect()->route('departments.index')->with('flash', $this->flashMessage('error'));
        }
    }

    public function update(Request $request, string $id)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:departments,name,' . $id,
            ]);

            $this->department->update($id, $validated);

            return redirect()->route('departments.index')
                ->with('flash', $this->flashMessage('success', 'Department updated successfully.'));
        } catch (Exception $e) {
            Log::error('Department Update Error: ' . $e->getMessage());
            return back()->with('flash', $this->flashMessage('error'));
        }
    }

    public function destroy(string $id)
    {
        try {
            $this->department->delete($id);
            return redirect()->route('departments.index')
                ->with('flash', $this->flashMessage('success', 'Department deleted successfully.'));
        } catch (Exception $e) {
            Log::error('Department Destroy Error: ' . $e->getMessage());
            return back()->with('flash', $this->flashMessage('error'));
        }
    }
}
