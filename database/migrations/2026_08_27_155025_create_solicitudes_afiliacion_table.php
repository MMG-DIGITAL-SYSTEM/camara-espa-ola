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
        Schema::create('solicitudes_afiliacion', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_razon_social');
            $table->string('representante_legal');
            $table->string('escritura_constitucion')->nullable();
            $table->string('nit', 30)->nullable();
            $table->text('direccion');
            $table->string('telefono', 20);
            $table->string('correo_electronico');
            $table->string('representante_camara');
            $table->text('servicios_productos')->nullable();
            $table->date('fecha')->nullable();
            $table->string('ciudad')->nullable();
            $table->string('fax', 20)->nullable();
            $table->string('casilla')->nullable();
            $table->string('pagina_web')->nullable();
            $table->string('cargo')->nullable();
            $table->enum('estado', ['pendiente', 'en_revision', 'aprobada', 'rechazada', 'requiere_cambios'])->default('pendiente');
            $table->text('comentarios')->nullable();
            $table->foreignId('revisado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('fecha_revision')->nullable();
            $table->foreignId('socio_id')->nullable()->constrained('socios')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
            $table->index('estado');
            $table->index('nit');
            $table->index('correo_electronico');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('solicitudes_afiliacion');
    }
};
