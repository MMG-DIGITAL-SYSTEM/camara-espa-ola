<?php

// app/Models/ContactoAfiliado.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ContactoAfiliado extends Model
{
    use SoftDeletes;

    protected $table = 'contactos_afiliados';

    protected $fillable = [
        'socio_id',
        'nombre',
        'cargo',
        'telefono',
        'correo_electronico',
        'orden',
        'activo',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'orden' => 'integer',
    ];

    public function socio()
    {
        return $this->belongsTo(Socio::class);
    }

    public function creador()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function actualizador()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
