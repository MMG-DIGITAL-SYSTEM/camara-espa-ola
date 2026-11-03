<?php

namespace Database\Seeders;

use Database\Seeders\Concerns\SeedsFromDump;
use Illuminate\Database\Seeder;

/**
 * Catálogos reales extraídos de camaraesp.sql: sin dependencias entre sí ni
 * con otras tablas, así que pueden ir primero y preservar sus ids tal cual.
 *
 * Los roles no están acá: los crea RolSeeder a partir del enum, porque los
 * tests dependen de ese seeder y de que los roles salgan siempre por nombre.
 * estados_comercial tampoco: la migración
 * agregar_estado_inactivo_a_estados_comercial ya deja «Activo»/«Inactivo»
 * con los mismos ids que trae el backup.
 */
class CatalogoSeeder extends Seeder
{
    use SeedsFromDump;

    public function run(): void
    {
        $this->insertRows('estados_publicacion');
        $this->insertRows('categorias');
        $this->insertRows('categorias_afiliados');
        $this->insertRows('visibilidad');
        $this->insertRows('ajustes', idColumn: null);
    }
}
