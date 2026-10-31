<?php

namespace App\Http\Controllers;

use App\Concerns\DecoraConBloques;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Sirve las páginas de módulo: conservan su vista a medida (filtros,
 * paginación, visor de PDF) y reciben además las secciones editables que la
 * Cámara haya añadido encima o debajo del listado.
 */
class ModuloController extends Controller
{
    use DecoraConBloques;

    /**
     * Módulo → componente de Inertia.
     *
     * @var array<string, string>
     */
    private const VISTAS = [
        'noticias' => 'Public/Noticias',
        'actividades' => 'Public/Actividades',
        'socios' => 'Public/Socios',
        'servicios' => 'Public/Servicios',
        'fichas-pais' => 'Public/FichasPais',
        'red-camaras' => 'Public/RedCamaras',
        'contacto' => 'Public/Contacto',
        'formulario-afiliacion' => 'Public/FormularioAfiliacion',
        'convenios' => 'Public/Convenios',
    ];

    public function __invoke(Request $request, string $modulo): Response
    {
        abort_unless(isset(self::VISTAS[$modulo]), 404);

        return Inertia::render(self::VISTAS[$modulo], $this->bloquesDelModulo($request, $modulo));
    }
}
