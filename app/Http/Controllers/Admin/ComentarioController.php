<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\NotificaAlPanel;
use App\Enums\EstadoComentario;
use App\Http\Controllers\Controller;
use App\Models\Actividad;
use App\Models\Comentario;
use App\Models\Noticia;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Moderación de los comentarios de noticias y actividades.
 */
class ComentarioController extends Controller
{
    use NotificaAlPanel;

    public function index(Request $request): Response
    {
        $comentarios = Comentario::query()
            ->with('contenido', 'revisor:id,name')
            ->when($request->filled('buscar'), function ($consulta) use ($request) {
                $termino = '%'.$request->string('buscar')->trim().'%';

                $consulta->where(fn ($q) => $q
                    ->where('nombre', 'ilike', $termino)
                    ->orWhere('correo', 'ilike', $termino)
                    ->orWhere('contenido_texto', 'ilike', $termino));
            })
            ->when($request->filled('estado'), fn ($consulta) => $consulta->where('estado', $request->string('estado')))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Comentarios/Index', [
            'comentarios' => $comentarios->through(fn (Comentario $comentario) => [
                'id' => $comentario->id,
                'nombre' => $comentario->nombre,
                'correo' => $comentario->correo,
                'web' => $comentario->web,
                'texto' => $comentario->contenido_texto,
                'estado' => $comentario->estado->value,
                'fecha' => $comentario->created_at?->format('Y-m-d H:i'),
                'ip' => $comentario->ip,
                'revisor' => $comentario->revisor?->name,
                'en' => $this->publicacion($comentario),
            ]),
            'estados' => EstadoComentario::opciones(),
            'pendientes' => Comentario::where('estado', EstadoComentario::Pendiente)->count(),
            'filtros' => $request->only('buscar', 'estado'),
        ]);
    }

    /**
     * Aprobar o rechazar. Queda registrado quién lo decidió y cuándo.
     */
    public function update(Request $request, Comentario $comentario): RedirectResponse
    {
        $datos = $request->validate([
            'estado' => ['required', Rule::enum(EstadoComentario::class)],
        ]);

        $comentario->forceFill([
            'estado' => $datos['estado'],
            'revisado_por' => $request->user()->id,
            'revisado_en' => now(),
        ])->save();

        return $this->exito(match ($comentario->estado) {
            EstadoComentario::Aprobado => 'Comentario aprobado: ya se ve en el sitio.',
            EstadoComentario::Rechazado => 'Comentario rechazado.',
            EstadoComentario::Pendiente => 'Comentario devuelto a pendientes.',
        });
    }

    public function destroy(Comentario $comentario): RedirectResponse
    {
        $comentario->delete();

        return $this->exito('Comentario eliminado.');
    }

    /**
     * Noticia o actividad comentada, o null si ya no existe.
     *
     * @return array{tipo: string, titulo: string, url: string}|null
     */
    private function publicacion(Comentario $comentario): ?array
    {
        $contenido = $comentario->contenido;

        return match (true) {
            $contenido instanceof Noticia => [
                'tipo' => 'Noticia',
                'titulo' => $contenido->titulo,
                'url' => route('noticias.show', $contenido->slug),
            ],
            $contenido instanceof Actividad => [
                'tipo' => 'Actividad',
                'titulo' => $contenido->titulo,
                'url' => url('/actividades/'.$contenido->id),
            ],
            default => null,
        };
    }
}
