<?php

namespace App\Http\Controllers;

use App\Concerns\DecoraConBloques;
use App\Enums\JornadaLaboral;
use App\Enums\ModalidadTrabajo;
use App\Models\OfertaEmpleo;
use App\Support\Archivo;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Bolsa de trabajo pública: las ofertas vigentes de los socios.
 *
 * Es una página de módulo, así que el encabezado y lo que rodea al listado se
 * editan desde el constructor de páginas.
 */
class BolsaTrabajoController extends Controller
{
    use DecoraConBloques;

    public function index(Request $request): Response
    {
        $filtros = $request->validate([
            'buscar' => ['nullable', 'string', 'max:100'],
            'modalidad' => ['nullable', Rule::enum(ModalidadTrabajo::class)],
            'jornada' => ['nullable', Rule::enum(JornadaLaboral::class)],
        ]);

        $ofertas = OfertaEmpleo::query()
            ->visibles()
            ->with('socio:id,nombre,slug,imagen')
            ->when($filtros['buscar'] ?? null, function ($consulta, string $buscar) {
                $termino = '%'.trim($buscar).'%';

                $consulta->where(fn ($q) => $q
                    ->where('titulo', 'ilike', $termino)
                    ->orWhere('area', 'ilike', $termino)
                    ->orWhere('ubicacion', 'ilike', $termino)
                    ->orWhereHas('socio', fn ($socio) => $socio->where('nombre', 'ilike', $termino)));
            })
            ->when($filtros['modalidad'] ?? null, fn ($consulta, string $modalidad) => $consulta->where('modalidad', $modalidad))
            ->when($filtros['jornada'] ?? null, fn ($consulta, string $jornada) => $consulta->where('jornada', $jornada))
            ->recientes()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Public/BolsaTrabajo', [
            ...$this->bloquesDelModulo($request, 'bolsa-trabajo'),
            'ofertas' => $ofertas->through(fn (OfertaEmpleo $oferta) => $this->resumen($oferta)),
            'opciones' => [
                'modalidades' => ModalidadTrabajo::opciones(),
                'jornadas' => JornadaLaboral::opciones(),
            ],
            'filtros' => $filtros,
        ]);
    }

    public function show(OfertaEmpleo $oferta): Response
    {
        abort_unless($oferta->estaVisible(), 404);

        return Inertia::render('Public/BolsaTrabajo/Show', [
            'oferta' => [
                ...$this->resumen($oferta),
                'descripcion' => $oferta->descripcion,
                'vacantes' => $oferta->vacantes,
                'correo_postulacion' => $oferta->correo_postulacion,
                'enlace_postulacion' => $oferta->enlace_postulacion,
            ],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function resumen(OfertaEmpleo $oferta): array
    {
        return [
            'id' => $oferta->id,
            'titulo' => $oferta->titulo,
            'area' => $oferta->area,
            'ubicacion' => $oferta->ubicacion,
            'modalidad' => $oferta->modalidad->etiqueta(),
            'jornada' => $oferta->jornada->etiqueta(),
            'salario' => $oferta->salario,
            'publicada' => $oferta->publicada_en?->locale('es')->diffForHumans(),
            'fecha_cierre' => $oferta->fecha_cierre?->locale('es')->isoFormat('D [de] MMMM [de] YYYY'),
            'empresa' => [
                'nombre' => $oferta->socio->nombre,
                'slug' => $oferta->socio->slug,
                'logo' => Archivo::url($oferta->socio->imagen),
            ],
        ];
    }
}
