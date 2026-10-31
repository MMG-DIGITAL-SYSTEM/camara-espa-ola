<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Oficina de la Cámara que se muestra en la página de contacto.
 *
 * @property int $id
 * @property string $nombre
 * @property string $ciudad
 * @property string $direccion
 * @property string|null $referencia
 * @property string|null $edificio
 * @property string|null $piso
 * @property string|null $oficina
 * @property string|null $telefono
 * @property string|null $correo_electronico
 * @property string|null $responsable_nombre
 * @property string|null $responsable_cargo
 * @property float|null $latitud
 * @property float|null $longitud
 * @property string|null $mapa_url
 */
class Oficina extends Model
{
    use SoftDeletes;

    protected $table = 'oficinas';

    protected $fillable = [
        'nombre',
        'ciudad',
        'direccion',
        'referencia',
        'edificio',
        'piso',
        'oficina',
        'telefono',
        'correo_electronico',
        'responsable_nombre',
        'responsable_cargo',
        'latitud',
        'longitud',
        'mapa_url',
        'orden',
        'activo',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'latitud' => 'float',
        'longitud' => 'float',
        'orden' => 'integer',
        'activo' => 'boolean',
    ];

    /**
     * @param  Builder<$this>  $query
     */
    public function scopeActivas(Builder $query): void
    {
        $query->where('activo', true);
    }

    /**
     * @param  Builder<$this>  $query
     */
    public function scopeOrdenadas(Builder $query): void
    {
        $query->orderBy('orden')->orderBy('id');
    }

    /**
     * Dirección que se incrusta en el iframe del mapa, sin API de pago.
     *
     * Manda la URL de incrustar pegada desde Google Maps; si no la hay, se
     * genera a partir de las coordenadas y, en último caso, de la dirección.
     * Solo se aceptan URLs de incrustar de Google: el iframe no debe poder
     * cargar cualquier sitio que alguien escriba en el campo.
     */
    public function urlDelMapa(): ?string
    {
        $mapaUrl = trim((string) $this->mapa_url);

        if (preg_match('#^https://(www\.)?google\.[a-z.]+/maps/embed\?#i', $mapaUrl)) {
            return $mapaUrl;
        }

        $consulta = $this->latitud !== null && $this->longitud !== null
            ? $this->latitud.','.$this->longitud
            : trim($this->direccion.', '.$this->ciudad, ', ');

        if ($consulta === '') {
            return null;
        }

        return 'https://maps.google.com/maps?'.http_build_query([
            'q' => $consulta,
            'z' => 16,
            'output' => 'embed',
        ]);
    }
}
