<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserRequest;
use App\Http\Requests\UserUpdateRequest;
use App\Interfaces\RolePermissionInterface;
use App\Interfaces\UserInterface;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function __construct(protected UserInterface $user, protected RolePermissionInterface $rolePermission) {
        $this->middleware('permission:users.view')->only(['index', 'show']);
        $this->middleware('permission:users.create')->only(['create', 'store']);
        $this->middleware('permission:users.edit')->only(['edit', 'update']);
        $this->middleware('permission:users.delete')->only('destroy');
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $q = $request->get('q');
            $perPage = $request->get('perPage', 10);
            $filter = ['q' => $q];
            $list = $this->user->list($filter, true, $perPage);

            return Inertia::render('users/index', compact('list', 'q'));
        }
        catch (Exception $e) {
            Log::error('User Error');
            Log::error($e->getMessage());

            return redirect()
                ->route('dashboard')
                ->with('flash', $this->flashMessage('error'));
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response|RedirectResponse
    {
        try {
            $roles = $this->rolePermission->list();

            return Inertia::render('users/create', compact('roles'));
        }
        catch (Exception $e) {
            Log::error('User Error');
            Log::error($e->getMessage());

            return redirect()
                ->route('dashboard')
                ->with('flash', $this->flashMessage('error'));
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(UserRequest $request): RedirectResponse
    {   
        DB::beginTransaction();
        try {
            // Retrieve the validated input data...
            $validated = $request->validated();
            $validated = $request->safe()->only(['name', 'email']);
            
            // Store to database
            $user = $this->user->store($validated);

            // Assign role
            $user->assignRole($request->safe()->only('role'));

            DB::commit();
            return redirect()
                ->route('users.index')
                ->with('flash', $this->flashMessage('success', 'Successfully adding new user'));
        }
        catch (Exception $e) {
            DB::rollBack();
            Log::error('User Error');
            Log::error($e);
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
            $user = $this->user->getById($id);
            $roles = $this->rolePermission->list();

            return Inertia::render('users/edit', compact('user', 'roles'));
        }
        catch (Exception $e) {
            Log::error('User Error');
            Log::error($e);
            return redirect()
                ->route('users.index')
                ->with('flash', $this->flashMessage('error'));
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UserUpdateRequest $request, string $id)
    {
        try {
            $validated = $request->validated();
            $validated = $request->safe()->only(['name', 'email']);

            // Update user
            $user = $this->user->update($id, $validated);

            // Synchronize permission
            $user->syncRoles($request->safe()->only(['role']));

            return redirect()
                ->route('users.index')
                ->with('flash', $this->flashMessage('success', 'User updated!'));
        }
        catch (Exception $e) {
            Log::error('User Update Error');
            Log::error($e);
            return redirect()
                ->route('users.index')
                ->with('flash', $this->flashMessage('error'));
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $this->user->delete($id);

            return redirect()
                ->route('users.index')
                ->with('flash', $this->flashMessage('success', 'Successfully deleting user'));
        }
        catch (Exception $e) {
            return redirect()
                ->route('users.index')
                ->with('flash', $this->flashMessage('error'));
        }
    }
}
