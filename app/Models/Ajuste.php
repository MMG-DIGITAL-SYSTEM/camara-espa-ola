<?php

// app/Models/Ajuste.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

/**
 * Ajuste suelto del sitio (datos de contacto, redes, SEO por defecto).
 *
 * @property string $clave
 * @property string|null $valor
 */
class Ajuste extends Model
{
    /** La clave es el identificador; no hay id autoincremental. */
    protected $primaryKey = 'clave';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $table = 'ajustes';

    protected $fillable = ['clave', 'valor'];

    private const CACHE = 'ajustes.todos';

    /**
     * Todos los ajustes como mapa clave → valor.
     *
     * Se cachea porque se comparte en cada petición del sitio público.
     *
     * @return array<string, string|null>
     */
    public static function todos(): array
    {
        return Cache::rememberForever(
            self::CACHE,
            fn () => self::pluck('valor', 'clave')->all(),
        );
    }

    public static function valor(string $clave, ?string $porDefecto = null): ?string
    {
        return self::todos()[$clave] ?? $porDefecto;
    }

    /**
     * @param  array<string, string|null>  $valores
     */
    public static function guardar(array $valores): void
    {
        foreach ($valores as $clave => $valor) {
            self::updateOrCreate(['clave' => $clave], ['valor' => $valor]);
        }

        Cache::forget(self::CACHE);
    }
}
