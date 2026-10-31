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
        Schema::create('suscriptores', function (Blueprint $table) {
            $table->id();
            $table->string('correo_electronico');
            $table->string('nombre')->nullable();
            $table->string('apellido')->nullable();
            $table->foreignId('socio_id')->nullable()->constrained('socios')->nullOnDelete();
            $table->foreignId('lista_id')->constrained('listasuscriptores')->cascadeOnDelete();
            $table->foreignId('estado_id')->constrained('estadosuscriptor')->restrictOnDelete();
            $table->timestamp('fecha_agregado')->useCurrent();
            $table->timestamps();
            $table->softDeletes();
            $table->unique(['correo_electronico', 'lista_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('suscriptores');
    }
};
