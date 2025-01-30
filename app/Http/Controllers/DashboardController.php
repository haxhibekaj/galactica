<?php

namespace App\Http\Controllers;

use App\Models\TradeAgreement;
use App\Models\Resource;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Fetch busiest routes based on TradeAgreements
        $busiestRoutes = TradeAgreement::selectRaw('source_planet_id, destination_planet_id, COUNT(*) as total_trades')
            ->groupBy('source_planet_id', 'destination_planet_id')
            ->orderByDesc('total_trades')
            ->limit(5)
            ->with(['sourcePlanet', 'destinationPlanet'])
            ->get()
            ->map(function ($agreement) {
                return [
                    'name' => $agreement->sourcePlanet->name . ' → ' . $agreement->destinationPlanet->name,
                    'totalTrades' => $agreement->total_trades,
                ];
            });

        // Fetch most traded resources based on TradeAgreements
        $mostTradedResources = Resource::withCount('tradeAgreements')
            ->orderBy('trade_agreements_count', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($resource) {
                return [
                    'name' => $resource->name,
                    'totalTrades' => $resource->trade_agreements_count,
                ];
            });

        return Inertia::render('Dashboard', [
            'busiestRoutes' => $busiestRoutes,
            'mostTradedResources' => $mostTradedResources,
        ]);
    }
} 