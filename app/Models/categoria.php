<?php

// app/Models/Categoria.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Categoria extends Model
{
    protected $table = 'categorias';

    protected $fillable = ['nombre'];

    // La tabla no tiene created_at/updated_at.
    public $timestamps = false;

    // Relación N:M con actividades
    public function actividades()
    {
        return $this->belongsToMany(Actividad::class, 'actividad_categoria');
    }

    // Relación N:M con noticias
    public function noticias()
    {
        return $this->belongsToMany(Noticia::class, 'noticia_categoria');
    }
}
