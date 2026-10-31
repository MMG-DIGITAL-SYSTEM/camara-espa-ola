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
        Schema::create('mensajes_contacto', function (Blueprint $table) {
            $table->id();
            $table->text('necesidad');
            $table->string('nombre');
            $table->string('correo_electronico');
            $table->string('telefono')->nullable();
            $table->boolean('acepta_privacidad')->default(false);
            $table->enum('estado', ['nuevo', 'leido', 'en_proceso', 'respondido', 'cerrado'])->default('nuevo');
            $table->text('comentarios')->nullable();
            $table->foreignId('atendido_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('fecha_atencion')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index('estado');
            $table->index('correo_electronico');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mensajes_contacto');
    }
};
