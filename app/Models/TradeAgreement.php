<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TradeAgreement extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'source_planet_id',
        'destination_planet_id',
        'resource_id',
        'quantity_per_cycle',
        'price_per_unit',
        'cycle_period',
        'start_date',
        'end_date',
        'terms',
        'status',
        'last_execution'
    ];

    protected $casts = [
        'quantity_per_cycle' => 'decimal:2',
        'price_per_unit' => 'decimal:2',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'last_execution' => 'datetime'
    ];

    public function sourcePlanet(): BelongsTo
    {
        return $this->belongsTo(Planet::class, 'source_planet_id');
    }

    public function destinationPlanet(): BelongsTo
    {
        return $this->belongsTo(Planet::class, 'destination_planet_id');
    }

    public function resource(): BelongsTo
    {
        return $this->belongsTo(Resource::class);
    }

    public function shouldExecute(): bool
    {
        if ($this->status !== 'active') {
            return false;
        }

        if ($this->end_date && $this->end_date < now()) {
            return false;
        }

        if ($this->start_date > now()) {
            return false;
        }

        if (!$this->last_execution) {
            return true;
        }

        return match ($this->cycle_period) {
            'daily' => $this->last_execution->addDay() <= now(),
            'weekly' => $this->last_execution->addWeek() <= now(),
            'monthly' => $this->last_execution->addMonth() <= now(),
            default => false,
        };
    }

    public function getNextExecutionDate(): ?\DateTime
    {
        if (!$this->last_execution) {
            return $this->start_date > now() ? $this->start_date : now();
        }

        return match ($this->cycle_period) {
            'daily' => $this->last_execution->addDay(),
            'weekly' => $this->last_execution->addWeek(),
            'monthly' => $this->last_execution->addMonth(),
            default => null,
        };
    }
}
