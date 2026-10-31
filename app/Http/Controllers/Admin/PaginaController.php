<?php

namespace App\Http\Controllers\Admin;

use App\Bloques\RegistroDeBloques;
use App\Concerns\NotificaAlPanel;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\GuardarBorradorRequest;
use App\Http\Requests\Admin\GuardarPaginaRequest;
use App\Models\Pagina;
use App\Models\PaginaSeccion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaginaController extends Controller
{
    use NotificaAlPanel;

    public function index(Request $request): Response
    {
        $paginas = Pagina::query()
            // snapshot es imprescindible: tieneCambiosSinPublicar() compara
            // contra él. Recortarlo haría que toda página publicada saliera
            // como «con cambios sin publicar».
            ->with('versionPublicada:id,created_at,snapshot')
            ->withCount('secciones')
            ->when($request->filled('buscar'), function ($consulta) use ($request) {
                $termino = '%'.$request->string('buscar')->trim().'%';

                $consulta->where(fn ($q) => $q
                    ->where('titulo', 'ilike', $termino)
                    ->orWhere('slug', 'ilike', $termino));
            })
            ->orderBy('orden')
            ->orderBy('titulo')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Paginas/Index', [
            'paginas' => $paginas->through(fn (Pagina $pagina) => [
                'id' => $pagina->id,
                'titulo' => $pagina->titulo,
                'slug' => $pagina->slug,
                'url' => $pagina->urlPublica(),
                'secciones' => $pagina->secciones_count,
                'publicada' => $pagina->estaPublicada(),
                'es_sistema' => $pagina->es_sistema,
                'sin_publicar' => $pagina->tieneCambiosSinPublicar(),
                'actualizada' => $pagina->updated_at?->locale('es')->diffForHumans(),
            ]),
            'filtros' => $request->only('buscar'),
        ]);
    }

    public function store(GuardarPaginaRequest $request): RedirectResponse
    {
        $pagina = Pagina::create([
            ...$request->validated(),
            'created_by' => $request->user()->id,
            'updated_by' => $request->user()->id,
        ]);

        return to_route('admin.paginas.edit', $pagina);
    }

    /**
     * El editor visual.
     */
    public function edit(Pagina $pagina): Response
    {
        // Ver la nota de index(): snapshot hace falta para detectar cambios.
        $pagina->load('versionPublicada:id,created_at,snapshot');

        return Inertia::render('Admin/Paginas/Editor', [
            'pagina' => [
                'id' => $pagina->id,
                'titulo' => $pagina->titulo,
                'slug' => $pagina->slug,
                'url' => $pagina->urlPublica(),
                'es_modulo' => $pagina->esModulo(),
                'seo_titulo' => $pagina->seo_titulo,
                'seo_descripcion' => $pagina->seo_descripcion,
                'es_sistema' => $pagina->es_sistema,
                'publicada' => $pagina->estaPublicada(),
                'sin_publicar' => $pagina->tieneCambiosSinPublicar(),
                'publicada_el' => $pagina->versionPublicada?->created_at?->locale('es')->diffForHumans(),
            ],
            'secciones' => $pagina->secciones()
                ->get()
                ->map(fn (PaginaSeccion $seccion) => $seccion->aArray()),
            'datosBloques' => $this->datosParaVistaPrevia(),
        ]);
    }

    /**
     * Contenido de muestra para los bloques dinámicos dentro del editor.
     *
     * Se indexa por bloque y no por sección: en el editor las secciones se
     * crean y se reordenan en el cliente, y no tendría id con el que casar.
     * Para ver el resultado exacto está el botón de vista previa.
     *
     * @return array<string, mixed>
     */
    private function datosParaVistaPrevia(): array
    {
        $datos = [];

        foreach (RegistroDeBloques::claves() as $bloque) {
            if (RegistroDeBloques::necesitaDatos($bloque)) {
                $datos[$bloque] = RegistroDeBloques::datosDe($bloque, []);
            }
        }

        return $datos;
    }

    public function update(GuardarPaginaRequest $request, Pagina $pagina): RedirectResponse
    {
        $pagina->update([
            ...$request->validated(),
            'updated_by' => $request->user()->id,
        ]);

        return $this->exito('Ajustes de la página guardados.');
    }

    /**
     * Autoguardado del borrador desde el editor.
     *
     * Responde JSON en vez de una redirección de Inertia: el editor guarda
     * mientras se escribe y una recarga de props le borraría el foco.
     */
    public function guardarBorrador(GuardarBorradorRequest $request, Pagina $pagina): JsonResponse
    {
        $mapa = $pagina->guardarBorrador($request->secciones(), $request->user());

        return response()->json([
            'mapa' => $mapa,
            'sin_publicar' => $pagina->fresh()->tieneCambiosSinPublicar(),
            'guardado_el' => now()->toIso8601String(),
        ]);
    }

    public function destroy(Pagina $pagina): RedirectResponse
    {
        if ($pagina->es_sistema) {
            return $this->error('Esta página es parte de la estructura del sitio y no se puede eliminar.');
        }

        $pagina->delete();

        return $this->exito('Página eliminada.');
    }
}
