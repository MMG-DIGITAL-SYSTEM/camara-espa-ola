<?php

namespace App\Concerns;

use App\Models\Comentario;
use Illuminate\Database\Eloquent\Relations\MorphMany;

/**
 * Contenido público que los visitantes pueden comentar.
 */
trait RecibeComentarios
{
    /**
     * @return MorphMany<Comentario, $this>
     */
    public function comentarios(): MorphMany
    {
        return $this->morphMany(Comentario::class, 'contenido');
    }

    /**
     * Comentarios aprobados, del más antiguo al más nuevo, con solo lo que se
     * puede publicar: el correo y la IP no salen del panel.
     *
     * @return array<int, array{id: int, nombre: string, web: string|null, texto: string, fecha: string|null}>
     */
    public function comentariosPublicos(): array
    {
        return $this->comentarios()
            ->aprobados()
            ->oldest()
            ->get()
            ->map(fn (Comentario $comentario): array => [
                'id' => $comentario->id,
                'nombre' => $comentario->nombre,
                'web' => $comentario->web,
                'texto' => $comentario->contenido_texto,
                'fecha' => $comentario->created_at?->locale('es')->isoFormat('D [de] MMMM [de] YYYY'),
            ])
            ->all();
    }
}
