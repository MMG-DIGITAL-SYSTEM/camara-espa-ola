<?php

namespace App\Bloques\Datos;

use App\Bloques\ProveeDatos;
use App\Models\RedCamara;
use App\Support\Archivo;

class ListaRedCamaras implements ProveeDatos
{
    /**
     * @param  array<string, mixed>  $config
     * @return array<int, array<string, mixed>>
     */
    public function datos(array $config): array
    {
        $limite = (int) ($config['limite'] ?? 0);

        return RedCamara::where('activo', true)
            ->orderBy('orden')
            ->orderBy('nombre')
            ->when($limite > 0, fn ($consulta) => $consulta->limit($limite))
            ->get()
            ->map(fn (RedCamara $camara) => [
                'id' => $camara->id,
                'nombre' => $camara->nombre,
                'pais' => $camara->pais,
                'ciudad' => $camara->ciudad,
                'logo' => Archivo::url($camara->logo),
                'web' => $camara->pagina_web,
            ])
            ->all();
    }
}
