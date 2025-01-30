<?php

namespace App\Http\Controllers;

use App\Models\SpaceWeather;
use App\Models\TradeRoute;
use App\Services\WeatherGenerationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use App\Models\Planet;
use Illuminate\Support\Facades\Log;

class SpaceWeatherController extends Controller
{
    public function __construct(
        private WeatherGenerationService $weatherService
    ) {}

    public function index()
    {
        $weatherEvents = SpaceWeather::with(['affectedRoutes.startingPlanet', 'affectedRoutes.destinationPlanet'])
            ->get()
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'name' => $event->name,
                    'type' => $event->type,
                    'severity' => $event->severity,
                    'start_time' => $event->start_time->toISOString(),
                    'end_time' => $event->end_time->toISOString(),
                    'delay_factor' => $event->delay_factor,
                ];
            });

        $affectedRoutes = $this->getAffectedRoutes()->map(function($route) {
            return [
                'id' => $route->id,
                'name' => $route->name,
                'starting_planet' => $route->startingPlanet ? [
                    'id' => $route->startingPlanet->id,
                    'name' => $route->startingPlanet->name
                ] : null,
                'destination_planet' => $route->destinationPlanet ? [
                    'id' => $route->destinationPlanet->id,
                    'name' => $route->destinationPlanet->name
                ] : null
            ];
        });

        return Inertia::render('SpaceWeather/Index', [
            'weatherEvents' => $weatherEvents,
            'affectedRoutes' => $affectedRoutes
        ]);
    }

    public function generate(Request $request)
    {
        // Create a large weather region that covers all routes
        $regionStart = ['x' => -5000, 'y' => -5000, 'z' => -5000];
        $regionEnd = ['x' => 5000, 'y' => 5000, 'z' => 5000];

        // Get valid types and severities from model
        $types = array_keys(SpaceWeather::TYPES);
        $severities = SpaceWeather::SEVERITIES;

        // Create the weather event
        $event = SpaceWeather::create([
            'name' => ucfirst($types[array_rand($types)]) . ' ' . Str::random(4),
            'type' => $types[array_rand($types)],
            'severity' => $severities[array_rand($severities)],
            'affected_region_start' => $regionStart,
            'affected_region_end' => $regionEnd,
            'start_time' => now(),
            'end_time' => now()->addHours(rand(1, 8)),
            'delay_factor' => rand(1, 9) / 10
        ]);

        // Sync all trade routes as affected
        $tradeRoutes = TradeRoute::all();
        $event->affectedRoutes()->sync($tradeRoutes->pluck('id'));

        return redirect()->back()->with('success', 'Weather event generated!');
    }

    private function getAffectedRoutes()
    {
        $activeWeather = SpaceWeather::where('end_time', '>', now())->get();
        $routes = TradeRoute::with(['startingPlanet', 'destinationPlanet'])->get();
        
        return $routes->filter(function ($route) use ($activeWeather) {
            return $activeWeather->contains(function ($weather) use ($route) {
                return $weather->isRouteAffected($route);
            });
        });
    }

    public function destroy($id)
    {
        $event = SpaceWeather::findOrFail($id);
        $event->delete();
        
        return redirect()->back()->with('success', 'Weather event deleted!');
    }
} 