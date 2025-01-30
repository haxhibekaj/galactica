<?php

namespace App\Http\Controllers;

use App\Models\Resource;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ResourceController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Resources/Index', [
            'resources' => Resource::latest()->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'base_price' => 'required|numeric|min:0',
            'rarity' => 'required|in:' . implode(',', Resource::RARITIES),
            'weight_per_unit' => 'required|numeric|min:0.1',
            'unit' => 'required|in:' . implode(',', Resource::UNITS),
        ]);

        Resource::create($validated);

        return redirect()->back()->with('success', 'Resource created successfully.');
    }

    public function update(Request $request, Resource $resource)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'base_price' => 'required|numeric|min:0',
            'rarity' => 'required|in:' . implode(',', Resource::RARITIES),
            'weight_per_unit' => 'required|numeric|min:0.1',
            'unit' => 'required|in:' . implode(',', Resource::UNITS),
        ]);

        $resource->update($validated);

        return redirect()->back()->with('success', 'Resource updated successfully.');
    }

    public function destroy(Resource $resource)
    {
        if ($resource->tradeRoutes()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete resource with active trade routes.');
        }

        $resource->delete();
        return redirect()->back()->with('success', 'Resource deleted successfully.');
    }

    public function edit(Resource $resource): Response
    {
        return Inertia::render('Resources/Edit', [
            'resource' => $resource->toArray()
        ]);
    }
} 