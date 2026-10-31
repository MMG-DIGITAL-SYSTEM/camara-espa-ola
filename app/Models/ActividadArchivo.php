<?php

// app/Models/ActividadArchivo.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActividadArchivo extends Model
{
    protected $table = 'actividad_archivos';

    protected $fillable = [
        'actividad_id',
        'nombre',
        'archivo_url',
        'tipo',
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
