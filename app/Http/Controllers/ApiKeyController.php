<?php

namespace App\Http\Controllers;

use App\Http\Requests\ApiKeyRequest;
use App\Interfaces\ApiKeyInterface;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class ApiKeyController extends Controller
{

    public function __construct(protected ApiKeyInterface $apiKey) {
        $this->middleware('permission:api-keys.view')->only(['index', 'show']);
        $this->middleware('permission:api-keys.create')->only(['create', 'store']);
        $this->middleware('permission:api-keys.edit')->only(['edit', 'update', 'regenerate']);
        $this->middleware('permission:api-keys.delete')->only(['destroy', 'toggle']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        try {
            $q = $request->get('q');
            $filter = ['q' => $q];
            $list = $this->apiKey->list($filter, true);
            return Inertia::render('api-key/index', compact('list', 'q'));
        }
        catch (Exception $e) {
            Log::error('API KEY Error');
            Log::error($e->getMessage());

            return redirect()
                ->route('dashboard')
                ->with('flash', $this->flashMessage('error'));
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('api-key/create', []);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ApiKeyRequest $request): RedirectResponse
    {
        try {
            // Retrieve the validated input data...
            $validated = $request->validated();
            $validated = $request->safe()->only(['name']);
            
            // Store to database
            $apiKey = $this->apiKey->store($validated);
            $rawKey = $apiKey['raw_key'];

            $message = "New API Key created successfully. This is the only time you will see the full key—please save it securely: {$rawKey}";
            return redirect()
                ->route('api-keys.index')
                ->with('flash', $this->flashMessage('success', $message, $rawKey));
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
            $apiKey = $this->apiKey->getById($id);
            return Inertia::render('api-key/edit', compact('apiKey'));
        }
        catch (Exception $e) {
            return redirect()
                ->route('api-keys.index')
                ->with('flash', $this->flashMessage('error'));
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ApiKeyRequest $request, string $id)
    {
        try {
            $validated = $request->validated();
            $validated = $request->safe()->only(['name']);

            $this->apiKey->update($id, $validated);

            return redirect()
                ->route('api-keys.index')
                ->with('flash', $this->flashMessage('success', 'API Key updated!'));
        }
        catch (Exception $e) {
            Log::error('API Key Update Error');
            Log::error($e);
            return redirect()
                ->route('api-keys.index')
                ->with('flash', $this->flashMessage('error'));
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $this->apiKey->delete($id);

            return redirect()
                ->route('api-keys.index')
                ->with('flash', $this->flashMessage('success', 'Successfully deleting API Key'));
        }
        catch (Exception $e) {
            return redirect()
                ->route('api-keys.index')
                ->with('flash', $this->flashMessage('error'));
        }
    }

    public function toggle($id)
    {
        try {
            $this->apiKey->toggle($id);

            return redirect()
                ->route('api-keys.index')
                ->with('flash', $this->flashMessage('success', 'API Key state changed!'));
        }
        catch (Exception $e) {
            return redirect()
                ->route('api-keys.index')
                ->with('flash', $this->flashMessage('error'));
        }
    }

    public function regenerate(string $id)
    {
        try {
            $rawKey = $this->apiKey->regenerate($id);

            $message = "New API Key created successfully. This is the only time you will see the full key—please save it securely: {$rawKey}";
            return redirect()
                ->route('api-keys.index')
                ->with('flash', $this->flashMessage('success', $message, $rawKey));
        }
        catch (\Exception $e) {
            return back()->with('flash', $this->flashMessage('error'));
        }
    }

}
