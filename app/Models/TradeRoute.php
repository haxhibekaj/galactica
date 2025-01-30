<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class TradeRoute extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'starting_planet_id',
        'destination_planet_id',
        'resource_id',
        'travel_time'
    ];

    public function startingPlanet(): BelongsTo
    {
        return $this->belongsTo(Planet::class, 'starting_planet_id');
    }

    public function destinationPlanet(): BelongsTo
    {
        return $this->belongsTo(Planet::class, 'destination_planet_id');
    }

    public function resource(): BelongsTo
    {
        return $this->belongsTo(Resource::class);
    }

    public function starships(): HasMany
    {
        return $this->hasMany(Starship::class);
    }

    public function spaceWeathers(): BelongsToMany
    {
        return $this->belongsToMany(SpaceWeather::class, 'space_weather_trade_route');
    }

    public function tradeAgreements(): HasMany
    {
        return $this->hasMany(TradeAgreement::class);
    }
}
