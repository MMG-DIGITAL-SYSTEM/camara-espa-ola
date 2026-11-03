<?php

namespace Database\Seeders;

use Database\Seeders\Concerns\SeedsFromDump;
use Illuminate\Database\Seeder;

/**
 * Bolsa de trabajo: ofertas publicadas por socios y solicitudes de
 * afiliación recibidas. Ambas dependen de socios y users, ya sembrados.
 */
class OfertaEmpleoSeeder extends Seeder
{
    use SeedsFromDump;

    public function run(): void
    {
        $this->insertRows('ofertas_empleo');
        $this->insertRows('solicitudes_afiliacion');
    }
}
