<?php

// app/Models/ActividadSeccion.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActividadSeccion extends Model
{
    protected $table = 'actividad_secciones';

    protected $fillable = [
        'actividad_id',
        'titulo',
        'contenido',
        'orden',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'orden' => 'integer',
    ];

    public function actividad()
    {
        return $this->belongsTo(Actividad::class);
    }
}
