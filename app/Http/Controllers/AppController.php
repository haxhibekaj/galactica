<?php

namespace App\Http\Controllers;

use App\Models\Planet;
use App\Models\TradeRoute;
use App\Models\SpaceWeather;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Log;

class AppController extends Controller
{
    public function index(): Response
    {
        $tradeRoutes = TradeRoute::with(['startingPlanet', 'destinationPlanet'])
            ->get()
            ->map(function ($route) {
                $route->status = $this->calculateRouteStatus($route);
                return $route;
            });

        return Inertia::render('App/Index', [
            'planets' => Planet::all(),
            'tradeRoutes' => $tradeRoutes
        ]);
    }

    private function calculateRouteStatus(TradeRoute $route): string
    {
        // Get all active space weather events
        $activeWeather = SpaceWeather::where('start_time', '<=', now())
            ->where('end_time', '>=', now())
            ->get();

        // Check if any active weather event affects this route
        foreach ($activeWeather as $weather) {
            if ($weather->isRouteAffected($route)) {
                return 'delayed';
            }
        }

        return 'active';
    }
} 