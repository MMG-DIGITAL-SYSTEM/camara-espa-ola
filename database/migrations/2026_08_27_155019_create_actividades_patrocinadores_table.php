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
        Schema::create('actividades_patrocinadores', function (Blueprint $table) {
            $table->foreignId('actividad_id')->constrained('actividades')->cascadeOnDelete();
            $table->foreignId('patrocinador_id')->constrained('patrocinadores')->cascadeOnDelete();
            $table->decimal('monto_patrocinio', 12, 2)->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->primary(['actividad_id', 'patrocinador_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('actividades_patrocinadores');
    }
};
