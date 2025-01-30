<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('resources', function (Blueprint $table) {
            $table->enum('rarity', ['common', 'uncommon', 'rare', 'epic', 'legendary'])->default('common');
            $table->enum('unit', ['kg', 'ton', 'piece', 'liter', 'barrel'])->change();
            $table->decimal('weight_per_unit', 10, 2)->default(1.00);
        });
    }

    public function down(): void
    {
        Schema::table('resources', function (Blueprint $table) {
            $table->dropColumn(['rarity', 'weight_per_unit']);
            $table->string('unit')->change();
        });
    }
};