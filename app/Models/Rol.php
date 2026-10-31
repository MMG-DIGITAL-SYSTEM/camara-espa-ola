<?php

// app/Models/Rol.php

namespace App\Models;

use App\Enums\Rol as RolEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property string $nombre
 * @property string|null $descripcion
 */
class Rol extends Model
{
    use SoftDeletes;

    protected $table = 'roles';

    protected $fillable = [
        'nombre',
        'descripcion',
    ];

    /**
     * @return HasMany<User, $this>
     */
    public function usuarios(): HasMany
    {
        return $this->hasMany(User::class, 'rol_id');
    }

    /**
     * Versión enum del rol, o null si el nombre no corresponde a ninguno conocido.
     */
    public function aEnum(): ?RolEnum
    {
        return RolEnum::tryFrom($this->nombre);
    }

    public function esAdministrador(): bool
    {
        return $this->aEnum() === RolEnum::Administrador;
    }

    public function accedeAlPanel(): bool
    {
        return $this->aEnum()?->accedeAlPanel() ?? false;
    }
}
