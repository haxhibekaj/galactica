<?php

namespace App\Http\Controllers;

use App\Models\Planet;
use App\Models\Resource;
use App\Models\ResourceInventory;
use App\Models\ResourcePriceHistory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;

class ResourceInventoryController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Resources/Index', [
            'inventories' => ResourceInventory::with(['planet', 'resource'])
                ->get()
                ->groupBy('planet_id'),
            'planets' => Planet::select('id', 'name')->get(),
            'resources' => Resource::select('id', 'name', 'base_price')->get(),
            'marketStats' => $this->getMarketStats(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'planet_id' => 'required|exists:planets,id',
            'resource_id' => 'required|exists:resources,id',
            'quantity' => 'required|numeric|min:0',
            'current_price' => 'required|numeric|min:0',
            'production_rate' => 'required|numeric|min:0',
            'consumption_rate' => 'required|numeric|min:0'
        ]);

        $inventory = ResourceInventory::firstOrNew([
            'planet_id' => $validated['planet_id'],
            'resource_id' => $validated['resource_id']
        ]);

        if ($inventory->exists) {
            $inventory->quantity += $validated['quantity'];
            $inventory->current_price = $validated['current_price'];
        } else {
            $inventory->fill($validated);
        }

        $inventory->save();
        $inventory->updatePrice();
        $inventory->updateDemandFactor();

        return redirect()->back()->with('success', 'Inventory updated successfully.');
    }

    public function update(Request $request, ResourceInventory $inventory)
    {
        $validated = $request->validate([
            'quantity' => 'required|numeric|min:0',
            'production_rate' => 'required|numeric|min:0',
            'consumption_rate' => 'required|numeric|min:0',
        ]);

        $inventory->update($validated);
        $inventory->updatePrice();
        $inventory->updateDemandFactor();

        return redirect()->back()->with('success', 'Inventory updated successfully.');
    }

    public function transfer(Request $request)
    {
        $validated = $request->validate([
            'from_planet_id' => 'required|exists:planets,id',
            'to_planet_id' => 'required|different:from_planet_id|exists:planets,id',
            'resource_id' => 'required|exists:resources,id',
            'quantity' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            $sourceInventory = ResourceInventory::where([
                'planet_id' => $validated['from_planet_id'],
                'resource_id' => $validated['resource_id']
            ])->lockForUpdate()->firstOrFail();

            if ($sourceInventory->quantity < $validated['quantity']) {
                throw new \Exception('Insufficient resources for transfer.');
            }

            $destInventory = ResourceInventory::firstOrCreate(
                [
                    'planet_id' => $validated['to_planet_id'],
                    'resource_id' => $validated['resource_id']
                ],
                [
                    'quantity' => 0,
                    'current_price' => $sourceInventory->current_price,
                    'production_rate' => 0,
                    'consumption_rate' => 0,
                ]
            );

            $sourceInventory->decrement('quantity', $validated['quantity']);
            $destInventory->increment('quantity', $validated['quantity']);

            // Update market conditions
            $sourceInventory->updatePrice();
            $sourceInventory->updateDemandFactor();
            $destInventory->updatePrice();
            $destInventory->updateDemandFactor();

            DB::commit();
            return redirect()->back()->with('success', 'Resource transfer completed successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function getPriceHistory(Planet $planet, Resource $resource)
    {
        $history = ResourcePriceHistory::where([
            'planet_id' => $planet->id,
            'resource_id' => $resource->id
        ])
        ->orderBy('created_at', 'desc')
        ->take(30)
        ->get()
        ->reverse();

        return response()->json($history);
    }

    private function getMarketStats()
    {
        return [
            'mostTraded' => ResourcePriceHistory::select('resource_id')
                ->selectRaw('COUNT(*) as transaction_count')
                ->groupBy('resource_id')
                ->orderByDesc('transaction_count')
                ->limit(5)
                ->with('resource:id,name')
                ->get(),
            
            'highestDemand' => ResourceInventory::select('resource_id')
                ->selectRaw('AVG(demand_factor) as avg_demand')
                ->groupBy('resource_id')
                ->orderByDesc('avg_demand')
                ->limit(5)
                ->with('resource:id,name')
                ->get(),
            
            'priceVolatility' => ResourcePriceHistory::select('resource_id')
                ->selectRaw('(MAX(price) - MIN(price)) / AVG(price) as price_volatility')
                ->groupBy('resource_id')
                ->orderByDesc('price_volatility')
                ->limit(5)
                ->with('resource:id,name')
                ->get()
        ];
    }
} 