<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resource_inventories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('planet_id')->constrained()->onDelete('cascade');
            $table->foreignId('resource_id')->constrained()->onDelete('cascade');
            $table->decimal('quantity', 12, 2)->default(0);
            $table->decimal('current_price', 12, 2);
            $table->decimal('production_rate', 8, 2)->default(0);
            $table->decimal('consumption_rate', 8, 2)->default(0);
            $table->float('demand_factor')->default(1.0);
            $table->timestamps();

            $table->unique(['planet_id', 'resource_id']);
            $table->index(['planet_id', 'resource_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resource_inventories');
    }
};