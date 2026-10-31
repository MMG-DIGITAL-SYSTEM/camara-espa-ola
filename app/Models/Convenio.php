<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Convenio publicado en la página de Convenios.
 *
 * `imagen` y `pdf` son rutas del disco `public`: los textos promocionales van
 * dentro de la imagen, así que aquí no se guardan.
 *
 * @property int $id
 * @property string $nombre
 * @property string $descripcion
 * @property string|null $imagen
 * @property string|null $correo_electronico
 * @property string|null $pdf
 * @property int $orden
 * @property bool $activo
 */
class Convenio extends Model
{
    use SoftDeletes;

    protected $table = 'convenios';

    protected $fillable = [
        'nombre',
        'descripcion',
        'imagen',
        'correo_electronico',
        'pdf',
        'orden',
        'activo',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'orden' => 'integer',
        'activo' => 'boolean',
    ];

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
    public function scopeOrdenados(Builder $query): void
    {
        $query->orderBy('orden')->orderBy('id');
    }
}
