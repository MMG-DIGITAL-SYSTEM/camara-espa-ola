<?php

namespace Database\Seeders;

use Database\Seeders\Concerns\SeedsFromDump;
use Illuminate\Database\Seeder;

class NoticiaSeeder extends Seeder
{
    use SeedsFromDump;

    public function run(): void
    {
        $this->insertRows('noticias');
        $this->insertRows('noticia_categoria', idColumn: null);
    }
}
