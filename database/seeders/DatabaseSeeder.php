<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolSeeder::class,
            CatalogoSeeder::class,
            SocioSeeder::class,
            DirectorioSeeder::class,
            ActividadSeeder::class,
            NoticiaSeeder::class,
            ContenidoSeeder::class,
            OfertaEmpleoSeeder::class,
            PaginasSeeder::class,
            MenuSeeder::class,
            AdminSeeder::class,
        ]);
    }
}
