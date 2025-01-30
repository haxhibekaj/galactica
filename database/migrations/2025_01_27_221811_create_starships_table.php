<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('starships', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('cargo_capacity', 15, 2);
            $table->foreignId('trade_route_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('status', ['idle', 'in_transit', 'maintenance']);
            $table->foreignId('current_location_id')->nullable()->constrained('planets');
            $table->foreignId('destination_id')->nullable()->constrained('planets');
            $table->timestamp('departure_time')->nullable();
            $table->timestamp('arrival_time')->nullable();
            $table->timestamp('maintenance_due_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'trade_route_id']);
            $table->index(['current_location_id', 'destination_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('starships');
    }
}; 