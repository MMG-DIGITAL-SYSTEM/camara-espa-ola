<?php

namespace App\Models;

use App\Enums\EstadoSolicitudAfiliacion;
use Carbon\CarbonImmutable;
use Database\Factories\SolicitudAfiliacionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Solicitud enviada desde el formulario público de afiliación.
 *
 * Es solo eso, una solicitud: no crea ningún socio ni cuenta. Solo los datos
 * que escribe la empresa son asignables en bloque; el estado, la revisión y
 * el socio al que acabe vinculada los gestiona la Cámara.
 *
 * @property int $id
 * @property string $nombre_razon_social
 * @property string $representante_legal
 * @property string|null $escritura_constitucion
 * @property CarbonImmutable|null $fecha
 * @property string|null $nit
 * @property string $direccion
 * @property string|null $ciudad
 * @property string $telefono
 * @property string|null $fax
 * @property string|null $casilla
 * @property string $correo_electronico
 * @property string|null $pagina_web
 * @property string $representante_camara
 * @property string|null $cargo
 * @property string|null $servicios_productos
 * @property EstadoSolicitudAfiliacion $estado
 * @property string|null $comentarios
 * @property int|null $revisado_por
 * @property CarbonImmutable|null $fecha_revision
 * @property int|null $socio_id
 * @property-read User|null $revisor
 * @property-read Socio|null $socio
 */
class SolicitudAfiliacion extends Model
{
    /** @use HasFactory<SolicitudAfiliacionFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'solicitudes_afiliacion';

    protected $fillable = [
        'nombre_razon_social',
        'representante_legal',
        'escritura_constitucion',
        'fecha',
        'nit',
        'direccion',
        'ciudad',
        'telefono',
        'fax',
        'casilla',
        'correo_electronico',
        'pagina_web',
        'representante_camara',
        'cargo',
        'servicios_productos',
    ];

    protected $attributes = [
        'estado' => 'pendiente',
    ];

    protected $casts = [
        'estado' => EstadoSolicitudAfiliacion::class,
        'fecha' => 'date',
        'fecha_revision' => 'datetime',
    ];

    /**
     * @return BelongsTo<User, $this>
     */
    public function revisor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'revisado_por');
    }

    /**
     * Socio creado a partir de la solicitud, una vez aprobada.
     *
     * @return BelongsTo<Socio, $this>
     */
    public function socio(): BelongsTo
    {
        return $this->belongsTo(Socio::class);
    }
}
