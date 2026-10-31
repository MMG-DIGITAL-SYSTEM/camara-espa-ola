<?php

// app/Models/CategoriaPatrocinador.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CategoriaPatrocinador extends Model
{
    protected $table = 'categoriaspatrocinadores';

    protected $fillable = ['nombre'];

    public $timestamps = false;

    public function patrocinadores()
    {
        return $this->hasMany(Patrocinador::class, 'categoria_id');
    }
}
