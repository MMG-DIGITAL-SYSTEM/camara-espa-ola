<?php

// app/Models/EstadoComercial.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EstadoComercial extends Model
{
    protected $table = 'estados_comercial';

    protected $fillable = ['nombre'];

    public $timestamps = false;

    public function socios()
    {
        return $this->hasMany(Socio::class, 'estado_id');
    }
}
