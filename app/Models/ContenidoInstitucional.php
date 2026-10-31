<?php

// app/Models/ContenidoInstitucional.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ContenidoInstitucional extends Model
{
    use SoftDeletes;

    protected $table = 'contenido_institucional';

    protected $fillable = [
        'seccion',
        'titulo',
        'contenido',
        'imagen',
        'pdf',
        'orden',
        'activo',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'orden' => 'integer',
    ];

    // Relaciones
    public function creador()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function actualizador()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Scopes
    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }

    public function scopePorSeccion($query, $seccion)
    {
        return $query->where('seccion', $seccion);
    }

    public function scopeOrdenados($query)
    {
        return $query->orderBy('orden')->orderBy('titulo');
    }
}
