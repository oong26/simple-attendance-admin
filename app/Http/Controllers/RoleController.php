<?php

namespace App\Http\Controllers;

use App\Http\Requests\RolePermissionRequest;
use App\Http\Requests\RolePermissionUpdateRequest;
use App\Interfaces\RolePermissionInterface;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller
{
    public function __construct(protected RolePermissionInterface $rolePermission) {
        $this->middleware('permission:roles.view')->only(['index', 'show']);
        $this->middleware('permission:roles.create')->only(['create', 'store']);
        $this->middleware('permission:roles.edit')->only(['edit', 'update']);
        $this->middleware('permission:roles.delete')->only('destroy');
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        try {
            $q = $request->get('q');
            $perPage = $request->get('perPage', 10);
            $filter = ['q' => $q];
            $list = $this->rolePermission->list($filter, true, $perPage);

            return Inertia::render('roles/index', compact('list', 'q'));
        }
        catch (Exception $e) {
            Log::error('Role Error');
            Log::error($e->getMessage());

            return redirect()
                ->route('dashboard')
                ->with('flash', $this->flashMessage('error'));
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        try {
            $permissions = $this->rolePermission->listPermission([], true);
            return Inertia::render('roles/create', compact('permissions'));
        }
        catch (Exception $e) {
            Log::error('Role Error');
            Log::error($e->getMessage());

            return redirect()
                ->route('dashboard')
                ->with('flash', $this->flashMessage('error'));
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(RolePermissionRequest $request)
    {
        try {
            // Retrieve the validated input data...
            $validated = $request->validated();
            $validated = $request->safe()->only(['name', 'permissions']);

            $this->rolePermission->store($validated);

            return redirect()
                ->route('roles.index')
                ->with('flash', $this->flashMessage('success', 'Successfully adding new role'));
        }
        catch (Exception $e) {
            return redirect()
                ->back()
                ->with('flash', $this->flashMessage('error'));
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        try {
            $role = $this->rolePermission->getById($id, true);
            $permissions = $this->rolePermission->listPermission([], true);

            return Inertia::render('roles/edit', compact('role', 'permissions'));
        }
        catch (Exception $e) {
            Log::error('Role Error');
            Log::error($e->getMessage());

            return redirect()
                ->route('dashboard')
                ->with('flash', $this->flashMessage('error'));
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(RolePermissionUpdateRequest $request, string $id)
    {
        try {
            $validated = $request->safe()->only(['name', 'permissions']);

            $this->rolePermission->update($id, $validated);

            return redirect()
                ->route('roles.index')
                ->with('flash', $this->flashMessage('success', 'Role updated successfully'));
        }
        catch (\Exception $e) {
            return redirect()
                ->back()
                ->with('flash', $this->flashMessage('error', 'Something went wrong'));
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $this->rolePermission->delete($id);

            return redirect()
                ->route('roles.index')
                ->with('flash', $this->flashMessage('success', 'Successfully deleting role'));
        }
        catch (Exception $e) {
            return redirect()
                ->route('roles.index')
                ->with('flash', $this->flashMessage('error'));
        }
    }
}
