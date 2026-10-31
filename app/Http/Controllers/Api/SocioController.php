<?php

// app/Http/Controllers/Api/SocioController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CategoriaAfiliado;
use App\Models\ContactoAfiliado;
use App\Models\Socio;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class SocioController extends Controller
{
    /**
     * GET /socios (página pública) o /api/socios (API)
     */
    public function index(Request $request): JsonResponse|InertiaResponse
    {
        $consulta = Socio::with(['categoria', 'estado', 'contactos'])->activos();

        if ($request->filled('categoria')) {
            $consulta->porCategoria((int) $request->integer('categoria'));
        }

        if ($request->filled('buscar')) {
            $termino = '%'.$request->string('buscar')->trim().'%';

            $consulta->where(fn ($q) => $q
                ->where('nombre', 'ilike', $termino)
                ->orWhere('descripcion', 'ilike', $termino));
        }

        match ($request->string('orden')->toString()) {
            'nombre' => $consulta->orderBy('nombre'),
            'nombre_desc' => $consulta->orderByDesc('nombre'),
            'recientes' => $consulta->orderByDesc('fecha_afiliacion')->orderBy('nombre'),
            'antiguos' => $consulta->orderBy('fecha_afiliacion')->orderBy('nombre'),
            default => $consulta->ordenados(),
        };

        $socios = $consulta->paginate(12)->withQueryString();

        if ($request->is('api/*')) {
            return response()->json([
                'success' => true,
                'data' => $socios->getCollection()->map(fn (Socio $socio) => [
                    ...$this->resumen($socio),
                    'categoria' => $socio->categoria?->nombre,
                    'destacado' => $socio->destacado,
                    'contactos' => $this->contactos($socio->contactos),
                ]),
                'meta' => [
                    'current_page' => $socios->currentPage(),
                    'last_page' => $socios->lastPage(),
                    'total' => $socios->total(),
                    'next_page_url' => $socios->nextPageUrl(),
                ],
            ]);
        }

        return Inertia::render('Public/Socios', [
            'data' => [
                'data' => $socios->getCollection()->map(fn (Socio $socio) => [
                    ...$this->resumen($socio),
                    'categoria' => $socio->categoria ? [
                        'id' => $socio->categoria->id,
                        'nombre' => $socio->categoria->nombre,
                    ] : null,
                ])->toArray(),
                'pagination' => [
                    'current_page' => $socios->currentPage(),
                    'last_page' => $socios->lastPage(),
                    'per_page' => $socios->perPage(),
                    'total' => $socios->total(),
                    'next_page_url' => $socios->nextPageUrl(),
                    'prev_page_url' => $socios->previousPageUrl(),
                    'links' => $socios->linkCollection()->toArray(),
                ],
            ],
            'categorias' => $this->listaCategorias(),
        ]);
    }

    /**
     * GET /socios/{slug} (página pública) o /api/socios/{slug} (API)
     */
    public function show(string $slug, Request $request): JsonResponse|InertiaResponse
    {
        $socio = Socio::with(['categoria', 'estado', 'contactos'])
            ->activos()
            ->where('slug', $slug)
            ->first();

        if (! $socio) {
            if ($request->is('api/*')) {
                return response()->json(['success' => false, 'message' => 'Socio no encontrado'], 404);
            }

            abort(404, 'Socio no encontrado');
        }

        if ($request->is('api/*')) {
            return response()->json([
                'success' => true,
                'data' => [
                    ...$this->resumen($socio),
                    'nit' => $socio->nit,
                    'categoria' => $socio->categoria?->nombre,
                    'estado' => $socio->estado?->nombre,
                    'telefono1' => $socio->telefono1,
                    'telefono2' => $socio->telefono2,
                    'fecha_afiliacion' => $socio->fecha_afiliacion?->format('d/m/Y'),
                    'contactos' => $this->contactos($socio->contactos),
                ],
            ]);
        }

        return Inertia::render('Public/Socios/Show', [
            'data' => [
                ...$this->resumen($socio),
                'nit' => $socio->nit,
                'categoria' => $socio->categoria ? [
                    'id' => $socio->categoria->id,
                    'nombre' => $socio->categoria->nombre,
                ] : null,
                'celular' => $socio->telefono2,
                'contactos' => $this->contactos($socio->contactos, incluirEmail: true)->toArray(),
            ],
        ]);
    }

    /**
     * GET /api/socios/categorias
     */
    public function categorias(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->listaCategorias(),
        ]);
    }

    /**
     * GET /api/socios/carrusel — logos para el carrusel de la portada.
     */
    public function carrusel(): JsonResponse
    {
        $socios = Socio::activos()
            ->whereNotNull('imagen')
            ->ordenados()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $socios->map(fn (Socio $socio) => [
                'id' => $socio->id,
                'nombre' => $socio->nombre,
                'logo' => $this->urlImagen($socio->imagen),
                'slug' => $socio->slug,
            ]),
        ]);
    }

    /**
     * Campos comunes a todas las representaciones de un socio.
     *
     * @return array<string, mixed>
     */
    private function resumen(Socio $socio): array
    {
        return [
            'id' => $socio->id,
            'nombre' => $socio->nombre,
            'slug' => $socio->slug,
            'descripcion' => $socio->descripcion,
            'logo' => $this->urlImagen($socio->imagen),
            'pagina_web' => $socio->sitio_web,
            'telefono' => $socio->telefono1,
            'correo' => $socio->correo_electronico,
            'direccion' => $socio->direccion,
        ];
    }

    /**
     * @param  Collection<int, ContactoAfiliado>  $contactos
     * @return Collection<int, array<string, mixed>>
     */
    private function contactos(Collection $contactos, bool $incluirEmail = false): Collection
    {
        return $contactos->map(fn (ContactoAfiliado $contacto) => [
            'id' => $contacto->id,
            'nombre' => $contacto->nombre,
            'cargo' => $contacto->cargo,
            'telefono' => $contacto->telefono,
            ...$incluirEmail
                ? ['email' => $contacto->correo_electronico]
                : ['correo' => $contacto->correo_electronico],
        ]);
    }

    /**
     * Rubros con cuántos socios activos tiene cada uno, para que el filtro
     * del sitio pueda mostrar la cifra junto a cada opción.
     *
     * @return array<int, array{id: int, nombre: string, total: int}>
     */
    private function listaCategorias(): array
    {
        return CategoriaAfiliado::orderBy('nombre')
            ->withCount(['socios as total' => fn ($consulta) => $consulta->activos()])
            ->get(['id', 'nombre'])
            ->map(fn (CategoriaAfiliado $categoria) => [
                'id' => $categoria->id,
                'nombre' => $categoria->nombre,
                'total' => (int) $categoria->total,
            ])
            ->toArray();
    }

    /**
     * Resuelve la URL de una imagen, ya sea externa o almacenada localmente.
     */
    private function urlImagen(?string $imagen): ?string
    {
        if (! $imagen) {
            return null;
        }

        return filter_var($imagen, FILTER_VALIDATE_URL)
            ? $imagen
            : asset('storage/'.$imagen);
    }
}
