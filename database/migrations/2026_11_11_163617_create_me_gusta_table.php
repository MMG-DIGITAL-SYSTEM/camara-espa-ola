<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * «Me gusta» de noticias y actividades.
 *
 * Los visitantes del sitio son anónimos: cada navegador lleva una cookie con
 * un identificador al azar y aquí se guarda solo su huella (SHA-256). El
 * índice único impide que el mismo navegador cuente dos veces.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('me_gusta', function (Blueprint $table) {
            $table->id();
            // `noticia` o `actividad`, según el morph map de AppServiceProvider.
            $table->morphs('contenido');
            $table->string('visitante', 64);
            $table->timestamps();

            $table->unique(['contenido_type', 'contenido_id', 'visitante']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('me_gusta');
    }
};
