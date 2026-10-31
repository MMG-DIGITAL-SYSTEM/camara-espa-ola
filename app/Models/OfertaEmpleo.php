<?php

namespace App\Models;

use App\Enums\EstadoOferta;
use App\Enums\JornadaLaboral;
use App\Enums\ModalidadTrabajo;
use App\Support\HtmlSeguro;
use Carbon\CarbonInterface;
use Database\Factories\OfertaEmpleoFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Oferta de la bolsa de trabajo, publicada por un socio.
 *
 * @property int $id
 * @property int $socio_id
 * @property string $titulo
 * @property string $descripcion
 * @property string|null $area
 * @property string|null $ubicacion
 * @property ModalidadTrabajo $modalidad
 * @property JornadaLaboral $jornada
 * @property string|null $salario
 * @property int $vacantes
 * @property string|null $correo_postulacion
 * @property string|null $enlace_postulacion
 * @property CarbonInterface|null $fecha_cierre
 * @property EstadoOferta $estado
 * @property CarbonInterface|null $publicada_en
 * @property-read Socio $socio
 */
class OfertaEmpleo extends Model
{
    /** @use HasFactory<OfertaEmpleoFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'ofertas_empleo';

    protected $fillable = [
        'socio_id',
        'titulo',
        'descripcion',
        'area',
        'ubicacion',
        'modalidad',
        'jornada',
        'salario',
        'vacantes',
        'correo_postulacion',
        'enlace_postulacion',
        'fecha_cierre',
        'estado',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'modalidad' => ModalidadTrabajo::class,
            'jornada' => JornadaLaboral::class,
            'estado' => EstadoOferta::class,
            'vacantes' => 'integer',
            'fecha_cierre' => 'date',
            'publicada_en' => 'datetime',
        ];
    }

    /**
     * La descripción llega de un editor enriquecido y se pinta con
     * dangerouslySetInnerHTML: se sanea aquí para que ninguna ruta se lo salte.
     * La primera publicación fija la fecha que ven los candidatos.
     */
    protected static function booted(): void
    {
        static::saving(function (OfertaEmpleo $oferta): void {
            if ($oferta->isDirty('descripcion')) {
                $oferta->descripcion = (string) HtmlSeguro::limpiar($oferta->descripcion);
            }

            if ($oferta->estado === EstadoOferta::Publicada && $oferta->publicada_en === null) {
                $oferta->publicada_en = now();
            }
        });
    }

    /**
     * @return BelongsTo<Socio, $this>
     */
    public function socio(): BelongsTo
    {
        return $this->belongsTo(Socio::class);
    }

    /**
     * Determina si la oferta se ve en el sitio público: la versión en memoria
     * de `scopeVisibles`.
     */
    public function estaVisible(): bool
    {
        return $this->estado === EstadoOferta::Publicada
            && ! $this->estaVencida()
            && ($this->socio?->estaActivo() ?? false);
    }

    /**
     * Publicada, pero con la fecha de cierre ya pasada.
     */
    public function estaVencida(): bool
    {
        return $this->fecha_cierre !== null && $this->fecha_cierre->lt(today());
    }

    /**
     * Publicadas, sin vencer y de un socio activo.
     *
     * @param  Builder<$this>  $query
     */
    public function scopeVisibles(Builder $query): void
    {
        $query->where('estado', EstadoOferta::Publicada)
            ->where(fn (Builder $consulta) => $consulta
                ->whereNull('fecha_cierre')
                ->orWhereDate('fecha_cierre', '>=', today()))
            ->whereHas('socio', fn (Builder $consulta) => $consulta->activos());
    }

    /**
     * @param  Builder<$this>  $query
     */
    public function scopeRecientes(Builder $query): void
    {
        $query->orderByDesc('publicada_en')->orderByDesc('id');
    }
}
