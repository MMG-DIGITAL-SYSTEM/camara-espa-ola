<?php

namespace Database\Seeders;

use App\Models\MenuItem;
use Illuminate\Database\Seeder;

/**
 * Menú inicial del sitio.
 *
 * Reproduce la estructura que estaba escrita a mano en
 * `resources/js/config/navigation.ts`, pero con las direcciones reales: allí
 * todos los enlaces apuntaban a «#» y no llevaban a ninguna parte.
 */
class MenuSeeder extends Seeder
{
    public function run(): void
    {
        if (MenuItem::exists()) {
            $this->command?->warn('  El menú ya está creado; se deja como está.');

            return;
        }

        $principal = [
            ['Inicio', '/', []],
            ['La Cámara', '/la-camara', [
                ['Quiénes somos', '/la-camara'],
                ['Directorio', '/la-camara#directorio'],
                ['Bolsa de trabajo', '/bolsa-de-trabajo'],
            ]],
            ['Actividades', '/actividades', []],
            ['Socios', '/socios', [
                ['Lista de socios', '/socios'],
                ['Afíliate', '/afiliate/formulario'],
            ]],
            ['Servicios', '/servicios', []],
            ['España · Bolivia', null, [
                ['Fichas país', '/fichas-pais'],
                ['Red de cámaras', '/red-camaras'],
            ]],
            ['Noticias', '/noticias', []],
            ['Contacto', '/contacto', []],
        ];

        foreach ($principal as $orden => [$titulo, $url, $hijos]) {
            $padre = MenuItem::create([
                'ubicacion' => MenuItem::PRINCIPAL,
                'titulo' => $titulo,
                'url' => $url,
                'orden' => $orden,
            ]);

            foreach ($hijos as $ordenHijo => [$tituloHijo, $urlHijo]) {
                MenuItem::create([
                    'ubicacion' => MenuItem::PRINCIPAL,
                    'titulo' => $tituloHijo,
                    'url' => $urlHijo,
                    'padre_id' => $padre->id,
                    'orden' => $ordenHijo,
                ]);
            }
        }

        $pie = [
            ['La Cámara', '/la-camara'],
            ['Servicios', '/servicios'],
            ['Socios', '/socios'],
            ['Noticias', '/noticias'],
            ['Red de cámaras', '/red-camaras'],
            ['Contacto', '/contacto'],
        ];

        foreach ($pie as $orden => [$titulo, $url]) {
            MenuItem::create([
                'ubicacion' => MenuItem::PIE,
                'titulo' => $titulo,
                'url' => $url,
                'orden' => $orden,
            ]);
        }

        $this->command?->info(sprintf('  menú: %d entradas', MenuItem::count()));
    }
}
