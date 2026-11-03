<?php

namespace Database\Seeders;

use Database\Seeders\Concerns\SeedsFromDump;
use Illuminate\Database\Seeder;

/**
 * Contenido institucional real que solo depende de users (ya sembrados por
 * SocioSeeder): directorio, red de cámaras, fichas país, oficinas, convenios,
 * servicios y la biblioteca de medios.
 */
class DirectorioSeeder extends Seeder
{
    use SeedsFromDump;

    public function run(): void
    {
        $this->insertRows('directivos');
        $this->insertRows('redes_camaras');
        $this->insertRows('fichas_pais');
        $this->insertRows('oficinas');
        $this->insertRows('convenios');
        $this->insertRows('servicios');
        $this->insertRows('medios');
    }
}
