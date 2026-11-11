<?php

namespace App\Concerns;

use App\Models\MeGusta;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\MorphMany;

/**
 * Contenido público al que los visitantes pueden darle «me gusta».
 */
trait RecibeMeGusta
{
    /**
     * @return MorphMany<MeGusta, $this>
     */
    public function meGusta(): MorphMany
    {
        return $this->morphMany(MeGusta::class, 'contenido');
    }

    /**
     * Añade `me_gusta_count` y `le_gusta` (si a este visitante ya le gusta).
     *
     * @param  Builder<static>  $query
     */
    public function scopeConMeGusta(Builder $query, ?string $huella): void
    {
        $query->withCount('meGusta')
            ->withExists(['meGusta as le_gusta' => fn (Builder $consulta) => $consulta
                // Sin cookie todavía no ha marcado nada: la condición no casa nunca.
                ->where('visitante', $huella ?? '')]);
    }
}
