<?php

// app/Models/FichaPais.php

namespace App\Models;

use Carbon\CarbonInterface;
use Database\Factories\FichaPaisFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Ficha país: un resumen descargable en PDF sobre un mercado.
 *
 * `pdf_url` guarda la ruta del disco `public` o una URL completa (la que
 * devuelve la biblioteca de medios). Para pintarla, pásala por `Archivo::url`.
 *
 * @property int $id
 * @property string $pais
 * @property string $titulo
 * @property string|null $descripcion
 * @property string|null $pdf_url
 * @property int $orden
 * @property bool $activo
 * @property CarbonInterface|null $fecha_publicacion
 */
class FichaPais extends Model
{
    /** @use HasFactory<FichaPaisFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'fichas_pais';

    protected $fillable = [
        'pais',
        'titulo',
        'descripcion',
        'pdf_url',
        'orden',
        'activo',
        'fecha_publicacion',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'orden' => 'integer',
        'fecha_publicacion' => 'datetime',
    ];

    /**
     * @return BelongsTo<User, $this>
     */
    public function creador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function actualizador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * @param  Builder<$this>  $query
     */
    public function scopeActivos(Builder $query): void
    {
        $query->where('activo', true);
    }

    /**
     * @param  Builder<$this>  $query
     */
    public function scopePorPais(Builder $query, string $pais): void
    {
        $query->where('pais', $pais);
    }

    /**
     * @param  Builder<$this>  $query
     */
    public function scopeOrdenados(Builder $query): void
    {
        $query->orderBy('orden')->orderBy('pais');
    }
}
