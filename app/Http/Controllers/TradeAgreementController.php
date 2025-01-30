<?php

namespace App\Http\Controllers;

use App\Models\Planet;
use App\Models\Resource;
use App\Models\TradeAgreement;
use App\Models\ResourceInventory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TradeAgreementController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('TradeAgreements/Index', [
            'agreements' => TradeAgreement::with([
                'sourcePlanet:id,name', 
                'destinationPlanet:id,name',
                'resource:id,name'
            ])->latest()->get(),
            'planets' => Planet::select('id', 'name')->get(),
            'resources' => Resource::select('id', 'name', 'base_price')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'source_planet_id' => 'required|exists:planets,id',
            'destination_planet_id' => 'required|exists:planets,id|different:source_planet_id',
            'resource_id' => 'required|exists:resources,id',
            'quantity_per_cycle' => 'required|numeric|min:0',
            'price_per_unit' => 'required|numeric|min:0',
            'cycle_period' => 'required|in:daily,weekly,monthly',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'nullable|date|after:start_date',
            'terms' => 'nullable|string',
            'status' => 'required|in:active,pending,suspended,terminated',
        ]);

        TradeAgreement::create($validated);

        return redirect()->back()->with('success', 'Trade Agreement created successfully.');
    }

    public function executeAgreement(TradeAgreement $tradeAgreement)
    {
        try {
            DB::beginTransaction();

            if ($tradeAgreement->status !== 'active') {
                throw new \Exception('Trade agreement is not active.');
            }

            $sourceInventory = ResourceInventory::where([
                'planet_id' => $tradeAgreement->source_planet_id,
                'resource_id' => $tradeAgreement->resource_id,
            ])->firstOrFail();

            $destinationInventory = ResourceInventory::firstOrNew(
                [
                    'planet_id' => $tradeAgreement->destination_planet_id,
                    'resource_id' => $tradeAgreement->resource_id,
                ],
                [
                    'quantity' => 0,
                    'current_price' => $tradeAgreement->price_per_unit,
                    'production_rate' => 0,
                    'consumption_rate' => 0,
                ]
            );

            if ($sourceInventory->quantity < $tradeAgreement->quantity_per_cycle) {
                throw new \Exception('Insufficient resources in source planet.');
            }

            // Transfer resources
            $sourceInventory->decrement('quantity', $tradeAgreement->quantity_per_cycle);
            $destinationInventory->increment('quantity', $tradeAgreement->quantity_per_cycle);

            // Update market conditions
            $sourceInventory->updatePrice();
            $sourceInventory->updateDemandFactor();
            $destinationInventory->updatePrice();
            $destinationInventory->updateDemandFactor();

            // Update agreement execution time
            $tradeAgreement->update([
                'last_execution' => now(),
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Trade agreement executed successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function processAllAgreements()
    {
        try {
            DB::beginTransaction();

            $activeAgreements = TradeAgreement::where('status', 'active')
                ->where(function ($query) {
                    $query->whereNull('end_date')
                        ->orWhere('end_date', '>=', now());
                })
                ->where('start_date', '<=', now())
                ->get();

            $processed = 0;
            foreach ($activeAgreements as $agreement) {
                try {
                    $this->executeAgreement($agreement);
                    $processed++;
                } catch (\Exception $e) {
                    // Log the error but continue processing other agreements
                    // Log::error("Failed to process agreement {$agreement->id}: {$e->getMessage()}");
                    continue;
                }
            }

            DB::commit();
            return redirect()->back()->with('success', "Processed {$processed} trade agreements.");
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function destroy(TradeAgreement $agreement)
    {
        $agreement->delete();
        return redirect()->back()->with('success', 'Trade Agreement deleted successfully.');
    }

    public function edit(TradeAgreement $tradeAgreement): Response
    {
        return Inertia::render('TradeAgreements/Edit', [
            'agreement' => $tradeAgreement->load([
                'sourcePlanet:id,name',
                'destinationPlanet:id,name',
                'resource:id,name,base_price'
            ]),
            'planets' => Planet::select('id', 'name')->get(),
            'resources' => Resource::select('id', 'name', 'base_price')->get(),
        ]);
    }

    public function update(Request $request, TradeAgreement $tradeAgreement)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'source_planet_id' => 'required|exists:planets,id',
            'destination_planet_id' => 'required|exists:planets,id|different:source_planet_id',
            'resource_id' => 'required|exists:resources,id',
            'quantity_per_cycle' => 'required|numeric|min:0',
            'price_per_unit' => 'required|numeric|min:0',
            'cycle_period' => 'required|in:daily,weekly,monthly',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'terms' => 'nullable|string',
            'status' => 'required|in:active,pending,suspended,terminated',
        ]);

        // Convert date strings to proper DateTime objects
        $validated['start_date'] = new \DateTime($validated['start_date']);
        if ($validated['end_date']) {
            $validated['end_date'] = new \DateTime($validated['end_date']);
        }

        $tradeAgreement->update($validated);

        return redirect()->route('trade-agreements.index')
            ->with('success', 'Trade Agreement updated successfully.');
    }
} 