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
        Schema::create('tramites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('socio_id')->constrained('socios')->cascadeOnDelete();
            $table->foreignId('tipo_tramite_id')->constrained('tipos_tramite')->restrictOnDelete();
            $table->foreignId('estado_id')->default(1)->constrained('estados_tramite')->restrictOnDelete();
            $table->foreignId('solicitado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('procesado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('fecha_solicitud')->useCurrent();
            $table->timestamp('fecha_entrega')->nullable();
            $table->string('numero_documento', 50)->nullable()->unique();
            $table->string('documento_url')->nullable();
            $table->text('observaciones')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tramites');
    }
};
