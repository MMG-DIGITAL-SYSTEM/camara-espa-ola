<?php

// app/Models/Visibilidad.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Visibilidad extends Model
{
    protected $table = 'visibilidad';

    protected $fillable = ['nombre'];

    public $timestamps = false;

    public function actividades()
    {
        return $this->hasMany(Actividad::class, 'visibilidad_id');
    }

    public function noticias()
    {
        return $this->hasMany(Noticia::class, 'visibilidad_id');
    }
}
