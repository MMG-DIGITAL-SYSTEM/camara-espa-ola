<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\NotificaAlPanel;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\GuardarFichaPaisRequest;
use App\Models\FichaPais;
use App\Support\Archivo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Fichas país: resúmenes de mercado que se descargan en PDF desde el sitio.
 */
class FichaPaisController extends Controller
{
    use NotificaAlPanel;

    public function index(Request $request): Response
    {
        $fichas = FichaPais::query()
            ->when($request->filled('buscar'), function ($consulta) use ($request) {
                $termino = '%'.$request->string('buscar')->trim().'%';

                $consulta->where(fn ($q) => $q
                    ->where('pais', 'ilike', $termino)
                    ->orWhere('titulo', 'ilike', $termino));
            })
            ->ordenados()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/FichasPais/Index', [
            'fichas' => $fichas->through(fn (FichaPais $ficha) => [
                'id' => $ficha->id,
                'pais' => $ficha->pais,
                'titulo' => $ficha->titulo,
                'descripcion' => $ficha->descripcion,
                'pdf_url' => $ficha->pdf_url,
                'pdf' => Archivo::url($ficha->pdf_url),
                'fecha_publicacion' => $ficha->fecha_publicacion?->format('Y-m-d'),
                'orden' => $ficha->orden,
                'activo' => $ficha->activo,
            ]),
            'filtros' => $request->only('buscar'),
        ]);
    }

    public function store(GuardarFichaPaisRequest $request): RedirectResponse
    {
        FichaPais::create([
            ...$request->validated(),
            'created_by' => $request->user()->id,
            'updated_by' => $request->user()->id,
        ]);

        return $this->exito('Ficha país creada.');
    }

    public function update(GuardarFichaPaisRequest $request, FichaPais $ficha): RedirectResponse
    {
        $ficha->update([
            ...$request->validated(),
            'updated_by' => $request->user()->id,
        ]);

        return $this->exito('Ficha país actualizada.');
    }

    public function destroy(FichaPais $ficha): RedirectResponse
    {
        $ficha->delete();

        return $this->exito('Ficha país eliminada.');
    }
}
