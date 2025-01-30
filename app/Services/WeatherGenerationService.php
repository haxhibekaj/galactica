<?php

namespace App\Services;

use App\Models\SpaceWeather;
use App\Models\Planet;
use Carbon\Carbon;

class WeatherGenerationService
{
    public function generateNewWeatherEvent(): SpaceWeather
    {
        $type = array_rand(SpaceWeather::TYPES);
        $severity = SpaceWeather::SEVERITIES[array_rand(SpaceWeather::SEVERITIES)];
        
        // Get random coordinates for affected region
        $region = $this->generateAffectedRegion();
        
        // Calculate delay factor based on type and severity
        $delayFactor = $this->calculateDelayFactor($type, $severity);
        
        // Generate duration based on severity (1-24 hours)
        $duration = $this->calculateDuration($severity);
        
        return SpaceWeather::create([
            'type' => $type,
            'severity' => $severity,
            'affected_region_start' => $region['start'],
            'affected_region_end' => $region['end'],
            'start_time' => now(),
            'end_time' => now()->addHours($duration),
            'delay_factor' => $delayFactor,
        ]);
    }

    private function generateAffectedRegion(): array
    {
        // Get universe bounds from existing planets
        $planets = Planet::select('coordinates')->get();
        $bounds = $this->calculateUniverseBounds($planets);
        
        // Generate random region within bounds
        $start = [
            'x' => rand($bounds['min_x'], $bounds['max_x']),
            'y' => rand($bounds['min_y'], $bounds['max_y']),
            'z' => rand($bounds['min_z'], $bounds['max_z']),
        ];
        
        // Region size based on random factor (10-30% of universe size)
        $sizeFactor = rand(10, 30) / 100;
        $end = [
            'x' => $start['x'] + ($bounds['max_x'] - $bounds['min_x']) * $sizeFactor,
            'y' => $start['y'] + ($bounds['max_y'] - $bounds['min_y']) * $sizeFactor,
            'z' => $start['z'] + ($bounds['max_z'] - $bounds['min_z']) * $sizeFactor,
        ];
        
        return ['start' => $start, 'end' => $end];
    }

    private function calculateDelayFactor(string $type, string $severity): float
    {
        $baseDelays = SpaceWeather::TYPES[$type];
        $severityMultipliers = [
            'minor' => 0.25,
            'moderate' => 0.5,
            'severe' => 0.75,
            'extreme' => 1.0,
        ];
        
        $range = $baseDelays['max_delay'] - $baseDelays['min_delay'];
        return $baseDelays['min_delay'] + ($range * $severityMultipliers[$severity]);
    }

    private function calculateDuration(string $severity): int
    {
        return match($severity) {
            'minor' => rand(1, 6),
            'moderate' => rand(4, 12),
            'severe' => rand(8, 18),
            'extreme' => rand(12, 24),
        };
    }

    private function calculateUniverseBounds($planets): array
    {
        return [
            'min_x' => $planets->min('coordinates.x'),
            'max_x' => $planets->max('coordinates.x'),
            'min_y' => $planets->min('coordinates.y'),
            'max_y' => $planets->max('coordinates.y'),
            'min_z' => $planets->min('coordinates.z'),
            'max_z' => $planets->max('coordinates.z'),
        ];
    }
} 