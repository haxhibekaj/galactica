<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Planet extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'coordinates',
        'color'
    ];

    protected $casts = [
        'coordinates' => 'array'
    ];

    public function startingTradeRoutes(): HasMany
    {
        return $this->hasMany(TradeRoute::class, 'starting_planet_id');
    }

    public function destinationTradeRoutes(): HasMany
    {
        return $this->hasMany(TradeRoute::class, 'destination_planet_id');
    }
} 