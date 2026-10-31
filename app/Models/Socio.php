<?php

// app/Models/Socio.php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property string $nombre
 * @property string $slug
 * @property string|null $nit
 * @property string|null $descripcion
 * @property string|null $imagen
 * @property bool $destacado
 */
class Socio extends Model
{
    use SoftDeletes;

    protected $table = 'socios';

    protected $fillable = [
        'nombre',
        'slug',
        'nit',
        'descripcion',
        'imagen',
        'sitio_web',
        'nombre_contacto',
        'telefono1',
        'telefono2',
        'correo_electronico',
        'direccion',
        'categoria_id',
        'estado_id',
        'fecha_afiliacion',
        'destacado',
        'orden',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'fecha_afiliacion' => 'date',
        'destacado' => 'boolean',
        'orden' => 'integer',
    ];

    // ============================================================
    // RELACIONES
    // ============================================================

    /**
     * @return BelongsTo<CategoriaAfiliado, $this>
     */
    public function categoria(): BelongsTo
    {
        return $this->belongsTo(CategoriaAfiliado::class, 'categoria_id');
    }

    /**
     * @return BelongsTo<EstadoComercial, $this>
     */
    public function estado(): BelongsTo
    {
        return $this->belongsTo(EstadoComercial::class, 'estado_id');
    }

    /**
     * Contactos visibles del socio, ya ordenados.
     *
     * @return HasMany<ContactoAfiliado, $this>
     */
    public function contactos(): HasMany
    {
        return $this->hasMany(ContactoAfiliado::class)
            ->where('activo', true)
            ->orderBy('orden');
    }

    /**
     * @return HasMany<ContactoAfiliado, $this>
     */
    public function todosLosContactos(): HasMany
    {
        return $this->hasMany(ContactoAfiliado::class)->orderBy('orden');
    }

    /**
     * @return HasMany<OfertaEmpleo, $this>
     */
    public function ofertasEmpleo(): HasMany
    {
        return $this->hasMany(OfertaEmpleo::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function creador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function actualizador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Versión en memoria de `scopeActivos`.
     */
    public function estaActivo(): bool
    {
        return $this->estado?->nombre === 'Activo';
    }

    // ============================================================
    // SCOPES
    // ============================================================

    /**
     * @param  Builder<$this>  $query
     */
    public function scopeActivos(Builder $query): void
    {
        $query->whereHas('estado', fn (Builder $consulta) => $consulta->where('nombre', 'Activo'));
    }

    /**
     * @param  Builder<$this>  $query
     */
    public function scopeDestacados(Builder $query): void
    {
        $query->where('destacado', true);
    }

    /**
     * @param  Builder<$this>  $query
     */
    public function scopePorCategoria(Builder $query, int $categoriaId): void
    {
        $query->where('categoria_id', $categoriaId);
    }

    /**
     * @param  Builder<$this>  $query
     */
    public function scopeOrdenados(Builder $query): void
    {
        $query->orderBy('orden')->orderBy('nombre');
    }
}
