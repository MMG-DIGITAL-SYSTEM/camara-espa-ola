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
        Schema::create('noticias', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->string('slug')->nullable()->unique();
            $table->text('descripcion');
            $table->text('extracto')->nullable();
            $table->string('imagen')->nullable();
            $table->timestamp('fecha_publicacion')->useCurrent();
            $table->timestamp('fecha_evento')->nullable();
            $table->foreignId('estado_id')->nullable()->constrained('estados_publicacion')->nullOnDelete();
            $table->foreignId('visibilidad_id')->nullable()->constrained('visibilidad')->nullOnDelete();
            $table->boolean('destacada')->default(false);
            $table->foreignId('publicado_por')->nullable()->constrained('users')->nullOnDelete();
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
        Schema::dropIfExists('noticias');
    }
};
