<?php

namespace Database\Seeders;

use App\Enums\Rol as RolEnum;
use App\Models\Rol;
use Illuminate\Database\Seeder;

class RolSeeder extends Seeder
{
    public function run(): void
    {
        foreach (RolEnum::cases() as $rol) {
            Rol::updateOrCreate(
                ['nombre' => $rol->value],
                ['descripcion' => $rol->descripcion()],
            );
        }
    }
}
