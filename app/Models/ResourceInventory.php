<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ResourceInventory extends Model
{
    use HasFactory;

    protected $fillable = [
        'planet_id',
        'resource_id',
        'quantity',
        'current_price',
        'production_rate',
        'consumption_rate',
        'demand_factor'
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'current_price' => 'decimal:2',
        'production_rate' => 'decimal:2',
        'consumption_rate' => 'decimal:2',
        'demand_factor' => 'float'
    ];

    public function planet(): BelongsTo
    {
        return $this->belongsTo(Planet::class);
    }

    public function resource(): BelongsTo
    {
        return $this->belongsTo(Resource::class);
    }

    public function priceHistory(): HasMany
    {
        return $this->hasMany(ResourcePriceHistory::class, ['planet_id', 'resource_id'], ['planet_id', 'resource_id']);
    }

    public function updatePrice(): void
    {
        $basePrice = $this->resource->base_price;
        $this->current_price = $basePrice * $this->demand_factor;
        $this->save();
    }

    public function updateDemandFactor(): void
    {
        // Calculate demand factor based on production vs consumption
        $netFlow = $this->production_rate - $this->consumption_rate;
        $this->demand_factor = max(0.5, min(2.0, 1 + ($netFlow / max(1, $this->quantity))));
        $this->save();
    }
} 