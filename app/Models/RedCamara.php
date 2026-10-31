<?php

// app/Models/RedCamara.php

namespace App\Models;

use Database\Factories\RedCamaraFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Cámara de comercio de la red con la que se relaciona la Cámara.
 *
 * `logo` guarda la ruta del disco `public` o una URL completa: para pintarlo,
 * pásalo por `Archivo::url`.
 *
 * @property int $id
 * @property string $nombre
 * @property string $pais
 * @property string|null $ciudad
 * @property string|null $direccion
 * @property string|null $telefono
 * @property string|null $correo
 * @property string|null $pagina_web
 * @property string|null $logo
 * @property int $orden
 * @property bool $activo
 */
class RedCamara extends Model
{
    /** @use HasFactory<RedCamaraFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'redes_camaras';

    protected $fillable = [
        'nombre',
        'pais',
        'ciudad',
        'direccion',
        'telefono',
        'correo',
        'pagina_web',
        'logo',
        'orden',
        'activo',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'orden' => 'integer',
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
        $query->orderBy('orden')->orderBy('nombre');
    }
}
