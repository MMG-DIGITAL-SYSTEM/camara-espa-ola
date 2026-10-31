<?php

namespace Database\Seeders;

use App\Enums\Rol as RolEnum;
use App\Models\Rol;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $rolAdministrador = Rol::where('nombre', RolEnum::Administrador->value)->firstOrFail();

        User::updateOrCreate(
            ['email' => 'admin@camara.com.bo'],
            [
                'name' => 'Administrador',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'activo' => true,
                'rol_id' => $rolAdministrador->id,
            ],
        );
    }
}
