<?php

namespace App\Models;

use App\Enums\EstadoComentario;
use Carbon\CarbonInterface;
use Database\Factories\ComentarioFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * Comentario de un visitante en una noticia o actividad.
 *
 * El texto va en `contenido_texto`: `contenido` ya es el nombre de la relación
 * polimórfica con la noticia o actividad comentada.
 *
 * Solo los datos que escribe el visitante son asignables en bloque; el estado
 * y la revisión los decide el panel.
 *
 * @property int $id
 * @property string $contenido_type
 * @property int $contenido_id
 * @property string $nombre
 * @property string $correo
 * @property string|null $web
 * @property string $contenido_texto
 * @property EstadoComentario $estado
 * @property string|null $ip
 * @property int|null $revisado_por
 * @property CarbonInterface|null $revisado_en
 * @property-read Noticia|Actividad|null $contenido
 */
class Comentario extends Model
{
    /** @use HasFactory<ComentarioFactory> */
    use HasFactory;

    protected $table = 'comentarios';

    protected $fillable = [
        'nombre',
        'correo',
        'web',
        'contenido_texto',
    ];

    protected $attributes = [
        'estado' => 'pendiente',
    ];

    protected function casts(): array
    {
        return [
            'estado' => EstadoComentario::class,
            'revisado_en' => 'datetime',
        ];
    }

    /**
     * @return MorphTo<Model, $this>
     */
    public function contenido(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function revisor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'revisado_por');
    }

    /**
     * @param  Builder<$this>  $query
     */
    public function scopeAprobados(Builder $query): void
    {
        $query->where('estado', EstadoComentario::Aprobado);
    }
}
