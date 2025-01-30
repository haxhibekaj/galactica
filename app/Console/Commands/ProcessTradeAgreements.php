<?php

namespace App\Console\Commands;

use App\Models\TradeAgreement;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProcessTradeAgreements extends Command
{
    protected $signature = 'trade-agreements:process';
    protected $description = 'Process all active trade agreements that are due for execution';

    public function handle()
    {
        $this->info('Starting trade agreements processing...');
        
        $agreements = TradeAgreement::with(['sourcePlanet', 'destinationPlanet', 'resource'])
            ->where('status', 'active')
            ->where(function ($query) {
                $query->whereNull('end_date')
                    ->orWhere('end_date', '>=', now());
            })
            ->where('start_date', '<=', now())
            ->get();

        $processed = 0;
        $failed = 0;

        foreach ($agreements as $agreement) {
            if (!$agreement->shouldExecute()) {
                continue;
            }

            try {
                DB::beginTransaction();

                $sourceInventory = $agreement->sourcePlanet
                    ->resourceInventories()
                    ->where('resource_id', $agreement->resource_id)
                    ->lockForUpdate()
                    ->first();

                if (!$sourceInventory || $sourceInventory->quantity < $agreement->quantity_per_cycle) {
                    throw new \Exception("Insufficient resources in {$agreement->sourcePlanet->name} for agreement {$agreement->name}");
                }

                $destinationInventory = $agreement->destinationPlanet
                    ->resourceInventories()
                    ->firstOrNew(
                        ['resource_id' => $agreement->resource_id],
                        [
                            'quantity' => 0,
                            'current_price' => $agreement->price_per_unit,
                            'production_rate' => 0,
                            'consumption_rate' => 0,
                        ]
                    );

                // Transfer resources
                $sourceInventory->decrement('quantity', $agreement->quantity_per_cycle);
                $destinationInventory->increment('quantity', $agreement->quantity_per_cycle);

                // Update market conditions
                $sourceInventory->updatePrice();
                $sourceInventory->updateDemandFactor();
                $destinationInventory->updatePrice();
                $destinationInventory->updateDemandFactor();

                // Record price history
                $agreement->sourcePlanet->recordPriceHistory($agreement->resource_id);
                $agreement->destinationPlanet->recordPriceHistory($agreement->resource_id);

                // Update agreement execution time
                $agreement->update(['last_execution' => now()]);

                DB::commit();
                $processed++;

                $this->info("Processed agreement: {$agreement->name}");
            } catch (\Exception $e) {
                DB::rollBack();
                $failed++;
                
                Log::error("Failed to process trade agreement {$agreement->id}: {$e->getMessage()}", [
                    'agreement_id' => $agreement->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);

                $this->error("Failed to process agreement {$agreement->name}: {$e->getMessage()}");
            }
        }

        $this->info("Completed processing trade agreements.");
        $this->info("Successfully processed: {$processed}");
        $this->info("Failed: {$failed}");

        return Command::SUCCESS;
    }
} 