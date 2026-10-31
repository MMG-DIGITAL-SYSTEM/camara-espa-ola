<?php

// app/Models/PaginaVersion.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Instantánea del borrador en el momento de publicar. Es lo que lee el
 * público, y lo que permite volver atrás sin recuperar nada a mano.
 *
 * @property int $id
 * @property int $pagina_id
 * @property array<int, array<string, mixed>> $snapshot
 * @property string|null $etiqueta
 */
class PaginaVersion extends Model
{
    protected $table = 'pagina_versiones';

    /** Solo se registra la fecha de creación: una versión nunca se modifica. */
    public const UPDATED_AT = null;

    protected $fillable = [
        'pagina_id',
        'snapshot',
        'etiqueta',
        'created_by',
    ];

    protected $casts = [
        'snapshot' => 'array',
        'created_at' => 'datetime',
    ];

    /**
     * @return BelongsTo<Pagina, $this>
     */
    public function pagina(): BelongsTo
    {
        return $this->belongsTo(Pagina::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function autor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Secciones visibles de la instantánea, ya ordenadas.
     *
     * @return array<int, array<string, mixed>>
     */
    public function seccionesVisibles(): array
    {
        $secciones = array_filter(
            $this->snapshot ?? [],
            fn (array $seccion): bool => $seccion['es_visible'] ?? true,
        );

        usort($secciones, fn (array $a, array $b): int => ($a['orden'] ?? 0) <=> ($b['orden'] ?? 0));

        return array_values($secciones);
    }
}
