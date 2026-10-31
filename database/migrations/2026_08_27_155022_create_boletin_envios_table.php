<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('boletin_envios', function (Blueprint $table) {
            $table->foreignId('boletin_id')->constrained('boletines')->cascadeOnDelete();
            $table->foreignId('suscriptor_id')->constrained('suscriptores')->cascadeOnDelete();
            $table->timestamp('fecha_envio')->useCurrent();
            $table->boolean('abierto')->default(false);
            $table->timestamp('fecha_apertura')->nullable();
            $table->primary(['boletin_id', 'suscriptor_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('boletin_envios');
    }
};
