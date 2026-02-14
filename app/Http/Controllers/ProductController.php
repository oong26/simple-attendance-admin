<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductRequest;
use App\Http\Requests\ProductUpdateRequest;
use App\Interfaces\ProductInterface;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{

    public function __construct(protected ProductInterface $product) {
        $this->middleware('permission:products.view')->only(['index', 'show']);
        $this->middleware('permission:products.create')->only(['create', 'store']);
        $this->middleware('permission:products.edit')->only(['edit', 'update']);
        $this->middleware('permission:products.delete')->only('destroy');
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
            $list = $this->product->list($filter, true, $perPage);

            return Inertia::render('products/index', compact('list', 'q'));
        }
        catch (Exception $e) {
            Log::error('Dashboard Error');
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
        return Inertia::render('products/create', []);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ProductRequest $request): RedirectResponse
    {
        try {
            // Retrieve the validated input data...
            $validated = $request->validated();
            $validated = $request->safe()->only(['name', 'price', 'description']);
            
            // Store to database
            $this->product->store($validated);

            return redirect()
                ->route('products.index')
                ->with('flash', $this->flashMessage('success', 'Successfully adding new product'));
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
            $product = $this->product->getById($id);
            return Inertia::render('products/edit', compact('product'));
        }
        catch (Exception $e) {
            return redirect()
                ->route('products.index')
                ->with('flash', $this->flashMessage('error'));
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ProductUpdateRequest $request, string $id)
    {
        try {
            $validated = $request->validated();
            $validated = $request->safe()->only(['name', 'price', 'description']);

            $this->product->update($id, $validated);

            return redirect()
                ->route('products.index')
                ->with('flash', $this->flashMessage('success', 'Product updated!'));
        }
        catch (Exception $e) {
            Log::error('Product Update Error');
            Log::error($e);
            return redirect()
                ->route('products.index')
                ->with('flash', $this->flashMessage('error'));
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $this->product->delete($id);

            return redirect()
                ->route('products.index')
                ->with('flash', $this->flashMessage('success', 'Successfully deleting product'));
        }
        catch (Exception $e) {
            return redirect()
                ->route('products.index')
                ->with('flash', $this->flashMessage('error'));
        }
    }
}
