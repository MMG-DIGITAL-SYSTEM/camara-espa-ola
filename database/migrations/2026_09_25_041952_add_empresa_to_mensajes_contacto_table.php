<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * El formulario de contacto pide la empresa como dato obligatorio. La columna
 * admite nulos solo para no romper mensajes que existieran antes de ella: la
 * obligatoriedad la impone la validación.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mensajes_contacto', function (Blueprint $table) {
            $table->string('empresa', 150)->nullable()->after('nombre');
        });
    }

    public function down(): void
    {
        Schema::table('mensajes_contacto', function (Blueprint $table) {
            $table->dropColumn('empresa');
        });
    }
};
