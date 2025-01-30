<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Create space_weather table
        Schema::create('space_weather', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('type');
            $table->enum('severity', ['minor', 'moderate', 'severe', 'extreme']);
            $table->json('affected_region_start');
            $table->json('affected_region_end');
            $table->timestamp('start_time');
            $table->timestamp('end_time');
            $table->float('delay_factor');
            $table->timestamps();

            $table->index(['start_time', 'end_time']);
        });

        // Create pivot table for space_weather and trade_routes
        Schema::create('space_weather_trade_route', function (Blueprint $table) {
            $table->id();
            $table->foreignId('space_weather_id')->constrained('space_weather')->onDelete('cascade');
            $table->foreignId('trade_route_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });

        // Add space_weather_id to starships table
        Schema::table('starships', function (Blueprint $table) {
            $table->foreignId('space_weather_id')
                ->nullable()
                ->constrained('space_weather')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('space_weather_trade_route');
        Schema::dropIfExists('space_weather');
        Schema::table('starships', function (Blueprint $table) {
            $table->dropForeign(['space_weather_id']);
            $table->dropColumn('space_weather_id');
        });
    }
};