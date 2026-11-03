<?php

namespace Database\Seeders;

use App\Enums\Rol as RolEnum;
use App\Models\Rol;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Garantiza credenciales conocidas para entrar al panel y al portal de
 * empresas en un entorno recién sembrado.
 *
 * Corre después de SocioSeeder: si esos usuarios ya vinieron del backup real
 * (con su hash de contraseña original, desconocido), esto solo les pisa la
 * contraseña; el resto de sus datos (rol, socio, actividad) queda intacto.
 */
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

        $empresaDemo = User::where('email', 'camarabolsa@gmail.com')->first();

        if ($empresaDemo !== null) {
            $empresaDemo->forceFill(['password' => Hash::make('12345678')])->save();
        }
    }
}
