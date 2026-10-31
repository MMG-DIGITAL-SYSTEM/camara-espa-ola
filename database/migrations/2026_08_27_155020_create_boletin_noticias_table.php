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
        Schema::create('boletin_noticias', function (Blueprint $table) {
            $table->foreignId('boletin_id')->constrained('boletines')->cascadeOnDelete();
            $table->foreignId('noticia_id')->constrained('noticias')->cascadeOnDelete();
            $table->unsignedInteger('orden')->default(1);
            $table->primary(['boletin_id', 'noticia_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('boletin_noticias');
    }
};
