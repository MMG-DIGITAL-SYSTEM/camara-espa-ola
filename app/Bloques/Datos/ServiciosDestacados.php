<?php

namespace App\Bloques\Datos;

use App\Bloques\ProveeDatos;
use App\Models\Servicio;
use App\Support\Archivo;

class ServiciosDestacados implements ProveeDatos
{
    /**
     * @param  array<string, mixed>  $config
     * @return array<int, array<string, mixed>>
     */
    public function datos(array $config): array
    {
        $limite = (int) ($config['limite'] ?? 0);

        return Servicio::activos()
            ->ordenados()
            ->when($limite > 0, fn ($consulta) => $consulta->limit($limite))
            ->get()
            ->map(fn (Servicio $servicio) => [
                'id' => $servicio->id,
                'titulo' => $servicio->titulo,
                'contenido' => $servicio->contenido,
                'icono' => $servicio->icono,
                'imagen' => Archivo::url($servicio->imagen),
            ])
            ->all();
    }
}
