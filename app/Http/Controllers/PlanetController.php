<?php

namespace App\Http\Controllers;

use App\Models\Planet;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlanetController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Planets/Index', [
            'planets' => Planet::latest()->get()
        ]);
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'coordinates' => 'required|array',
            'coordinates.x' => 'required|numeric',
            'coordinates.y' => 'required|numeric',
            'coordinates.z' => 'required|numeric',
            'color' => 'nullable|string|max:255'
        ]);

        Planet::create($validated);

        return redirect()->back()->with('success', 'Planet created successfully.');
    }

    public function update(Request $request, Planet $planet)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'coordinates' => 'required|array',
            'coordinates.x' => 'required|numeric',
            'coordinates.y' => 'required|numeric',
            'coordinates.z' => 'required|numeric',
            'color' => 'nullable|string|max:255'
        ]);

        $planet->update($validated);

        return redirect()->back()->with('success', 'Planet updated successfully.');
    }

    public function destroy(Planet $planet)
    {
        if ($planet->startingTradeRoutes()->exists() || $planet->destinationTradeRoutes()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete planet with active trade routes.');
        }

        $planet->delete();
        return redirect()->back()->with('success', 'Planet deleted successfully.');
    }

    public function edit(Planet $planet): Response
    {
        return Inertia::render('Planets/Edit', [
            'planet' => $planet
        ]);
    }
} 