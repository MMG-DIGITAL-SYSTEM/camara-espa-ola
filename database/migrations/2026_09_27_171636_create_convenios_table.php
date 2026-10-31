<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Convenios con descuentos y ventajas para los asociados.
 *
 * La pieza promocional (con sus textos) es la imagen; el detalle es el PDF.
 * Ambos se guardan en el disco `public` y aquí solo va la ruta. No confundir
 * con el servicio «Convenios» de `servicios`, que solo explica el beneficio.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('convenios', function (Blueprint $table) {
            $table->id();

            $table->string('nombre');
            $table->text('descripcion');

            $table->string('imagen')->nullable();
            $table->string('correo_electronico')->nullable();
            $table->string('pdf')->nullable();

            $table->integer('orden')->default(0);
            $table->boolean('activo')->default(true);

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            $table->index('activo');
            $table->index('orden');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('convenios');
    }
};
