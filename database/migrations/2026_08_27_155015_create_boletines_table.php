<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('boletines', function (Blueprint $table) {
            $table->id();
            $table->string('asunto');
            $table->foreignId('estado_id')->constrained('estados_publicacion')->restrictOnDelete();
            $table->unsignedTinyInteger('progreso')->default(0);
            $table->text('contenido')->nullable();
            $table->jsonb('configuracion')->nullable();
            $table->foreignId('lista_id')->nullable()->constrained('listasuscriptores')->nullOnDelete();
            $table->timestamp('fecha_creacion')->useCurrent();
            $table->timestamp('fecha_envio')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
        DB::statement('ALTER TABLE boletines ADD CONSTRAINT boletines_progreso_check CHECK (progreso BETWEEN 0 AND 100)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('boletines');
    }
};
