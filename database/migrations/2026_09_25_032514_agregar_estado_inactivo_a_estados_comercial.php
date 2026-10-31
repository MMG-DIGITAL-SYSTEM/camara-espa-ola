<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * El catálogo solo tenía «Activo», así que desde el panel no había forma de
 * retirar a un socio del sitio sin borrarlo. El sitio público filtra por
 * nombre (`Socio::activos()`), por eso se asegura que existan ambos.
 */
return new class extends Migration
{
    /**
     * @var array<int, string>
     */
    private array $estados = ['Activo', 'Inactivo'];

    public function up(): void
    {
        foreach ($this->estados as $nombre) {
            if (! DB::table('estados_comercial')->where('nombre', $nombre)->exists()) {
                DB::table('estados_comercial')->insert(['nombre' => $nombre]);
            }
        }
    }

    /**
     * No se revierte: puede haber socios apuntando a «Inactivo».
     */
    public function down(): void
    {
        //
    }
};
