<?php

// app/Models/Patrocinador.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Patrocinador extends Model
{
    use SoftDeletes;

    protected $table = 'patrocinadores';

    protected $fillable = [
        'nombre_patrocinador',
        'descripcion',
        'imagen',
        'nombre_contacto',
        'telefono1',
        'telefono2',
        'correo_electronico',
        'direccion',
        'categoria_id',
        'estado_id',
        'created_by',
        'updated_by',
    ];

    public function categoria()
    {
        return $this->belongsTo(CategoriaPatrocinador::class, 'categoria_id');
    }

    public function estado()
    {
        return $this->belongsTo(EstadoComercial::class, 'estado_id');
    }

    public function actividades()
    {
        return $this->belongsToMany(Actividad::class, 'actividades_patrocinadores')
            // El pivote solo tiene created_at, y lo rellena la base con
            // useCurrent(): pedir withTimestamps() haría que toda consulta
            // seleccionara un updated_at que no existe.
            ->withPivot('monto_patrocinio', 'created_at');
    }
}
