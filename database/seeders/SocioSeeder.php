<?php

namespace Database\Seeders;

use App\Models\Rol;
use Database\Seeders\Concerns\SeedsFromDump;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Usuarios y socios reales de camaraesp.sql.
 *
 * users.socio_id y socios.created_by/updated_by se referencian entre sí
 * (referencia circular), así que users se inserta primero con socio_id en
 * null y se restaura después de crear socios.
 *
 * Los roles del backup no coinciden en id con los que crea RolSeeder (el
 * enum los declara en otro orden), así que rol_id se traduce por nombre.
 */
class SocioSeeder extends Seeder
{
    use SeedsFromDump;

    public function run(): void
    {
        $socioIdDiferido = $this->insertUsuarios();

        $this->insertRows('socios');
        $this->restaurarColumna('users', 'socio_id', $socioIdDiferido);

        $this->insertRows('contactos_afiliados');
    }

    /**
     * @return array<int, mixed>
     */
    private function insertUsuarios(): array
    {
        $filas = $this->datosDe('users');

        if ($filas === []) {
            return [];
        }

        $nombrePorRolIdDelBackup = array_column($this->datosDe('roles'), 'nombre', 'id');
        $idPorNombreDeRol = Rol::pluck('id', 'nombre')->all();

        $filas = array_map(function (array $fila) use ($nombrePorRolIdDelBackup, $idPorNombreDeRol) {
            $nombreDelRol = $nombrePorRolIdDelBackup[$fila['rol_id']] ?? null;
            $fila['rol_id'] = $idPorNombreDeRol[$nombreDelRol] ?? null;

            return $fila;
        }, $filas);

        $socioIdOriginal = array_column($filas, 'socio_id', 'id');

        $filasSinSocio = array_map(function (array $fila) {
            $fila['socio_id'] = null;

            return $fila;
        }, $filas);

        DB::table('users')->insert($filasSinSocio);
        DB::statement("SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE((SELECT MAX(id) FROM users), 1))");

        $this->command?->info(sprintf('  users: %d filas (socio_id pendiente)', count($filas)));

        return $socioIdOriginal;
    }
}
