<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class SpaceWeather extends Model
{
    protected $table = 'space_weather';

    protected $fillable = [
        'name',
        'type',
        'severity',
        'affected_region_start',
        'affected_region_end',
        'start_time',
        'end_time',
        'delay_factor'
    ];

    protected $casts = [
        'affected_region_start' => 'array',
        'affected_region_end' => 'array',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'delay_factor' => 'float'
    ];

    // Weather types and their base delay factors
    const TYPES = [
        'solar_flare' => ['min_delay' => 1.2, 'max_delay' => 1.5],
        'asteroid_field' => ['min_delay' => 1.3, 'max_delay' => 2.0],
        'cosmic_storm' => ['min_delay' => 1.4, 'max_delay' => 2.5],
        'quantum_anomaly' => ['min_delay' => 1.5, 'max_delay' => 3.0],
    ];

    const SEVERITIES = ['minor', 'moderate', 'severe', 'extreme'];

    public function affectedStarships(): HasMany
    {
        return $this->hasMany(Starship::class);
    }

    public function isRouteAffected(TradeRoute $route): bool
    {
        $start = $route->startingPlanet->coordinates;
        $end = $route->destinationPlanet->coordinates;

        // Get weather region bounds
        $minX = min($this->affected_region_start['x'], $this->affected_region_end['x']);
        $maxX = max($this->affected_region_start['x'], $this->affected_region_end['x']);
        $minY = min($this->affected_region_start['y'], $this->affected_region_end['y']);
        $maxY = max($this->affected_region_start['y'], $this->affected_region_end['y']);
        $minZ = min($this->affected_region_start['z'], $this->affected_region_end['z']);
        $maxZ = max($this->affected_region_start['z'], $this->affected_region_end['z']);

        // Check if either start or end point is within the weather region
        $startInRegion = (
            $start['x'] >= $minX && $start['x'] <= $maxX &&
            $start['y'] >= $minY && $start['y'] <= $maxY &&
            $start['z'] >= $minZ && $start['z'] <= $maxZ
        );

        $endInRegion = (
            $end['x'] >= $minX && $end['x'] <= $maxX &&
            $end['y'] >= $minY && $end['y'] <= $maxY &&
            $end['z'] >= $minZ && $end['z'] <= $maxZ
        );

        return $startInRegion || $endInRegion;
    }

    public function affectedRoutes(): BelongsToMany
    {
        return $this->belongsToMany(TradeRoute::class, 'space_weather_trade_route');
    }
} 