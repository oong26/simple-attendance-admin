<?php

namespace App\Http\Controllers;

use App\Models\LateDeductionRule;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class LateDeductionRuleController extends Controller
{
    public function index()
    {
        $rules = LateDeductionRule::orderBy('created_at', 'desc')->get();
        return Inertia::render('late-deductions/index', compact('rules'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'amount_per_minute' => 'required|integer|min:0',
            'is_active' => 'boolean',
        ]);
        
        $validated['type'] = 'per_minute';

        DB::transaction(function () use ($validated) {
            if (isset($validated['is_active']) && $validated['is_active']) {
                LateDeductionRule::where('is_active', true)->update(['is_active' => false]);
            }
            LateDeductionRule::create($validated);
        });

        return back()->with('flash', $this->flashMessage('success', 'Late deduction rule created.'));
    }

    public function update(Request $request, LateDeductionRule $lateDeduction)
    {
        $validated = $request->validate([
            'amount_per_minute' => 'required|integer|min:0',
            'is_active' => 'boolean',
        ]);

        DB::transaction(function () use ($validated, $lateDeduction) {
            if (isset($validated['is_active']) && $validated['is_active']) {
                LateDeductionRule::where('id', '!=', $lateDeduction->id)->update(['is_active' => false]);
            }
            $lateDeduction->update($validated);
        });

        return back()->with('flash', $this->flashMessage('success', 'Late deduction rule updated.'));
    }

    public function destroy(LateDeductionRule $lateDeduction)
    {
        $lateDeduction->delete();
        return back()->with('flash', $this->flashMessage('success', 'Rule deleted.'));
    }
}
