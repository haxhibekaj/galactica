<?php

namespace App\Http\Controllers;

use App\Models\Planet;
use App\Models\Resource;
use App\Models\TradeRoute;
use App\Models\SpaceWeather;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TradeRouteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $tradeRoutes = TradeRoute::with(['startingPlanet', 'destinationPlanet', 'resource', 'starships'])
            ->latest()
            ->get()
            ->map(function ($route) {
                $route->status = $this->calculateRouteStatus($route);
                return $route;
            });

        return Inertia::render('TradeRoutes/Index', [
            'tradeRoutes' => $tradeRoutes,
            'planets' => Planet::select('id', 'name', 'coordinates')->get(),
            'resources' => Resource::select('id', 'name')->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:trade_routes,name',
            'starting_planet_id' => 'required|exists:planets,id',
            'destination_planet_id' => [
                'required',
                'exists:planets,id',
                'different:starting_planet_id',
                function ($attribute, $value, $fail) use ($request) {
                    // Check if a route already exists between these planets
                    $exists = TradeRoute::where('starting_planet_id', $request->starting_planet_id)
                        ->where('destination_planet_id', $value)
                        ->exists();
                    
                    if ($exists) {
                        $fail('A trade route already exists between these planets.');
                    }
                }
            ],
            'resource_id' => 'required|exists:resources,id',
        ]);

        // Calculate travel time
        $startingPlanet = Planet::find($validated['starting_planet_id']);
        $destinationPlanet = Planet::find($validated['destination_planet_id']);

        // Convert coordinates to array if they're objects
        $startCoords = (array)$startingPlanet->coordinates;
        $endCoords = (array)$destinationPlanet->coordinates;

        $distance = sqrt(
            pow($endCoords['x'] - $startCoords['x'], 2) +
            pow($endCoords['y'] - $startCoords['y'], 2) +
            pow($endCoords['z'] - $startCoords['z'], 2)
        );

        $validated['travel_time'] = ceil($distance);

        TradeRoute::create($validated);

        return redirect()->route('trade-routes.index')
            ->with('success', 'Trade Route created successfully.');
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
    public function edit(TradeRoute $tradeRoute): Response
    {
        return Inertia::render('TradeRoutes/Edit', [
            'tradeRoute' => $tradeRoute->load(['startingPlanet', 'destinationPlanet', 'resource']),
            'planets' => Planet::select('id', 'name', 'coordinates')->get(),
            'resources' => Resource::select('id', 'name')->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, TradeRoute $tradeRoute)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'starting_planet_id' => 'required|exists:planets,id',
            'destination_planet_id' => [
                'required',
                'exists:planets,id',
                'different:starting_planet_id'
            ],
            'resource_id' => 'required|exists:resources,id',
            'travel_time' => 'required|integer|min:1',
        ]);

        // Verify travel time calculation
        $startPlanet = Planet::find($validated['starting_planet_id']);
        $destPlanet = Planet::find($validated['destination_planet_id']);

        $calculatedTime = $this->calculateTravelTime(
            $startPlanet->coordinates,
            $destPlanet->coordinates
        );

        // Allow for some flexibility in the travel time (±10%)
        $minTime = floor($calculatedTime * 0.9);
        $maxTime = ceil($calculatedTime * 1.1);

        if ($validated['travel_time'] < $minTime || $validated['travel_time'] > $maxTime) {
            return back()->withErrors([
                'travel_time' => 'The provided travel time seems incorrect based on the distance between planets.'
            ]);
        }

        $tradeRoute->update($validated);

        return redirect()->route('trade-routes.index')->with('success', 'Trade route updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TradeRoute $tradeRoute)
    {
        $tradeRoute->delete();
        return redirect()->back()->with('success', 'Trade route deleted successfully');
    }

    private function calculateTravelTime(array $start, array $end): int
    {
        // Calculate 3D Euclidean distance
        $distance = sqrt(
            pow($end['x'] - $start['x'], 2) +
            pow($end['y'] - $start['y'], 2) +
            pow($end['z'] - $start['z'], 2)
        );

        // Convert distance to travel time (hours)
        return ceil($distance);
    }

    private function calculateRouteStatus(TradeRoute $route): string
    {
        // Check for broken/maintenance starships on this route
        $hasStarshipIssues = $route->starships()
            ->whereIn('status', ['maintenance', 'broken'])
            ->exists();
        
        if ($hasStarshipIssues) {
            return 'dangerous';
        }

        // Check for active weather events affecting this route
        $startPlanet = $route->startingPlanet;
        $endPlanet = $route->destinationPlanet;

        // Convert coordinates to array if they're objects
        $startCoords = (array)$startPlanet->coordinates;
        $endCoords = (array)$endPlanet->coordinates;

        $hasWeatherEvent = SpaceWeather::where('start_time', '<=', now())
            ->where('end_time', '>=', now())
            ->where(function($query) use ($startCoords, $endCoords) {
                $query->where(function($q) use ($startCoords) {
                    $q->whereRaw("json_extract(affected_region_start, '$.x') = ?", [$startCoords['x']])
                      ->whereRaw("json_extract(affected_region_start, '$.y') = ?", [$startCoords['y']])
                      ->whereRaw("json_extract(affected_region_start, '$.z') = ?", [$startCoords['z']]);
                })->orWhere(function($q) use ($endCoords) {
                    $q->whereRaw("json_extract(affected_region_end, '$.x') = ?", [$endCoords['x']])
                      ->whereRaw("json_extract(affected_region_end, '$.y') = ?", [$endCoords['y']])
                      ->whereRaw("json_extract(affected_region_end, '$.z') = ?", [$endCoords['z']]);
                });
            })
            ->exists();

        if ($hasWeatherEvent) {
            return 'delayed';
        }

        return 'active';
    }
}
