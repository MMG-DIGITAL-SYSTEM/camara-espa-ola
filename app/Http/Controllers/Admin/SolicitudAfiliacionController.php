<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\NotificaAlPanel;
use App\Enums\EstadoSolicitudAfiliacion;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RevisarSolicitudAfiliacionRequest;
use App\Models\EstadoComercial;
use App\Models\Socio;
use App\Models\SolicitudAfiliacion;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Bandeja de las solicitudes que llegan desde el formulario público de
 * afiliación. La Cámara las revisa y, al aprobar una, nace el socio.
 */
class SolicitudAfiliacionController extends Controller
{
    use NotificaAlPanel;

    public function index(Request $request): Response
    {
        $solicitudes = SolicitudAfiliacion::query()
            ->when($request->filled('buscar'), function ($consulta) use ($request) {
                $termino = '%'.$request->string('buscar')->trim().'%';

                $consulta->where(fn ($q) => $q
                    ->where('nombre_razon_social', 'ilike', $termino)
                    ->orWhere('nit', 'ilike', $termino)
                    ->orWhere('correo_electronico', 'ilike', $termino));
            })
            ->when($request->filled('estado'), fn ($consulta) => $consulta->where('estado', $request->string('estado')))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Solicitudes/Index', [
            'solicitudes' => $solicitudes->through(fn (SolicitudAfiliacion $solicitud) => [
                'id' => $solicitud->id,
                'empresa' => $solicitud->nombre_razon_social,
                'nit' => $solicitud->nit,
                'correo' => $solicitud->correo_electronico,
                'ciudad' => $solicitud->ciudad,
                'estado' => $solicitud->estado->value,
                'recibida' => $solicitud->created_at?->format('Y-m-d H:i'),
            ]),
            'estados' => EstadoSolicitudAfiliacion::opciones(),
            'pendientes' => SolicitudAfiliacion::where('estado', EstadoSolicitudAfiliacion::Pendiente)->count(),
            'filtros' => $request->only('buscar', 'estado'),
        ]);
    }

    /**
     * Ficha completa para el panel de revisión.
     */
    public function show(SolicitudAfiliacion $solicitud): JsonResponse
    {
        $solicitud->load('revisor:id,name', 'socio:id,nombre,slug');

        return response()->json([
            'id' => $solicitud->id,
            'nombre_razon_social' => $solicitud->nombre_razon_social,
            'representante_legal' => $solicitud->representante_legal,
            'escritura_constitucion' => $solicitud->escritura_constitucion,
            'fecha' => $solicitud->fecha?->format('Y-m-d'),
            'nit' => $solicitud->nit,
            'direccion' => $solicitud->direccion,
            'ciudad' => $solicitud->ciudad,
            'telefono' => $solicitud->telefono,
            'fax' => $solicitud->fax,
            'casilla' => $solicitud->casilla,
            'correo_electronico' => $solicitud->correo_electronico,
            'pagina_web' => $solicitud->pagina_web,
            'representante_camara' => $solicitud->representante_camara,
            'cargo' => $solicitud->cargo,
            'servicios_productos' => $solicitud->servicios_productos,
            'estado' => $solicitud->estado->value,
            'comentarios' => $solicitud->comentarios,
            'recibida' => $solicitud->created_at?->format('Y-m-d H:i'),
            'revisor' => $solicitud->revisor?->name,
            'fecha_revision' => $solicitud->fecha_revision?->format('Y-m-d H:i'),
            'socio' => $solicitud->socio ? [
                'id' => $solicitud->socio->id,
                'nombre' => $solicitud->socio->nombre,
                'url' => route('socios.show', $solicitud->socio->slug),
            ] : null,
        ]);
    }

    /**
     * Cambia el estado y guarda la nota interna. Una solicitud aprobada ya
     * tiene su socio: no se puede volver atrás desde aquí.
     */
    public function update(RevisarSolicitudAfiliacionRequest $request, SolicitudAfiliacion $solicitud): RedirectResponse
    {
        if ($solicitud->estado === EstadoSolicitudAfiliacion::Aprobada) {
            return $this->error('La solicitud ya fue aprobada y tiene su socio.');
        }

        $datos = $request->validated();

        $solicitud->forceFill([
            'estado' => $datos['estado'],
            'comentarios' => $datos['comentarios'] ?? null,
            ...$this->firmaDeRevision($request->user()),
        ])->save();

        return $this->exito('Solicitud actualizada.');
    }

    /**
     * Aprueba la solicitud y da de alta al socio con los datos del formulario,
     * activo desde hoy. El socio queda listo para completarlo en «Socios».
     */
    public function aprobar(Request $request, SolicitudAfiliacion $solicitud): RedirectResponse
    {
        if ($solicitud->estado === EstadoSolicitudAfiliacion::Aprobada || $solicitud->socio_id !== null) {
            return $this->error('La solicitud ya fue aprobada.');
        }

        $datos = $request->validate([
            'comentarios' => ['nullable', 'string', 'max:5000'],
        ]);

        $usuario = $request->user();

        $socio = DB::transaction(function () use ($solicitud, $usuario, $datos): Socio {
            $socio = Socio::create([
                'nombre' => $solicitud->nombre_razon_social,
                'slug' => $this->slugLibre($solicitud->nombre_razon_social),
                'nit' => $solicitud->nit,
                'descripcion' => $solicitud->servicios_productos,
                'sitio_web' => filter_var($solicitud->pagina_web, FILTER_VALIDATE_URL) ? $solicitud->pagina_web : null,
                'nombre_contacto' => $solicitud->representante_camara,
                'telefono1' => $solicitud->telefono,
                'correo_electronico' => $solicitud->correo_electronico,
                'direccion' => collect([$solicitud->direccion, $solicitud->ciudad])->filter()->implode(', '),
                'estado_id' => EstadoComercial::where('nombre', 'Activo')->value('id'),
                'fecha_afiliacion' => today(),
                'destacado' => false,
                'orden' => 0,
                'created_by' => $usuario->id,
                'updated_by' => $usuario->id,
            ]);

            $socio->todosLosContactos()->create([
                'nombre' => $solicitud->representante_camara,
                'cargo' => $solicitud->cargo,
                'telefono' => $solicitud->telefono,
                'correo_electronico' => $solicitud->correo_electronico,
                'orden' => 0,
                'activo' => true,
                'created_by' => $usuario->id,
                'updated_by' => $usuario->id,
            ]);

            $solicitud->forceFill([
                'estado' => EstadoSolicitudAfiliacion::Aprobada,
                'comentarios' => $datos['comentarios'] ?? $solicitud->comentarios,
                'socio_id' => $socio->id,
                ...$this->firmaDeRevision($usuario),
            ])->save();

            return $socio;
        });

        return $this->exito("Solicitud aprobada: «{$socio->nombre}» ya es socio.");
    }

    public function destroy(SolicitudAfiliacion $solicitud): RedirectResponse
    {
        $solicitud->delete();

        return $this->exito('Solicitud eliminada.');
    }

    /**
     * @return array{revisado_por: int, fecha_revision: Carbon}
     */
    private function firmaDeRevision(User $usuario): array
    {
        return [
            'revisado_por' => $usuario->id,
            'fecha_revision' => now(),
        ];
    }

    /**
     * El índice único de `socios.slug` también cubre a los borrados: se busca
     * el primer sufijo libre entre todos.
     */
    private function slugLibre(string $nombre): string
    {
        $base = Str::slug($nombre) ?: 'socio';
        $slug = $base;
        $sufijo = 2;

        while (Socio::withTrashed()->where('slug', $slug)->exists()) {
            $slug = $base.'-'.$sufijo++;
        }

        return $slug;
    }
}
