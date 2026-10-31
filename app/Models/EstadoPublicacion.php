<?php

// app/Models/EstadoPublicacion.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EstadoPublicacion extends Model
{
    protected $table = 'estados_publicacion';

    protected $fillable = ['nombre'];

    public $timestamps = false;

    public function actividades()
    {
        return $this->hasMany(Actividad::class, 'estado_id');
    }

    public function noticias()
    {
        return $this->hasMany(Noticia::class, 'estado_id');
    }

    public function boletines()
    {
        return $this->hasMany(Boletin::class, 'estado_id');
    }
}
