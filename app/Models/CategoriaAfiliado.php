<?php

// app/Models/CategoriaAfiliado.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CategoriaAfiliado extends Model
{
    protected $table = 'categorias_afiliados';

    protected $fillable = ['nombre'];

    public $timestamps = false;

    public function socios()
    {
        return $this->hasMany(Socio::class, 'categoria_id');
    }
}
