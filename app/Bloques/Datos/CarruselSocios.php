<?php

namespace App\Bloques\Datos;

use App\Bloques\ProveeDatos;
use App\Models\Socio;
use App\Support\Archivo;

class CarruselSocios implements ProveeDatos
{
    /**
     * @param  array<string, mixed>  $config
     * @return array<int, array<string, mixed>>
     */
    public function datos(array $config): array
    {
        $limite = (int) ($config['limite'] ?? 0);
        $soloDestacados = (bool) ($config['solo_destacados'] ?? false);

        return Socio::activos()
            ->whereNotNull('imagen')
            ->when($soloDestacados, fn ($consulta) => $consulta->destacados())
            ->ordenados()
            ->when($limite > 0, fn ($consulta) => $consulta->limit($limite))
            ->get()
            ->map(fn (Socio $socio) => [
                'id' => $socio->id,
                'nombre' => $socio->nombre,
                'logo' => Archivo::url($socio->imagen),
                'url' => route('socios.show', $socio->slug),
            ])
            ->all();
    }
}
