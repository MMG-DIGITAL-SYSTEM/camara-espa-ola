<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Bolsa de trabajo: ofertas que publican los socios desde su portal.
 *
 * `estado`, `modalidad` y `jornada` son texto respaldado por enums de PHP, no
 * catálogos con id: así no hay ids escritos a pelo que se desalineen.
 * La postulación no pasa por el sitio: se hace por correo o en el enlace
 * que indique la empresa.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ofertas_empleo', function (Blueprint $table) {
            $table->id();
            $table->foreignId('socio_id')->constrained('socios')->cascadeOnDelete();

            $table->string('titulo');
            $table->text('descripcion');
            $table->string('area')->nullable();
            $table->string('ubicacion')->nullable();
            $table->string('modalidad', 20);
            $table->string('jornada', 20);
            $table->string('salario')->nullable();
            $table->unsignedSmallInteger('vacantes')->default(1);

            $table->string('correo_postulacion')->nullable();
            $table->string('enlace_postulacion', 500)->nullable();

            $table->date('fecha_cierre')->nullable();
            $table->string('estado', 20)->default('borrador');
            $table->timestamp('publicada_en')->nullable();

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['estado', 'fecha_cierre']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ofertas_empleo');
    }
};
