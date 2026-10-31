<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Unifica los catálogos de estado y visibilidad.
 *
 * Había entradas duplicadas en minúscula («publicado», «público») creadas a
 * mano: las noticias usaban esas y las actividades las originales. Con dos
 * convenciones para lo mismo, una noticia marcada como «Publicada» desde el
 * panel no habría salido en el sitio.
 */
return new class extends Migration
{
    /**
     * Duplicado → entrada que se conserva.
     *
     * @var array<string, array<int, int>>
     */
    private array $fusiones = [
        'estados_publicacion' => [5 => 1],
        'visibilidad' => [4 => 1],
    ];

    /**
     * Tabla → columnas que apuntan a cada catálogo.
     *
     * @var array<string, array<int, string>>
     */
    private array $referencias = [
        'estados_publicacion' => ['estado_id'],
        'visibilidad' => ['visibilidad_id'],
    ];

    private array $tablas = ['noticias', 'actividades'];

    public function up(): void
    {
        foreach ($this->fusiones as $catalogo => $mapa) {
            foreach ($mapa as $duplicado => $original) {
                // Solo se fusiona si ambas entradas siguen existiendo tal cual.
                if (! DB::table($catalogo)->where('id', $original)->exists()) {
                    continue;
                }

                foreach ($this->tablas as $tabla) {
                    foreach ($this->referencias[$catalogo] as $columna) {
                        DB::table($tabla)
                            ->where($columna, $duplicado)
                            ->update([$columna => $original]);
                    }
                }

                DB::table($catalogo)->where('id', $duplicado)->delete();
            }
        }
    }

    /**
     * No se revierte: recrear los duplicados solo devolvería la ambigüedad.
     */
    public function down(): void
    {
        //
    }
};
