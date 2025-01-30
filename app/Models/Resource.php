<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Resource extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'base_price',
        'unit',
        'rarity',
        'weight_per_unit'
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'weight_per_unit' => 'decimal:2',
        'rarity' => 'string',
        'unit' => 'string'
    ];

    const UNITS = ['kg', 'ton', 'piece', 'liter', 'barrel'];
    const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

    public function tradeRoutes(): HasMany
    {
        return $this->hasMany(TradeRoute::class);
    }

    public function tradeAgreements(): HasMany
    {
        return $this->hasMany(TradeAgreement::class);
    }
} 