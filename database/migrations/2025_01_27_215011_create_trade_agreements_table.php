<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trade_agreements', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('source_planet_id')->constrained('planets')->onDelete('cascade');
            $table->foreignId('destination_planet_id')->constrained('planets')->onDelete('cascade');
            $table->foreignId('resource_id')->constrained('resources')->onDelete('cascade');
            $table->decimal('quantity_per_cycle', 15, 2);
            $table->decimal('price_per_unit', 15, 2);
            $table->enum('cycle_period', ['daily', 'weekly', 'monthly']);
            $table->datetime('start_date');
            $table->datetime('end_date')->nullable();
            $table->text('terms')->nullable();
            $table->enum('status', ['active', 'pending', 'suspended', 'terminated'])->default('pending');
            $table->datetime('last_execution')->nullable();
            $table->timestamps();

            $table->index(['status', 'start_date', 'end_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trade_agreements');
    }
};