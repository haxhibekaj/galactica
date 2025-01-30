<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Starship extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'cargo_capacity',
        'trade_route_id',
        'status',
        'current_location_id',
        'destination_id',
        'departure_time',
        'arrival_time',
        'maintenance_due_at',
    ];

    protected $casts = [
        'cargo_capacity' => 'decimal:2',
        'departure_time' => 'datetime',
        'arrival_time' => 'datetime',
        'maintenance_due_at' => 'datetime',
    ];

    public function tradeRoute(): BelongsTo
    {
        return $this->belongsTo(TradeRoute::class);
    }

    public function currentLocation(): BelongsTo
    {
        return $this->belongsTo(Planet::class, 'current_location_id');
    }

    public function destination(): BelongsTo
    {
        return $this->belongsTo(Planet::class, 'destination_id');
    }

    public function calculateProgress(): float
    {
        if ($this->status !== 'in_transit' || !$this->departure_time || !$this->arrival_time) {
            return 0;
        }

        $totalDuration = $this->arrival_time->diffInSeconds($this->departure_time);
        $elapsed = now()->diffInSeconds($this->departure_time);

        return min(100, ($elapsed / $totalDuration) * 100);
    }

    public function needsMaintenance(): bool
    {
        return $this->maintenance_due_at && $this->maintenance_due_at <= now();
    }
} 