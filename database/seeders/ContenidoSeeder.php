<?php

namespace Database\Seeders;

use Database\Seeders\Concerns\SeedsFromDump;
use Illuminate\Database\Seeder;

class ContenidoSeeder extends Seeder
{
    use SeedsFromDump;

    public function run(): void
    {
        $this->insertRows('contenido_institucional');
    }
}
