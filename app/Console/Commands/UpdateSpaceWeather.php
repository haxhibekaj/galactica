<?php

namespace App\Console\Commands;

use App\Models\Starship;
use App\Models\SpaceWeather;
use Illuminate\Console\Command;

class UpdateSpaceWeather extends Command
{
    protected $signature = 'space:update-weather';
    protected $description = 'Update ship travel times based on current weather conditions';

    public function handle()
    {
        $this->updateInTransitShips();
        $this->cleanupExpiredWeather();
        $this->generateNewWeatherEvents();
    }

    private function updateInTransitShips()
    {
        $inTransitShips = Starship::where('status', 'in_transit')
            ->with(['tradeRoute'])
            ->get();

        foreach ($inTransitShips as $ship) {
            $weatherDelay = $this->calculateNewDelay($ship);
            
            if ($weatherDelay > 1.0) {
                $remainingTime = $ship->arrival_time->diffInHours(now());
                $newArrivalTime = now()->addHours(ceil($remainingTime * $weatherDelay));
                
                $ship->update([
                    'arrival_time' => $newArrivalTime
                ]);

                $this->info("Updated arrival time for ship {$ship->name} due to weather conditions");
            }
        }
    }

    private function calculateNewDelay($ship): float
    {
        if (!$ship->tradeRoute) return 1.0;

        $activeWeather = SpaceWeather::where('end_time', '>', now())->get();
        $maxDelay = 1.0;

        foreach ($activeWeather as $weather) {
            if ($weather->isRouteAffected($ship->tradeRoute)) {
                $maxDelay = max($maxDelay, $weather->delay_factor);
            }
        }

        return $maxDelay;
    }

    private function cleanupExpiredWeather()
    {
        $deleted = SpaceWeather::where('end_time', '<=', now())->delete();
        if ($deleted) {
            $this->info("Cleaned up {$deleted} expired weather events");
        }
    }

    private function generateNewWeatherEvents()
    {
        if (rand(1, 5) === 1) {
            app(\App\Services\WeatherGenerationService::class)->generateNewWeatherEvent();
            $this->info('Generated new weather event');
        }
    }
} 