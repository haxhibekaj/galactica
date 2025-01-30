<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResourcePriceHistory extends Model
{
    protected $fillable = [
        'planet_id',
        'resource_id',
        'price',
        'quantity',
        'demand_factor'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'quantity' => 'decimal:2',
        'demand_factor' => 'decimal:2'
    ];

    public function resource(): BelongsTo
    {
        return $this->belongsTo(Resource::class);
    }
} 