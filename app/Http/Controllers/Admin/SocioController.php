<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\NotificaAlPanel;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\GuardarSocioRequest;
use App\Models\CategoriaAfiliado;
use App\Models\EstadoComercial;
use App\Models\Socio;
use App\Support\Archivo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SocioController extends Controller
{
    use NotificaAlPanel;

    public function index(Request $request): Response
    {
        $socios = Socio::query()
            ->with(['categoria:id,nombre', 'estado:id,nombre'])
            ->withCount('todosLosContactos')
            ->when($request->filled('buscar'), function ($consulta) use ($request) {
                $termino = '%'.$request->string('buscar')->trim().'%';

                $consulta->where(fn ($q) => $q
                    ->where('nombre', 'ilike', $termino)
                    ->orWhere('nit', 'ilike', $termino));
            })
            ->when(
                $request->filled('categoria'),
                fn ($consulta) => $consulta->porCategoria($request->integer('categoria')),
            )
            ->when(
                $request->filled('estado'),
                fn ($consulta) => $consulta->where('estado_id', $request->integer('estado')),
            )
            ->ordenados()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Socios/Index', [
            'socios' => $socios->through(fn (Socio $socio) => [
                'id' => $socio->id,
                'nombre' => $socio->nombre,
                'nit' => $socio->nit,
                'imagen' => Archivo::url($socio->imagen),
                'categoria' => $socio->categoria?->nombre,
                'estado' => $socio->estado?->nombre,
                'destacado' => $socio->destacado,
                'contactos' => $socio->todos_los_contactos_count,
                'url' => route('socios.show', $socio->slug),
            ]),
            'catalogos' => $this->catalogos(),
            'filtros' => $request->only('buscar', 'categoria', 'estado'),
        ]);
    }

    /**
     * Datos completos para el formulario de edición.
     */
    public function show(Socio $socio): JsonResponse
    {
        $socio->load('todosLosContactos');

        return response()->json([
            'id' => $socio->id,
            'nombre' => $socio->nombre,
            'slug' => $socio->slug,
            'nit' => $socio->nit,
            'descripcion' => $socio->descripcion,
            'imagen' => $socio->imagen,
            'sitio_web' => $socio->sitio_web,
            'telefono1' => $socio->telefono1,
            'telefono2' => $socio->telefono2,
            'correo_electronico' => $socio->correo_electronico,
            'direccion' => $socio->direccion,
            'categoria_id' => $socio->categoria_id,
            'estado_id' => $socio->estado_id,
            'fecha_afiliacion' => $socio->fecha_afiliacion?->format('Y-m-d'),
            'destacado' => $socio->destacado,
            'orden' => $socio->orden,
            'contactos' => $socio->todosLosContactos
                ->map(fn ($contacto) => [
                    'nombre' => $contacto->nombre,
                    'cargo' => $contacto->cargo,
                    'telefono' => $contacto->telefono,
                    'correo_electronico' => $contacto->correo_electronico,
                ])
                ->all(),
        ]);
    }

    public function store(GuardarSocioRequest $request): RedirectResponse
    {
        $datos = $request->validated();

        DB::transaction(function () use ($datos, $request): void {
            $socio = Socio::create([
                ...$this->columnas($datos),
                'created_by' => $request->user()->id,
                'updated_by' => $request->user()->id,
            ]);

            $this->guardarContactos($socio, $datos, $request->user()->id);
        });

        return $this->exito('Socio creado.');
    }

    public function update(GuardarSocioRequest $request, Socio $socio): RedirectResponse
    {
        $datos = $request->validated();

        DB::transaction(function () use ($datos, $request, $socio): void {
            $socio->update([
                ...$this->columnas($datos),
                'updated_by' => $request->user()->id,
            ]);

            $this->guardarContactos($socio, $datos, $request->user()->id);
        });

        return $this->exito('Socio actualizado.');
    }

    public function destroy(Socio $socio): RedirectResponse
    {
        $socio->delete();

        return $this->exito('Socio eliminado.');
    }

    /**
     * Columnas propias del socio. Un rubro escrito a mano tiene prioridad
     * sobre el elegido en la lista y se crea si aún no existe.
     *
     * @param  array<string, mixed>  $datos
     * @return array<string, mixed>
     */
    private function columnas(array $datos): array
    {
        $rubroNuevo = trim((string) ($datos['categoria_nueva'] ?? ''));

        if ($rubroNuevo !== '') {
            $datos['categoria_id'] = CategoriaAfiliado::firstOrCreate(['nombre' => $rubroNuevo])->id;
        }

        return collect($datos)->except('categoria_nueva', 'contactos')->all();
    }

    /**
     * Reemplaza los contactos por lo que mande el formulario, igual que las
     * secciones de una actividad. Se borran de verdad: la tabla usa borrado
     * lógico y, si no, cada guardado dejaría una copia muerta de cada uno.
     *
     * @param  array<string, mixed>  $datos
     */
    private function guardarContactos(Socio $socio, array $datos, int $usuarioId): void
    {
        $socio->todosLosContactos()->withTrashed()->forceDelete();

        foreach (array_values($datos['contactos'] ?? []) as $orden => $contacto) {
            $socio->todosLosContactos()->create([
                'nombre' => $contacto['nombre'],
                'cargo' => $contacto['cargo'] ?? null,
                'telefono' => $contacto['telefono'] ?? null,
                'correo_electronico' => $contacto['correo_electronico'] ?? null,
                'orden' => $orden,
                'activo' => true,
                'created_by' => $usuarioId,
                'updated_by' => $usuarioId,
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function catalogos(): array
    {
        return [
            'categorias' => CategoriaAfiliado::orderBy('nombre')->get(['id', 'nombre']),
            'estados' => EstadoComercial::orderBy('id')->get(['id', 'nombre']),
        ];
    }
}
