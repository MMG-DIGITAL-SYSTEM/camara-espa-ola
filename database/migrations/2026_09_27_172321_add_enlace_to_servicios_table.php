<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Botón opcional en la tarjeta de un servicio, por ejemplo «Ver convenios»
 * en el servicio Convenios. Así el enlace se edita desde el panel en lugar de
 * decidirse en React según el título.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('servicios', function (Blueprint $table) {
            $table->string('enlace', 500)->nullable()->after('imagen');
            $table->string('enlace_texto', 60)->nullable()->after('enlace');
        });
    }

    public function down(): void
    {
        Schema::table('servicios', function (Blueprint $table) {
            $table->dropColumn(['enlace', 'enlace_texto']);
        });
    }
};
