<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resource_price_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('planet_id')->constrained()->cascadeOnDelete();
            $table->foreignId('resource_id')->constrained()->cascadeOnDelete();
            $table->decimal('price', 10, 2);
            $table->decimal('quantity', 15, 2);
            $table->decimal('demand_factor', 5, 2)->comment('1 is neutral, >1 high demand, <1 low demand');
            $table->timestamps();

            $table->index(['planet_id', 'resource_id', 'created_at']);
        });

        // Add columns to resource_inventories if they don't exist
        Schema::table('resource_inventories', function (Blueprint $table) {
            if (!Schema::hasColumn('resource_inventories', 'demand_factor')) {
                $table->decimal('demand_factor', 5, 2)->default(1.0)->after('current_price');
            }
            if (!Schema::hasColumn('resource_inventories', 'production_rate')) {
                $table->decimal('production_rate', 10, 2)->default(0)->after('demand_factor')
                    ->comment('Units produced per day');
            }
            if (!Schema::hasColumn('resource_inventories', 'consumption_rate')) {
                $table->decimal('consumption_rate', 10, 2)->default(0)->after('production_rate')
                    ->comment('Units consumed per day');
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resource_price_histories');
        
        Schema::table('resource_inventories', function (Blueprint $table) {
            $table->dropColumn(['demand_factor', 'production_rate', 'consumption_rate']);
        });
    }
}; 