<?php

// app/Models/Medio.php

namespace App\Models;

use App\Support\Archivo;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

/**
 * Archivo de la biblioteca de medios, reutilizable desde cualquier bloque.
 *
 * @property int $id
 * @property string $disco
 * @property string $ruta
 * @property string $nombre_original
 * @property string $mime
 * @property int $tamano
 */
class Medio extends Model
{
    protected $table = 'medios';

    protected $fillable = [
        'disco',
        'ruta',
        'nombre_original',
        'mime',
        'tamano',
        'ancho',
        'alto',
        'alt',
        'created_by',
    ];

    protected $casts = [
        'tamano' => 'integer',
        'ancho' => 'integer',
        'alto' => 'integer',
    ];

    /**
     * @return BelongsTo<User, $this>
     */
    public function creador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Los archivos del disco público se sirven con el host de la petición,
     * no con APP_URL: así la biblioteca funciona aunque APP_URL no coincida
     * con el dominio por el que se entra.
     */
    public function url(): string
    {
        if ($this->disco === 'public') {
            return (string) Archivo::url($this->ruta);
        }

        return Storage::disk($this->disco)->url($this->ruta);
    }

    public function esImagen(): bool
    {
        return str_starts_with($this->mime, 'image/');
    }

    /**
     * @return array<string, mixed>
     */
    public function aArray(): array
    {
        return [
            'id' => $this->id,
            'url' => $this->url(),
            'nombre' => $this->nombre_original,
            'mime' => $this->mime,
            'tamano' => $this->tamano,
            'ancho' => $this->ancho,
            'alto' => $this->alto,
            'alt' => $this->alt,
            'es_imagen' => $this->esImagen(),
        ];
    }
}
