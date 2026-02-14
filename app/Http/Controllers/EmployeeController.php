<?php

namespace App\Http\Controllers;

use App\Interfaces\DepartmentInterface;
use App\Interfaces\EmployeeInterface;
use App\Interfaces\ShiftInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Exception;

class EmployeeController extends Controller
{
    public function __construct(
        protected EmployeeInterface $employee,
        protected DepartmentInterface $department,
        protected ShiftInterface $shift
    ) {}

    public function index(Request $request)
    {
        try {
            $q = $request->get('q');
            $perPage = $request->get('perPage', 10);
            $filter = ['q' => $q];
            
            $list = $this->employee->list($filter, true, $perPage);

            return Inertia::render('employees/index', compact('list', 'q'));
        } catch (Exception $e) {
            Log::error('Employee Error: ' . $e->getMessage());
            return redirect()->route('dashboard')->with('flash', $this->flashMessage('error'));
        }
    }

    public function create()
    {
        return Inertia::render('employees/create', [
            'departments' => $this->department->list([], false),
            'shifts' => $this->shift->list([], false),
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'nullable|email|max:255|unique:employees,email',
                'phone' => 'nullable|string|max:20',
                'department_id' => 'nullable|exists:departments,id',
                'shift_id' => 'nullable|exists:shifts,id',
                'photo' => 'nullable|image|max:2048', // 2MB Max
                'grace_period_minutes' => 'nullable|integer|min:0',
                'is_active' => 'boolean',
            ]);

            $photo = $request->file('photo');
            $this->employee->store($validated, $photo);

            return redirect()->route('employees.index')
                ->with('flash', $this->flashMessage('success', 'Employee created successfully.'));
        } catch (Exception $e) {
            Log::error('Employee Store Error: ' . $e->getMessage());
            return back()->with('flash', $this->flashMessage('error'));
        }
    }

    public function edit(string $id)
    {
        try {
            $employee = $this->employee->getById($id);
            return Inertia::render('employees/edit', [
                'employee' => $employee,
                'departments' => $this->department->list([], false),
                'shifts' => $this->shift->list([], false),
            ]);
        } catch (Exception $e) {
             return redirect()->route('employees.index')->with('flash', $this->flashMessage('error'));
        }
    }

    public function update(Request $request, string $id)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'nullable|email|max:255|unique:employees,email,' . $id,
                'phone' => 'nullable|string|max:20',
                'department_id' => 'nullable|exists:departments,id',
                'shift_id' => 'nullable|exists:shifts,id',
                'photo' => 'nullable|image|max:2048',
                'grace_period_minutes' => 'nullable|integer|min:0',
                'is_active' => 'boolean',
            ]);

            $photo = $request->file('photo');
            $this->employee->update($id, $validated, $photo);

            return redirect()->route('employees.index')
                ->with('flash', $this->flashMessage('success', 'Employee updated successfully.'));
        } catch (Exception $e) {
            Log::error('Employee Update Error: ' . $e->getMessage());
            return back()->with('flash', $this->flashMessage('error'));
        }
    }

    public function destroy(string $id)
    {
        try {
            $this->employee->delete($id);
            return redirect()->route('employees.index')
                ->with('flash', $this->flashMessage('success', 'Employee deleted successfully.'));
        } catch (Exception $e) {
            Log::error('Employee Destroy Error: ' . $e->getMessage());
            return back()->with('flash', $this->flashMessage('error'));
        }
    }
}
