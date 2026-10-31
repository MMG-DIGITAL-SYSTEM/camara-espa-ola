<?php

// app/Models/MenuItem.php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Una entrada del menú del sitio.
 *
 * Sustituye al antiguo `resources/js/config/navigation.ts`, que estaba escrito
 * a mano y con todos los enlaces apuntando a «#».
 *
 * @property int $id
 * @property string $ubicacion
 * @property string $titulo
 * @property string|null $url
 */
class MenuItem extends Model
{
    public const PRINCIPAL = 'principal';

    public const PIE = 'pie';

    protected $table = 'menu_items';

    protected $fillable = [
        'ubicacion',
        'titulo',
        'url',
        'padre_id',
        'orden',
        'activo',
        'nueva_pestana',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'nueva_pestana' => 'boolean',
        'orden' => 'integer',
    ];

    /**
     * @return BelongsTo<MenuItem, $this>
     */
    public function padre(): BelongsTo
    {
        return $this->belongsTo(self::class, 'padre_id');
    }

    /**
     * @return HasMany<MenuItem, $this>
     */
    public function hijos(): HasMany
    {
        return $this->hasMany(self::class, 'padre_id')->activos()->ordenados();
    }

    /**
     * @param  Builder<$this>  $query
     */
    public function scopeActivos(Builder $query): void
    {
        $query->where('activo', true);
    }

    /**
     * @param  Builder<$this>  $query
     */
    public function scopeOrdenados(Builder $query): void
    {
        $query->orderBy('orden')->orderBy('id');
    }

    /**
     * @param  Builder<$this>  $query
     */
    public function scopeDeLaUbicacion(Builder $query, string $ubicacion): void
    {
        $query->where('ubicacion', $ubicacion);
    }

    /**
     * Árbol de un menú, listo para el cliente.
     *
     * @return array<int, array<string, mixed>>
     */
    public static function arbol(string $ubicacion): array
    {
        return self::deLaUbicacion($ubicacion)
            ->activos()
            ->whereNull('padre_id')
            ->with('hijos')
            ->ordenados()
            ->get()
            ->map(fn (self $item) => [
                'titulo' => $item->titulo,
                'url' => $item->url,
                'nueva_pestana' => $item->nueva_pestana,
                'hijos' => $item->hijos->map(fn (self $hijo) => [
                    'titulo' => $hijo->titulo,
                    'url' => $hijo->url,
                    'nueva_pestana' => $hijo->nueva_pestana,
                ])->all(),
            ])
            ->all();
    }
}
