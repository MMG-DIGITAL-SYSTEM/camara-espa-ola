<?php

namespace App\Bloques\Datos;

use App\Bloques\ProveeDatos;
use App\Models\FichaPais;
use App\Support\Archivo;

class ListaFichasPais implements ProveeDatos
{
    /**
     * @param  array<string, mixed>  $config
     * @return array<int, array<string, mixed>>
     */
    public function datos(array $config): array
    {
        $limite = (int) ($config['limite'] ?? 0);

        return FichaPais::where('activo', true)
            ->orderBy('orden')
            ->orderBy('pais')
            ->when($limite > 0, fn ($consulta) => $consulta->limit($limite))
            ->get()
            ->map(fn (FichaPais $ficha) => [
                'id' => $ficha->id,
                'pais' => $ficha->pais,
                'titulo' => $ficha->titulo,
                'descripcion' => $ficha->descripcion,
                'pdf' => Archivo::url($ficha->pdf_url),
                'url' => route('fichas-pais'),
            ])
            ->all();
    }
}
