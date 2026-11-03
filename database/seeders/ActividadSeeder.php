<?php

namespace Database\Seeders;

use Database\Seeders\Concerns\SeedsFromDump;
use Illuminate\Database\Seeder;

class ActividadSeeder extends Seeder
{
    use SeedsFromDump;

    public function run(): void
    {
        $this->insertRows('actividades');
        $this->insertRows('actividad_categoria', idColumn: null);
    }
}
