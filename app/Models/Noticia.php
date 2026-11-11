<?php

namespace App\Models;

use App\Concerns\RecibeComentarios;
use App\Concerns\RecibeMeGusta;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Noticia extends Model
{
    use RecibeComentarios, RecibeMeGusta, SoftDeletes;

    protected $table = 'noticias';

    protected $fillable = [
        'titulo',
        'slug',
        'descripcion',
        'extracto',
        'imagen',
        'fecha_publicacion',
        'fecha_evento',
        'estado_id',
        'visibilidad_id',
        'destacada',
        'publicado_por',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'fecha_publicacion' => 'datetime',
            'fecha_evento' => 'datetime',
            'destacada' => 'boolean',
        ];
    }

    public function estado()
    {
        return $this->belongsTo(EstadoPublicacion::class, 'estado_id');
    }

    public function visibilidad()
    {
        return $this->belongsTo(Visibilidad::class, 'visibilidad_id');
    }

    public function publicador()
    {
        return $this->belongsTo(User::class, 'publicado_por');
    }

    public function actualizador()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function categorias()
    {
        return $this->belongsToMany(Categoria::class, 'noticia_categoria');
    }

    /**
     * Noticias visibles en el sitio.
     *
     * Se resuelve por nombre y no por id: los catálogos llegaron a tener
     * entradas duplicadas y dos convenciones distintas conviviendo, y unos
     * ids escritos a pelo volverían a dejar contenido invisible sin avisar.
     */
    public function scopeActivas(Builder $query): Builder
    {
        return $query
            ->whereHas('estado', fn (Builder $q) => $q->where('nombre', 'Publicada'))
            ->whereHas('visibilidad', fn (Builder $q) => $q->where('nombre', 'Pública'));
    }

    public function scopeOrdenadas(Builder $query): Builder
    {
        return $query->orderByDesc('fecha_publicacion');
    }

    public function scopePorCategoria(Builder $query, string|int $categoria): Builder
    {
        return $query->whereHas('categorias', function (Builder $query) use ($categoria): void {
            $query->where('categorias.id', $categoria)
                ->orWhere('categorias.nombre', $categoria);
        });
    }

    public function scopeDestacadas(Builder $query): Builder
    {
        return $query->where('destacada', true);
    }
}
