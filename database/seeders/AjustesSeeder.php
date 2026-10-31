<?php

namespace Database\Seeders;

use App\Models\Ajuste;
use Illuminate\Database\Seeder;

/**
 * Ajustes iniciales.
 *
 * Reproduce los datos que estaban escritos en
 * `resources/js/config/navigation.ts`, para que el pie del sitio se vea igual
 * el primer día y la Cámara pueda cambiarlos desde el panel a partir de ahí.
 */
class AjustesSeeder extends Seeder
{
    public function run(): void
    {
        if (Ajuste::exists()) {
            $this->command?->warn('  Los ajustes ya existen; se dejan como están.');

            return;
        }

        Ajuste::guardar([
            'sitio_nombre' => 'Cámara Oficial Española en Bolivia',
            'seo_descripcion' => 'La Cámara Oficial Española de Comercio en Bolivia conecta oportunidades de negocio entre España y Bolivia.',

            'oficina_sc_titulo' => 'SANTA CRUZ',
            'oficina_sc_direccion' => 'Av. 4to anillo, Calle Dr. Jaime Román – Zona Equipetrol, Edificio SKY LUX, Piso 11, Oficina 11C.',

            'oficina_lp_titulo' => 'LA PAZ',
            'oficina_lp_direccion' => 'Av. Arce, Hotel Real Plaza, Piso 4, Oficina 402.',
        ]);

        $this->command?->info(sprintf('  ajustes: %d claves', Ajuste::count()));
    }
}
