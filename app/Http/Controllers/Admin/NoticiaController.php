<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\NotificaAlPanel;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\GuardarNoticiaRequest;
use App\Models\Categoria;
use App\Models\EstadoPublicacion;
use App\Models\Noticia;
use App\Models\Visibilidad;
use App\Support\Archivo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NoticiaController extends Controller
{
    use NotificaAlPanel;

    public function index(Request $request): Response
    {
        $noticias = Noticia::query()
            ->with(['estado:id,nombre', 'visibilidad:id,nombre', 'categorias:id,nombre'])
            ->when($request->filled('buscar'), function ($consulta) use ($request) {
                $termino = '%'.$request->string('buscar')->trim().'%';

                $consulta->where(fn ($q) => $q
                    ->where('titulo', 'ilike', $termino)
                    ->orWhere('extracto', 'ilike', $termino));
            })
            ->when(
                $request->filled('estado'),
                fn ($consulta) => $consulta->where('estado_id', $request->integer('estado')),
            )
            ->ordenadas()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Noticias/Index', [
            'noticias' => $noticias->through(fn (Noticia $noticia) => [
                'id' => $noticia->id,
                'titulo' => $noticia->titulo,
                'slug' => $noticia->slug,
                'imagen' => Archivo::url($noticia->imagen),
                'estado' => $noticia->estado?->nombre,
                'estado_id' => $noticia->estado_id,
                'visibilidad' => $noticia->visibilidad?->nombre,
                'destacada' => $noticia->destacada,
                'categorias' => $noticia->categorias->pluck('nombre')->all(),
                'fecha' => $noticia->fecha_publicacion?->locale('es')->isoFormat('D MMM YYYY'),
                'url' => $noticia->slug ? route('noticias.show', $noticia->slug) : null,
            ]),
            'catalogos' => $this->catalogos(),
            'filtros' => $request->only('buscar', 'estado'),
        ]);
    }

    /**
     * Datos de una noticia para el formulario de edición.
     *
     * Va aparte del listado para no cargar el cuerpo completo de quince
     * noticias en cada visita a la tabla.
     *
     * @return array<string, mixed>
     */
    public function show(Noticia $noticia): JsonResponse
    {
        $noticia->load('categorias:id');

        return response()->json([
            'id' => $noticia->id,
            'titulo' => $noticia->titulo,
            'slug' => $noticia->slug,
            'extracto' => $noticia->extracto,
            'descripcion' => $noticia->descripcion,
            'imagen' => $noticia->imagen,
            'fecha_publicacion' => $noticia->fecha_publicacion?->format('Y-m-d\TH:i'),
            'fecha_evento' => $noticia->fecha_evento?->format('Y-m-d\TH:i'),
            'estado_id' => $noticia->estado_id,
            'visibilidad_id' => $noticia->visibilidad_id,
            'destacada' => $noticia->destacada,
            'categorias' => $noticia->categorias->pluck('id')->all(),
        ]);
    }

    public function store(GuardarNoticiaRequest $request): RedirectResponse
    {
        $noticia = Noticia::create([
            ...collect($request->validated())->except('categorias')->all(),
            'publicado_por' => $request->user()->id,
            'updated_by' => $request->user()->id,
        ]);

        $noticia->categorias()->sync($request->validated('categorias', []));

        return $this->exito('Noticia creada.');
    }

    public function update(GuardarNoticiaRequest $request, Noticia $noticia): RedirectResponse
    {
        $noticia->update([
            ...collect($request->validated())->except('categorias')->all(),
            'updated_by' => $request->user()->id,
        ]);

        $noticia->categorias()->sync($request->validated('categorias', []));

        return $this->exito('Noticia actualizada.');
    }

    public function destroy(Noticia $noticia): RedirectResponse
    {
        $noticia->delete();

        return $this->exito('Noticia eliminada.');
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
