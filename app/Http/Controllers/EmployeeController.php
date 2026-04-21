<?php

namespace App\Http\Controllers;

use App\Actions\Employee\CheckQrCodeAction;
use App\Interfaces\DepartmentInterface;
use App\Interfaces\EmployeeInterface;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    public function __construct(
        protected EmployeeInterface $employee,
        protected DepartmentInterface $department
    ) {
        $this->middleware('permission:employees.view')->only(['index', 'verifyFace', 'verifyFaceGlobal']);
        $this->middleware('permission:employees.create')->only(['create', 'store', 'updateFace']);
        $this->middleware('permission:employees.edit')->only(['edit', 'update', 'updateFace']);
        $this->middleware('permission:employees.delete')->only(['destroy']);
    }

    public function index(Request $request)
    {
        try {
            $q = $request->get('q');
            $perPage = $request->get('perPage', 10);
            $filter = ['q' => $q];

            $list = $this->employee->list($filter, true, $perPage);

            return Inertia::render('employees/index', compact('list', 'q'));
        } catch (Exception $e) {
            Log::error('Employee Error: '.$e->getMessage());

            return redirect()->route('dashboard')->with('flash', $this->flashMessage('error'));
        }
    }

    public function create()
    {
        return Inertia::render('employees/create', [
            'departments' => $this->department->list([], false),
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'employee_number' => 'required|string|max:50|unique:employees,employee_number',
                'name' => 'required|string|max:255',
                'email' => 'nullable|email|max:255|unique:employees,email',
                'phone' => 'nullable|string|max:20',
                'department_id' => 'nullable|exists:departments,id',
                'job_title' => 'nullable|string|max:100',
                'photo' => 'nullable|image|max:2048', // 2MB Max
                'face_photo' => 'nullable|image|max:2048',
                'face_embedding' => 'nullable|array',
                'contract_type' => 'nullable|in:full_time,part_time,contract,internship',
                'attendance_type' => 'nullable|in:onsite,remote,hybrid',
                'contract_end_date' => 'nullable|date',
                'grace_period_minutes' => 'nullable|integer|min:0',
                'is_active' => 'boolean',
            ]);

            $photo = $request->file('photo');
            $facePhoto = $request->file('face_photo');
            $this->employee->store($validated, $photo, $facePhoto);

            return redirect()->route('employees.index')
                ->with('flash', $this->flashMessage('success', 'Employee created successfully.'));
        } catch (Exception $e) {
            Log::error('Employee Store Error: '.$e->getMessage());

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
            ]);
        } catch (Exception $e) {
            return redirect()->route('employees.index')->with('flash', $this->flashMessage('error'));
        }
    }

    public function update(Request $request, string $id)
    {
        try {
            $validated = $request->validate([
                'employee_number' => 'required|string|max:50|unique:employees,employee_number,' . $id,
                'name' => 'required|string|max:255',
                'email' => 'nullable|email|max:255|unique:employees,email,' . $id,
                'phone' => 'nullable|string|max:20',
                'department_id' => 'nullable|exists:departments,id',
                'job_title' => 'nullable|string|max:100',
                'photo' => 'nullable|image|max:2048',
                'face_photo' => 'nullable|image|max:2048',
                'face_embedding' => 'nullable|array',
                'contract_type' => 'nullable|in:full_time,part_time,contract,internship',
                'attendance_type' => 'nullable|in:onsite,remote,hybrid',
                'contract_end_date' => 'nullable|date',
                'grace_period_minutes' => 'nullable|integer|min:0',
                'is_active' => 'boolean',
            ]);

            $photo = $request->file('photo');
            $facePhoto = $request->file('face_photo');
            $this->employee->update($id, $validated, $photo, $facePhoto);

            return redirect()->route('employees.index')
                ->with('flash', $this->flashMessage('success', 'Employee updated successfully.'));
        } catch (Exception $e) {
            Log::error('Employee Update Error: '.$e->getMessage());

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
            Log::error('Employee Destroy Error: '.$e->getMessage());

            return back()->with('flash', $this->flashMessage('error'));
        }
    }

    public function updateFace(Request $request, string $id)
    {
        try {
            $validated = $request->validate([
                'photo' => 'nullable|image|max:2048',
                'face_embedding' => 'required|array',
            ]);

            $photo = $request->file('photo'); // This is from the webcam capture modal so it maps to facePhoto
            $this->employee->update($id, $validated, null, $photo);

            return back()->with('flash', $this->flashMessage('success', 'Employee face recorded successfully.'));
        } catch (Exception $e) {
            Log::error('Employee Update Face Error: '.$e->getMessage());

            return back()->with('flash', $this->flashMessage('error', 'Failed to record face.'));
        }
    }

    public function verifyFace(Request $request, string $id)
    {
        try {
            $request->validate([
                'face_embedding' => 'required|array',
            ]);

            $employee = $this->employee->getById($id);
            if (! $employee || ! $employee->face_embedding) {
                return back()->with('flash', $this->flashMessage('error', 'Face not registered for this employee'));
            }

            $inputEmbedding = $request->face_embedding;
            $dbEmbedding = $employee->face_embedding;

            $distance = 0;
            for ($i = 0; $i < 128; $i++) {
                $distance += pow((float) $inputEmbedding[$i] - (float) $dbEmbedding[$i], 2);
            }
            $distance = sqrt($distance);

            if ($distance <= 0.45) {
                return back()->with('flash', $this->flashMessage('success', 'Face Verified Successfully! (Distance: '.round($distance, 4).')'));
            } else {
                return back()->with('flash', $this->flashMessage('error', 'Face Does Not Match! (Distance: '.round($distance, 4).')'));
            }
        } catch (Exception $e) {
            Log::error('Employee Verify Face Error: '.$e->getMessage());

            return back()->with('flash', $this->flashMessage('error', 'Server Error.'));
        }
    }

    public function verifyFaceGlobal(Request $request)
    {
        try {
            $request->validate([
                'face_embedding' => 'required|array',
            ]);

            $inputEmbedding = $request->face_embedding;

            // Get all active employees with face embeddings
            // Since we're using a repository, we need to fetch the raw models or ensure the repo returns the embedding.
            // A quick fallback is to query the model directly for this specific matching logic.
            $employees = \App\Models\Employee::where('is_active', true)->whereNotNull('face_embedding')->get();

            $bestMatch = null;
            $bestDistance = 1.0; // Initialize with a distance higher than our threshold
            $threshold = 0.45;

            foreach ($employees as $employee) {
                $dbEmbedding = $employee->face_embedding;

                if (is_array($dbEmbedding) && count($dbEmbedding) === 128) {
                    $distance = 0;
                    for ($i = 0; $i < 128; $i++) {
                        $distance += pow((float) $inputEmbedding[$i] - (float) $dbEmbedding[$i], 2);
                    }
                    $distance = sqrt($distance);

                    if ($distance < $bestDistance) {
                        $bestDistance = $distance;
                        $bestMatch = $employee;
                    }
                }
            }

            if ($bestMatch && $bestDistance <= $threshold) {
                $bestMatch->load('department');

                return back()->with('flash', $this->flashMessage('success', 'Face Match Found: '.$bestMatch->name.' (Distance: '.round($bestDistance, 4).')'))->with('matched_employee', $bestMatch);
            } else {
                return back()->with('flash', $this->flashMessage('error', 'No matching face found globally.'));
            }
        } catch (Exception $e) {
            Log::error('Employee Global Face Verify Error: '.$e->getMessage());

            return back()->with('flash', $this->flashMessage('error', 'Server Error during global verification.'));
        }
    }

    public function checkQrCode(Request $request, CheckQrCodeAction $action)
    {
        return $action->execute($request);
    }
}
