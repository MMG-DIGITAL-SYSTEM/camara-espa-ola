<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Cada oficina muestra en el sitio una única persona responsable. Con una sola
 * por oficina basta con dos columnas: una tabla aparte solo haría falta si
 * alguna vez hubiera varios contactos por oficina.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('oficinas', function (Blueprint $table) {
            $table->string('responsable_nombre')->nullable()->after('correo_electronico');
            $table->string('responsable_cargo')->nullable()->after('responsable_nombre');
        });
    }

    public function down(): void
    {
        Schema::table('oficinas', function (Blueprint $table) {
            $table->dropColumn(['responsable_nombre', 'responsable_cargo']);
        });
    }
};
