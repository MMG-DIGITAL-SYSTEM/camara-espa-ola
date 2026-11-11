<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * Un «me gusta» de un visitante anónimo a una noticia o actividad.
 *
 * @property int $id
 * @property string $contenido_type
 * @property int $contenido_id
 * @property string $visitante Huella SHA-256 de la cookie del visitante.
 */
class MeGusta extends Model
{
    protected $table = 'me_gusta';

    protected $fillable = [
        'visitante',
    ];

    /**
     * @return MorphTo<Model, $this>
     */
    public function contenido(): MorphTo
    {
        return $this->morphTo();
    }
}
