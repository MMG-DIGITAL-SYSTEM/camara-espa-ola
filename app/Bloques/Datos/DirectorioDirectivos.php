<?php

namespace App\Bloques\Datos;

use App\Bloques\ProveeDatos;
use App\Models\Directivo;
use App\Support\Archivo;

class DirectorioDirectivos implements ProveeDatos
{
    /**
     * @param  array<string, mixed>  $config
     * @return array<int, array<string, mixed>>
     */
    public function datos(array $config): array
    {
        $limite = (int) ($config['limite'] ?? 0);

        return Directivo::activos()
            ->ordenados()
            ->when($limite > 0, fn ($consulta) => $consulta->limit($limite))
            ->get()
            ->map(fn (Directivo $directivo) => [
                'id' => $directivo->id,
                'nombre' => $directivo->nombre,
                'cargo' => $directivo->cargo,
                'empresa' => $directivo->empresa,
                'imagen' => Archivo::url($directivo->imagen),
            ])
            ->all();
    }
}
