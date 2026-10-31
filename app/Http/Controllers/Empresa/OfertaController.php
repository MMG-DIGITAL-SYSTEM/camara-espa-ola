<?php

namespace App\Http\Controllers\Empresa;

use App\Concerns\NotificaAlPanel;
use App\Concerns\PresentaOfertasEmpleo;
use App\Http\Controllers\Controller;
use App\Http\Requests\GuardarOfertaEmpleoRequest;
use App\Models\OfertaEmpleo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Portal de empresas: cada socio gestiona aquí sus propias ofertas.
 */
class OfertaController extends Controller
{
    use NotificaAlPanel, PresentaOfertasEmpleo;

    public function index(Request $request): Response
    {
        $ofertas = OfertaEmpleo::query()
            ->with('socio:id,nombre,estado_id', 'socio.estado:id,nombre')
            ->where('socio_id', $request->user()->socio_id)
            ->when($request->filled('buscar'), fn ($consulta) => $consulta
                ->where('titulo', 'ilike', '%'.$request->string('buscar')->trim().'%'))
            ->when($request->filled('estado'), fn ($consulta) => $consulta->where('estado', $request->string('estado')))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Empresa/Ofertas/Index', [
            'ofertas' => $ofertas->through(fn (OfertaEmpleo $oferta) => $this->filaDeOferta($oferta)),
            'opciones' => $this->opcionesDeOferta(),
            'filtros' => $request->only('buscar', 'estado'),
        ]);
    }

    public function show(OfertaEmpleo $oferta): JsonResponse
    {
        Gate::authorize('gestionar', $oferta);

        return response()->json($this->formularioDeOferta($oferta));
    }

    public function store(GuardarOfertaEmpleoRequest $request): RedirectResponse
    {
        OfertaEmpleo::create([
            ...$request->validated(),
            'socio_id' => $request->user()->socio_id,
            'created_by' => $request->user()->id,
            'updated_by' => $request->user()->id,
        ]);

        return $this->exito('Oferta creada.');
    }

    public function update(GuardarOfertaEmpleoRequest $request, OfertaEmpleo $oferta): RedirectResponse
    {
        Gate::authorize('gestionar', $oferta);

        $oferta->update([
            ...$request->validated(),
            'updated_by' => $request->user()->id,
        ]);

        return $this->exito('Oferta actualizada.');
    }

    public function destroy(OfertaEmpleo $oferta): RedirectResponse
    {
        Gate::authorize('gestionar', $oferta);

        $oferta->delete();

        return $this->exito('Oferta eliminada.');
    }
}
