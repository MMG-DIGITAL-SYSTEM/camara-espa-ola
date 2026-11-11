<?php

// app/Models/Actividad.php

namespace App\Models;

use App\Concerns\RecibeComentarios;
use App\Concerns\RecibeMeGusta;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Actividad extends Model
{
    use RecibeComentarios, RecibeMeGusta, SoftDeletes;

    protected $table = 'actividades';

    protected $fillable = [
        'titulo',
        'descripcion',
        'imagen',
        'fecha_publicacion',
        'fecha_evento',
        'estado_id',
        'visibilidad_id',
        'publicado_por',
        'autor_visible',
        'updated_by',
    ];

    protected $casts = [
        'fecha_publicacion' => 'datetime',
        'fecha_evento' => 'datetime',
    ];

    // RELACIONES

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

    // Relación N:M con categorías
    public function categorias()
    {
        return $this->belongsToMany(Categoria::class, 'actividad_categoria');
    }

    // Relación con secciones
    public function secciones()
    {
        return $this->hasMany(ActividadSeccion::class)->orderBy('orden');
    }

    // Relación con archivos
    public function archivos()
    {
        return $this->hasMany(ActividadArchivo::class)->orderBy('orden');
    }

    // Relación con patrocinadores
    public function patrocinadores()
    {
        return $this->belongsToMany(Patrocinador::class, 'actividades_patrocinadores')
            // El pivote solo tiene created_at, y lo rellena la base con
            // useCurrent(): pedir withTimestamps() haría que toda consulta
            // seleccionara un updated_at que no existe.
            ->withPivot('monto_patrocinio', 'created_at');
    }

    // SCOPES

    public function scopePublicadas($query)
    {
        return $query->whereHas('estado', function ($q) {
            $q->where('nombre', 'Publicada');
        });
    }

    public function scopeActivas($query)
    {
        // Por nombre y no por id: los catálogos ya tuvieron duplicados.
        return $query->whereHas(
            'visibilidad',
            fn ($consulta) => $consulta->where('nombre', 'Pública'),
        );
    }

    public function scopeOrdenadas($query)
    {
        return $query->orderBy('fecha_publicacion', 'desc');
    }

    public function scopePorCategoria($query, $categoria)
    {
        return $query->whereHas('categorias', function ($q) use ($categoria) {
            $q->where('nombre', $categoria);
        });
    }
}
