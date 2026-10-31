<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\NotificaAlPanel;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\GuardarActividadRequest;
use App\Models\Actividad;
use App\Models\Categoria;
use App\Models\EstadoPublicacion;
use App\Models\Visibilidad;
use App\Support\Archivo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ActividadController extends Controller
{
    use NotificaAlPanel;

    public function index(Request $request): Response
    {
        $actividades = Actividad::query()
            ->with(['estado:id,nombre', 'visibilidad:id,nombre', 'categorias:id,nombre'])
            ->withCount(['secciones', 'archivos'])
            ->when($request->filled('buscar'), function ($consulta) use ($request) {
                $termino = '%'.$request->string('buscar')->trim().'%';

                $consulta->where(fn ($q) => $q
                    ->where('titulo', 'ilike', $termino)
                    ->orWhere('descripcion', 'ilike', $termino));
            })
            ->when(
                $request->filled('estado'),
                fn ($consulta) => $consulta->where('estado_id', $request->integer('estado')),
            )
            ->orderByDesc('fecha_evento')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Actividades/Index', [
            'actividades' => $actividades->through(fn (Actividad $actividad) => [
                'id' => $actividad->id,
                'titulo' => $actividad->titulo,
                'imagen' => Archivo::url($actividad->imagen),
                'estado' => $actividad->estado?->nombre,
                'estado_id' => $actividad->estado_id,
                'visibilidad' => $actividad->visibilidad?->nombre,
                'categorias' => $actividad->categorias->pluck('nombre')->all(),
                'fecha_evento' => $actividad->fecha_evento?->locale('es')->isoFormat('D MMM YYYY'),
                'es_proxima' => $actividad->fecha_evento?->isFuture() ?? false,
                'secciones' => $actividad->secciones_count,
                'archivos' => $actividad->archivos_count,
                'url' => url('/actividades/'.$actividad->id),
            ]),
            'catalogos' => $this->catalogos(),
            'filtros' => $request->only('buscar', 'estado'),
        ]);
    }

    /**
     * Datos completos para el formulario de edición.
     *
     * Van aparte del listado: la descripción y las secciones son largas y no
     * tiene sentido cargarlas quince veces en cada visita a la tabla.
     */
    public function show(Actividad $actividad): JsonResponse
    {
        $actividad->load(['categorias:id', 'secciones', 'archivos']);

        return response()->json([
            'id' => $actividad->id,
            'titulo' => $actividad->titulo,
            'descripcion' => $actividad->descripcion,
            'imagen' => $actividad->imagen,
            'fecha_publicacion' => $actividad->fecha_publicacion?->format('Y-m-d\TH:i'),
            'fecha_evento' => $actividad->fecha_evento?->format('Y-m-d\TH:i'),
            'estado_id' => $actividad->estado_id,
            'visibilidad_id' => $actividad->visibilidad_id,
            'autor_visible' => $actividad->autor_visible,
            'categorias' => $actividad->categorias->pluck('id')->all(),
            'secciones' => $actividad->secciones
                ->map(fn ($seccion) => [
                    'titulo' => $seccion->titulo,
                    'contenido' => $seccion->contenido,
                ])
                ->all(),
            'archivos' => $actividad->archivos
                ->map(fn ($archivo) => [
                    'nombre' => $archivo->nombre,
                    'archivo_url' => $archivo->archivo_url,
                    'tipo' => $archivo->tipo,
                ])
                ->all(),
        ]);
    }

    public function store(GuardarActividadRequest $request): RedirectResponse
    {
        $datos = $request->validated();

        DB::transaction(function () use ($datos, $request): void {
            $actividad = Actividad::create([
                ...collect($datos)->except('categorias', 'secciones', 'archivos')->all(),
                'publicado_por' => $request->user()->id,
                'updated_by' => $request->user()->id,
            ]);

            $actividad->categorias()->sync($datos['categorias'] ?? []);

            $this->guardarHijos($actividad, $datos);
        });

        return $this->exito('Actividad creada.');
    }

    public function update(GuardarActividadRequest $request, Actividad $actividad): RedirectResponse
    {
        $datos = $request->validated();

        DB::transaction(function () use ($datos, $request, $actividad): void {
            $actividad->update([
                ...collect($datos)->except('categorias', 'secciones', 'archivos')->all(),
                'updated_by' => $request->user()->id,
            ]);

            $actividad->categorias()->sync($datos['categorias'] ?? []);

            $this->guardarHijos($actividad, $datos);
        });

        return $this->exito('Actividad actualizada.');
    }

    public function destroy(Actividad $actividad): RedirectResponse
    {
        $actividad->delete();

        return $this->exito('Actividad eliminada.');
    }

    /**
     * Reemplaza las secciones y los archivos por lo que mande el formulario.
     *
     * Se borran y se vuelven a crear en lugar de casarlos por id: nada fuera
     * de la actividad los referencia, así que conservar sus identificadores no
     * aporta nada y sí abre la puerta a huérfanos si el formulario y la base
     * se desincronizan. El orden sale de la posición en el array.
     *
     * @param  array<string, mixed>  $datos
     */
    private function guardarHijos(Actividad $actividad, array $datos): void
    {
        $actividad->secciones()->delete();
        $actividad->archivos()->delete();

        foreach (array_values($datos['secciones'] ?? []) as $orden => $seccion) {
            $actividad->secciones()->create([
                'titulo' => $seccion['titulo'],
                'contenido' => $seccion['contenido'],
                'orden' => $orden,
                'activo' => true,
            ]);
        }

        foreach (array_values($datos['archivos'] ?? []) as $orden => $archivo) {
            $actividad->archivos()->create([
                'nombre' => $archivo['nombre'],
                'archivo_url' => $archivo['archivo_url'],
                'tipo' => $archivo['tipo'] ?? null,
                'orden' => $orden,
                'activo' => true,
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function catalogos(): array
    {
        return [
            'estados' => EstadoPublicacion::orderBy('id')->get(['id', 'nombre']),
            'visibilidades' => Visibilidad::orderBy('id')->get(['id', 'nombre']),
            'categorias' => Categoria::orderBy('nombre')->get(['id', 'nombre']),
        ];
    }
}
