<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\NotificaAlPanel;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\GuardarRedCamaraRequest;
use App\Models\RedCamara;
use App\Support\Archivo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Red de cámaras: otras cámaras de comercio con las que se relaciona la
 * Cámara, con su logo y su sitio web.
 */
class RedCamaraController extends Controller
{
    use NotificaAlPanel;

    public function index(Request $request): Response
    {
        $camaras = RedCamara::query()
            ->when($request->filled('buscar'), function ($consulta) use ($request) {
                $termino = '%'.$request->string('buscar')->trim().'%';

                $consulta->where(fn ($q) => $q
                    ->where('nombre', 'ilike', $termino)
                    ->orWhere('pais', 'ilike', $termino)
                    ->orWhere('ciudad', 'ilike', $termino));
            })
            ->ordenados()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/RedCamaras/Index', [
            'camaras' => $camaras->through(fn (RedCamara $camara) => [
                'id' => $camara->id,
                'nombre' => $camara->nombre,
                'pais' => $camara->pais,
                'ciudad' => $camara->ciudad,
                'direccion' => $camara->direccion,
                'telefono' => $camara->telefono,
                'correo' => $camara->correo,
                'pagina_web' => $camara->pagina_web,
                'logo' => $camara->logo,
                'logo_url' => Archivo::url($camara->logo),
                'orden' => $camara->orden,
                'activo' => $camara->activo,
            ]),
            'filtros' => $request->only('buscar'),
        ]);
    }

    public function store(GuardarRedCamaraRequest $request): RedirectResponse
    {
        RedCamara::create([
            ...$request->validated(),
            'created_by' => $request->user()->id,
            'updated_by' => $request->user()->id,
        ]);

        return $this->exito('Cámara añadida a la red.');
    }

    public function update(GuardarRedCamaraRequest $request, RedCamara $camara): RedirectResponse
    {
        $camara->update([
            ...$request->validated(),
            'updated_by' => $request->user()->id,
        ]);

        return $this->exito('Cámara actualizada.');
    }

    public function destroy(RedCamara $camara): RedirectResponse
    {
        $camara->delete();

        return $this->exito('Cámara eliminada de la red.');
    }
}
