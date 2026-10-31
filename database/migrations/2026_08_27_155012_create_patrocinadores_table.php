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
        Schema::create('patrocinadores', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_patrocinador');
            $table->text('descripcion')->nullable();
            $table->string('imagen')->nullable();
            $table->string('nombre_contacto')->nullable();
            $table->string('telefono1', 20)->nullable();
            $table->string('telefono2', 20)->nullable();
            $table->string('correo_electronico')->nullable();
            $table->text('direccion')->nullable();
            $table->foreignId('categoria_id')->constrained('categoriaspatrocinadores')->restrictOnDelete();
            $table->foreignId('estado_id')->constrained('estados_comercial')->restrictOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patrocinadores');
    }
};
