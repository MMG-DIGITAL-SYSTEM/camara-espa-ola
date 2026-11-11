<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Comentarios de los visitantes en noticias y actividades.
 *
 * Entran como `pendiente` y solo se ven en el sitio cuando alguien del panel
 * los aprueba. El correo es para la Cámara: nunca se publica.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comentarios', function (Blueprint $table) {
            $table->id();
            // `noticia` o `actividad`, según el morph map de AppServiceProvider.
            $table->morphs('contenido');
            $table->string('nombre', 100);
            $table->string('correo');
            $table->string('web')->nullable();
            $table->text('contenido_texto');
            $table->string('estado', 20)->default('pendiente');
            // Para reconocer envíos masivos al moderar; no se muestra en el sitio.
            $table->string('ip', 45)->nullable();
            $table->foreignId('revisado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('revisado_en')->nullable();
            $table->timestamps();

            $table->index(['contenido_type', 'contenido_id', 'estado']);
            $table->index('estado');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comentarios');
    }
};
