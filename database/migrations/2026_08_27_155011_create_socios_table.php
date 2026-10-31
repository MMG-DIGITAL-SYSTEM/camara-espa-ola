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
        Schema::create('socios', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('slug')->unique();
            $table->string('nit', 30)->nullable();
            $table->text('descripcion')->nullable();
            $table->string('imagen')->nullable();
            $table->string('sitio_web')->nullable();
            $table->string('nombre_contacto')->nullable();
            $table->string('telefono1', 20)->nullable();
            $table->string('telefono2', 20)->nullable();
            $table->string('correo_electronico')->nullable();
            $table->text('direccion')->nullable();
            $table->foreignId('categoria_id')->nullable()->constrained('categorias_afiliados')->nullOnDelete();
            $table->foreignId('estado_id')->nullable()->constrained('estados_comercial')->nullOnDelete();
            $table->date('fecha_afiliacion')->default(DB::raw('CURRENT_DATE'));
            $table->boolean('destacado')->default(false);
            $table->integer('orden')->default(0);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('categoria_id');
            $table->index('estado_id');
            $table->index('destacado');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('socios');
    }
};
