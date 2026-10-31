<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\NotificaAlPanel;
use App\Concerns\PresentaOfertasEmpleo;
use App\Http\Controllers\Controller;
use App\Http\Requests\GuardarOfertaEmpleoRequest;
use App\Models\OfertaEmpleo;
use App\Models\Socio;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Moderación de la bolsa de trabajo: el equipo ve las ofertas de todos los
 * socios y puede corregirlas, cerrarlas o publicarlas en nombre de uno.
 */
class OfertaEmpleoController extends Controller
{
    use NotificaAlPanel, PresentaOfertasEmpleo;

    public function index(Request $request): Response
    {
        $ofertas = OfertaEmpleo::query()
            ->with('socio:id,nombre,estado_id', 'socio.estado:id,nombre')
            ->when($request->filled('buscar'), function ($consulta) use ($request) {
                $termino = '%'.$request->string('buscar')->trim().'%';

                $consulta->where(fn ($q) => $q
                    ->where('titulo', 'ilike', $termino)
                    ->orWhereHas('socio', fn ($socio) => $socio->where('nombre', 'ilike', $termino)));
            })
            ->when($request->filled('estado'), fn ($consulta) => $consulta->where('estado', $request->string('estado')))
            ->when($request->filled('socio'), fn ($consulta) => $consulta->where('socio_id', $request->integer('socio')))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/BolsaTrabajo/Index', [
            'ofertas' => $ofertas->through(fn (OfertaEmpleo $oferta) => $this->filaDeOferta($oferta)),
            'opciones' => $this->opcionesDeOferta(),
            'socios' => Socio::orderBy('nombre')->get(['id', 'nombre']),
            'filtros' => $request->only('buscar', 'estado', 'socio'),
        ]);
    }

    public function show(OfertaEmpleo $oferta): JsonResponse
    {
        return response()->json($this->formularioDeOferta($oferta));
    }

    public function store(GuardarOfertaEmpleoRequest $request): RedirectResponse
    {
        OfertaEmpleo::create([
            ...$request->validated(),
            'created_by' => $request->user()->id,
            'updated_by' => $request->user()->id,
        ]);

        return $this->exito('Oferta creada.');
    }

    public function update(GuardarOfertaEmpleoRequest $request, OfertaEmpleo $oferta): RedirectResponse
    {
        $oferta->update([
            ...$request->validated(),
            'updated_by' => $request->user()->id,
        ]);

        return $this->exito('Oferta actualizada.');
    }

    public function destroy(OfertaEmpleo $oferta): RedirectResponse
    {
        $oferta->delete();

        return $this->exito('Oferta eliminada.');
    }
}
