<?php

// app/Http/Controllers/Api/NoticiaController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use App\Models\Noticia;
use App\Support\Archivo;
use App\Support\Visitante;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class NoticiaController extends Controller
{
    public function index(Request $request)
    {
        try {
            // El scope resuelve estado y visibilidad por nombre: con los ids
            // a pelo, cualquier retoque del catálogo dejaba la lista vacía.
            $query = Noticia::with(['categorias', 'estado', 'visibilidad'])
                ->conMeGusta(Visitante::huella($request))
                ->activas()
                ->ordenadas();

            // ✅ Filtrar por categoría - CONSULTA DIRECTA
            if ($request->has('categoria') && $request->categoria) {
                $categoriaNombre = $request->categoria;

                $query->whereHas('categorias', function ($q) use ($categoriaNombre) {
                    $q->where('nombre', $categoriaNombre);
                });
            }

            // Filtrar por destacadas
            if ($request->has('destacada') && $request->destacada === 'true') {
                $query->where('destacada', true);
            }

            $noticias = $query->get()->each(fn (Noticia $noticia) => $this->conImagenPublica($noticia));

            // Obtener todas las categorías registradas
            $categorias = Categoria::query()->orderBy('nombre')->get();

            // Si es petición API
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => true,
                    'data' => $noticias,
                    'meta' => [
                        'total' => $noticias->count(),
                    ],
                ]);
            }

            // Si es petición web, renderizar Inertia
            return Inertia::render('Public/Noticias', [
                'data' => [
                    'data' => $noticias,
                    'pagination' => null,
                ],
                'categorias' => $categorias,
            ]);
        } catch (\Exception $e) {
            Log::error('Error en NoticiaController: '.$e->getMessage());
            Log::error($e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function show(string $slug, Request $request)
    {
        try {
            $noticia = Noticia::with(['categorias', 'estado', 'visibilidad', 'publicador'])
                ->conMeGusta(Visitante::huella($request))
                ->where('slug', $slug)
                ->activas()
                ->firstOrFail();

            if ($request->is('api/*')) {
                return response()->json([
                    'success' => true,
                    'data' => $this->conImagenPublica($noticia),
                    // Aparte de la noticia: en el modelo, `comentarios` es la relación.
                    'comentarios' => $noticia->comentariosPublicos(),
                ]);
            }

            return Inertia::render('Public/Noticias/Show', [
                'data' => [
                    'id' => $noticia->id,
                    'titulo' => $noticia->titulo,
                    'descripcion' => $noticia->descripcion,
                    'extracto' => $noticia->extracto,
                    'imagen' => Archivo::url($noticia->imagen),
                    'fecha_publicacion' => $noticia->fecha_publicacion?->format('Y-m-d'),
                    'fecha_evento' => $noticia->fecha_evento?->format('Y-m-d'),
                    'destacada' => $noticia->destacada,
                    'autor_visible' => $noticia->publicador?->name,
                    'slug' => $noticia->slug,
                    'categorias' => $noticia->categorias->map(function ($cat) {
                        return ['id' => $cat->id, 'nombre' => $cat->nombre];
                    }),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error en NoticiaController::show: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function categorias()
    {
        try {
            $categorias = Categoria::query()->orderBy('nombre')->get();

            return response()->json([
                'success' => true,
                'data' => $categorias,
            ]);
        } catch (\Exception $e) {
            Log::error('Error en NoticiaController::categorias: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * La columna guarda la ruta del disco (`medios/…`): sin pasarla por
     * `Archivo::url`, el navegador la resolvía contra /noticias y la imagen
     * salía rota. Solo cambia lo que se serializa; la noticia no se guarda.
     */
    private function conImagenPublica(Noticia $noticia): Noticia
    {
        return $noticia->setAttribute('imagen', Archivo::url($noticia->imagen));
    }
}
