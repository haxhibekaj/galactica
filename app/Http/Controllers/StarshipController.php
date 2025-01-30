<?php

namespace App\Http\Controllers;

use App\Models\Starship;
use App\Models\TradeRoute;
use App\Models\SpaceWeather;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class StarshipController extends Controller
{
    public function index(): Response
    {
        $starships = Starship::with([
            'tradeRoute.startingPlanet', 
            'tradeRoute.destinationPlanet',
            'currentLocation',
            'destination'
        ])->latest()->get();

        // Update progress for in-transit ships
        $starships->each(function ($ship) {
            if ($ship->status === 'in_transit') {
                $ship->progress = $this->calculateProgress($ship);
            }
        });

        $tradeRoutes = TradeRoute::with('startingPlanet', 'destinationPlanet')->get();

        return Inertia::render('Starships/Index', [
            'starships' => $starships,
            'tradeRoutes' => $tradeRoutes,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'cargo_capacity' => 'required|numeric|min:0',
            'trade_route_id' => 'nullable|exists:trade_routes,id',
            'status' => 'required|in:idle,in_transit,maintenance',
            'maintenance_due_at' => 'nullable|date'
        ]);

        // Set initial location based on trade route
        if (!empty($validated['trade_route_id'])) {
            $tradeRoute = TradeRoute::findOrFail($validated['trade_route_id']);
            $validated['current_location_id'] = $tradeRoute->starting_planet_id;
        }

        // Set initial maintenance schedule (3 months from now)
        if (empty($validated['maintenance_due_at'])) {
            $validated['maintenance_due_at'] = Carbon::now()->addMonths(3);
        }

        $starship = Starship::create($validated);

        // Return the updated list of starships
        $starships = Starship::with([
            'tradeRoute.startingPlanet', 
            'tradeRoute.destinationPlanet',
            'currentLocation',
            'destination'
        ])->latest()->get();

        return Inertia::render('Starships/Index', [
            'starships' => $starships,
            'tradeRoutes' => TradeRoute::with('startingPlanet', 'destinationPlanet')->get(),
        ]);
    }

    public function update(Request $request, Starship $starship)
    {

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'cargo_capacity' => 'required|numeric|min:0',
            'trade_route_id' => 'nullable|exists:trade_routes,id',
            'status' => 'required|in:idle,in_transit,maintenance',
            'maintenance_due_at' => 'nullable|date'
        ]);

        if ($validated['status'] === 'in_transit') {
            if (empty($validated['trade_route_id'])) {
                return redirect()->back()->withErrors([
                    'error' => 'Cannot set status to in-transit without a trade route.'
                ]);
            }

            $tradeRoute = TradeRoute::findOrFail($validated['trade_route_id']);
            $baseTime = $tradeRoute->travel_time;
            
            $weatherDelay = $this->calculateWeatherDelay($tradeRoute);
            $totalTime = ceil($baseTime * $weatherDelay);

            $validated['departure_time'] = Carbon::now();
            $validated['arrival_time'] = Carbon::now()->addSeconds($totalTime);
            $validated['current_location_id'] = $tradeRoute->starting_planet_id;
            $validated['destination_id'] = $tradeRoute->destination_planet_id;
        }

        if ($validated['status'] === 'idle') {
            $validated['departure_time'] = null;
            $validated['arrival_time'] = null;
            $validated['destination_id'] = null;
        }

        if ($validated['status'] === 'maintenance') {
            $validated['maintenance_due_at'] = Carbon::now()->addMonths(3);
            $validated['trade_route_id'] = null;
        }

        $starship->update($validated);

        return redirect()->back()->with('success', 'Starship updated successfully.');
    }

    private function calculateWeatherDelay(TradeRoute $route): float
    {
        $activeWeather = SpaceWeather::where('end_time', '>', now())->get();
        $maxDelay = 1.0;

        foreach ($activeWeather as $weather) {
            if ($weather->isRouteAffected($route)) {
                $maxDelay = max($maxDelay, $weather->delay_factor);
            }
        }

        return $maxDelay;
    }

    public function destroy(Starship $starship)
    {
        $starship->delete();
        return redirect()->back()->with('success', 'Starship deleted successfully.');
    }

    public function edit(Starship $starship)
    {
        return Inertia::render('Starships/Edit', [
            'starship' => $starship,
            'tradeRoutes' => TradeRoute::with('startingPlanet', 'destinationPlanet')->get(),
        ]);
    }

    private function calculateProgress(Starship $ship): float
    {
        if ($ship->status !== 'in_transit' || !$ship->departure_time || !$ship->arrival_time) {
            return 0;
        }

        $departure = new Carbon($ship->departure_time);
        $arrival = new Carbon($ship->arrival_time);
        $now = Carbon::now();

        if ($now->gt($arrival)) {
            return 100;
        }

        $totalDuration = $arrival->diffInSeconds($departure);
        $elapsed = $now->diffInSeconds($departure);

        return min(100, max(0, ($elapsed / $totalDuration) * 100));
    }
} 