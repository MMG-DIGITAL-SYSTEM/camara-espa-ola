<?php

// app/Http/Controllers/Api/ActividadController.php

namespace App\Http\Controllers\Api;

use App\Concerns\DecoraConBloques;
use App\Http\Controllers\Controller;
use App\Models\Actividad;
use App\Models\Categoria;
use App\Support\Archivo;
use App\Support\HtmlSeguro;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ActividadController extends Controller
{
    use DecoraConBloques;

    /**
     * GET /actividades
     * Listado de actividades para la página pública
     */
    public function index(Request $request)
    {
        $query = Actividad::with(['categorias', 'estado', 'publicador'])
            ->publicadas()
            ->activas()
            ->ordenadas();

        // Filtrar por categoría
        if ($request->has('categoria') && $request->categoria) {
            $query->porCategoria($request->categoria);
        }

        $actividades = $query->paginate(12);

        // ✅ Renderizar la página de Inertia con los datos
        return Inertia::render('Public/Actividades', [
            ...$this->bloquesDelModulo($request, 'actividades'),
            'data' => [
                'data' => $actividades->map(function ($actividad) {
                    return [
                        'id' => $actividad->id,
                        'titulo' => $actividad->titulo,
                        'descripcion' => $actividad->descripcion,
                        'extracto' => $this->getExtracto($actividad->descripcion),
                        'imagen' => Archivo::url($actividad->imagen),
                        'fecha_publicacion' => $actividad->fecha_publicacion?->format('d/m/Y'),
                        'categorias' => $actividad->categorias->pluck('nombre')->toArray(),
                        'slug' => (string) $actividad->id,
                    ];
                })->toArray(),
                'pagination' => [
                    'current_page' => $actividades->currentPage(),
                    'last_page' => $actividades->lastPage(),
                    'per_page' => $actividades->perPage(),
                    'total' => $actividades->total(),
                    'links' => $actividades->linkCollection()->toArray(),
                ],
            ],
        ]);
    }

    /**
     * GET /actividades/{id}
     * Detalle de una actividad
     */
    public function show($id)
    {
        $actividad = Actividad::with([
            'categorias',
            'secciones' => function ($q) {
                $q->where('activo', true)->orderBy('orden');
            },
            'archivos' => function ($q) {
                $q->where('activo', true)->orderBy('orden');
            },
            'patrocinadores',
            'publicador',
            'estado',
            'visibilidad',
        ])->publicadas()->activas()->find($id);

        if (! $actividad) {
            abort(404, 'Actividad no encontrada');
        }

        // ✅ Renderizar la página de detalle de Inertia
        return Inertia::render('Public/Actividades/Show', [
            'data' => [
                'id' => $actividad->id,
                'titulo' => $actividad->titulo,
                'descripcion' => $actividad->descripcion,
                'extracto' => $this->getExtracto($actividad->descripcion),
                'imagen' => Archivo::url($actividad->imagen),
                'fecha_publicacion' => $actividad->fecha_publicacion?->format('d/m/Y'),
                'fecha_evento' => $actividad->fecha_evento?->format('d/m/Y'),
                'autor_visible' => $actividad->autor_visible ?? $actividad->publicador?->name,
                'categorias' => $actividad->categorias->map(function ($cat) {
                    return ['id' => $cat->id, 'nombre' => $cat->nombre];
                })->toArray(),
                'secciones' => $actividad->secciones->map(function ($seccion) {
                    return [
                        'id' => $seccion->id,
                        'titulo' => $seccion->titulo,
                        'contenido' => $seccion->contenido,
                        'orden' => $seccion->orden,
                    ];
                })->toArray(),
                'archivos' => $actividad->archivos->map(function ($archivo) {
                    return [
                        'id' => $archivo->id,
                        'nombre' => $archivo->nombre,
                        'url' => Archivo::url($archivo->archivo_url),
                        'tipo' => $archivo->tipo,
                    ];
                })->toArray(),
            ],
        ]);
    }

    /**
     * GET /actividades/categorias
     * Lista de categorías disponibles (para API)
     */
    public function categorias()
    {
        $categorias = Categoria::whereHas('actividades')
            ->orderBy('nombre')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $categorias->map(function ($categoria) {
                return [
                    'id' => $categoria->id,
                    'nombre' => $categoria->nombre,
                ];
            }),
        ]);
    }

    /**
     * Extracto en texto plano: la descripción sale del editor enriquecido.
     */
    private function getExtracto(?string $descripcion): string
    {
        return HtmlSeguro::textoPlano($descripcion, 150);
    }
}
