<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Mensaje enviado desde el formulario «Conéctate con nosotros».
 *
 * Solo los datos que escribe el visitante son asignables en bloque. El estado
 * y la gestión interna (comentarios, quién lo atendió y cuándo) los fija el
 * equipo desde el panel, nunca el formulario público.
 *
 * @property int $id
 * @property string $necesidad
 * @property string $nombre
 * @property string|null $empresa
 * @property string $correo_electronico
 * @property string|null $telefono
 * @property bool $acepta_privacidad
 * @property string $estado
 */
class MensajeContacto extends Model
{
    use SoftDeletes;

    public const ESTADO_NUEVO = 'nuevo';

    protected $table = 'mensajes_contacto';

    protected $fillable = [
        'necesidad',
        'nombre',
        'empresa',
        'correo_electronico',
        'telefono',
        'acepta_privacidad',
    ];

    protected $attributes = [
        'estado' => self::ESTADO_NUEVO,
    ];

    protected $casts = [
        'acepta_privacidad' => 'boolean',
        'fecha_atencion' => 'datetime',
    ];

    /**
     * @return BelongsTo<User, $this>
     */
    public function atendidoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'atendido_por');
    }
}
