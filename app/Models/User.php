<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\Rol as RolEnum;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int|null $rol_id
 * @property string $name
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property bool $activo
 * @property Carbon|null $ultimo_acceso
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property int|null $socio_id
 * @property-read Rol|null $rol
 * @property-read Socio|null $socio
 */
#[Fillable(['name', 'email', 'password', 'rol_id', 'socio_id', 'activo'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, SoftDeletes;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'activo' => 'boolean',
            'ultimo_acceso' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Rol, $this>
     */
    public function rol(): BelongsTo
    {
        return $this->belongsTo(Rol::class, 'rol_id');
    }

    /**
     * Socio en cuyo nombre actúa una cuenta de empresa.
     *
     * @return BelongsTo<Socio, $this>
     */
    public function socio(): BelongsTo
    {
        return $this->belongsTo(Socio::class);
    }

    /**
     * Rol del usuario como enum, o null si no tiene uno reconocido.
     */
    public function rolEnum(): ?RolEnum
    {
        return $this->rol?->aEnum();
    }

    /**
     * Determina si el usuario es administrador.
     */
    public function esAdmin(): bool
    {
        return $this->rolEnum() === RolEnum::Administrador;
    }

    /**
     * Determina si el usuario puede entrar al panel de administración.
     *
     * Una cuenta desactivada nunca entra, tenga el rol que tenga.
     */
    public function accedeAlPanel(): bool
    {
        return $this->activo && ($this->rolEnum()?->accedeAlPanel() ?? false);
    }

    /**
     * Determina si el usuario puede entrar al portal de empresas.
     *
     * Además del rol hace falta un socio asignado: sin él no habría en nombre
     * de quién publicar.
     */
    public function accedeAlPortalDeEmpresas(): bool
    {
        return $this->activo
            && $this->socio_id !== null
            && ($this->rolEnum()?->accedeAlPortalDeEmpresas() ?? false);
    }
}
