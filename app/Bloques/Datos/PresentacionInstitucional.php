<?php

namespace App\Bloques\Datos;

use App\Bloques\ProveeDatos;
use App\Models\ContenidoInstitucional;
use App\Support\Archivo;

/**
 * Texto de presentación tomado de `contenido_institucional`.
 *
 * Es el mismo contenido que muestra La Cámara, así que se edita en un solo
 * sitio: el bloque solo elige qué sección enseñar.
 */
class PresentacionInstitucional implements ProveeDatos
{
    /**
     * @param  array<string, mixed>  $config
     * @return array{titulo: string, contenido: string, imagen: string|null}|null
     */
    public function datos(array $config): ?array
    {
        $seccion = (string) ($config['seccion'] ?? 'nosotros');

        $contenido = ContenidoInstitucional::activos()
            ->porSeccion($seccion)
            ->ordenados()
            ->first();

        if (! $contenido) {
            return null;
        }

        return [
            'titulo' => $contenido->titulo,
            'contenido' => $contenido->contenido,
            'imagen' => Archivo::url($contenido->imagen),
        ];
    }
}
