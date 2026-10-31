<?php

// app/Models/PaginaSeccion.php

namespace App\Models;

use Database\Factories\PaginaSeccionFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Una sección del borrador de una página: un bloque del registro con sus
 * datos y sus ajustes de presentación.
 *
 * @property int $id
 * @property int $pagina_id
 * @property string $bloque
 * @property string|null $nombre
 * @property int $orden
 * @property bool $es_visible
 * @property array<string, mixed> $datos
 * @property array<string, mixed> $estilos
 */
class PaginaSeccion extends Model
{
    /** @use HasFactory<PaginaSeccionFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'pagina_secciones';

    protected $fillable = [
        'pagina_id',
        'bloque',
        'nombre',
        'orden',
        'es_visible',
        'datos',
        'estilos',
    ];

    protected $casts = [
        'es_visible' => 'boolean',
        'orden' => 'integer',
        'datos' => 'array',
        'estilos' => 'array',
    ];

    protected $attributes = [
        'datos' => '{}',
        'estilos' => '{}',
    ];

    /**
     * @return BelongsTo<Pagina, $this>
     */
    public function pagina(): BelongsTo
    {
        return $this->belongsTo(Pagina::class);
    }

    /**
     * @param  Builder<$this>  $query
     */
    public function scopeVisibles(Builder $query): void
    {
        $query->where('es_visible', true);
    }

    /**
     * @param  Builder<$this>  $query
     */
    public function scopeOrdenadas(Builder $query): void
    {
        $query->orderBy('orden')->orderBy('id');
    }

    /**
     * Forma con la que viaja al cliente, tanto al editor como al público.
     *
     * @return array<string, mixed>
     */
    public function aArray(): array
    {
        return [
            'id' => $this->id,
            'bloque' => $this->bloque,
            'nombre' => $this->nombre,
            'orden' => $this->orden,
            'es_visible' => $this->es_visible,
            'datos' => $this->datos ?? [],
            'estilos' => $this->estilos ?? [],
        ];
    }
}
