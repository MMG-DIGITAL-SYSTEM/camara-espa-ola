<?php

// app/Models/Pagina.php

namespace App\Models;

use App\Bloques\RegistroDeBloques;
use Database\Factories\PaginaFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

/**
 * Una página del sitio construida con bloques.
 *
 * El panel edita siempre `secciones` (el borrador). Publicar congela ese
 * borrador en una `PaginaVersion` y apunta `version_publicada_id` a ella;
 * el público lee exclusivamente esa instantánea.
 *
 * @property int $id
 * @property string $slug
 * @property string $titulo
 * @property string $tipo
 * @property string|null $modulo
 * @property int|null $version_publicada_id
 * @property bool $es_sistema
 * @property-read PaginaVersion|null $versionPublicada
 */
class Pagina extends Model
{
    /** @use HasFactory<PaginaFactory> */
    use HasFactory, SoftDeletes;

    public const TIPO_LIBRE = 'libre';

    public const TIPO_MODULO = 'modulo';

    protected $table = 'paginas';

    protected $fillable = [
        'slug',
        'titulo',
        'tipo',
        'modulo',
        'seo_titulo',
        'seo_descripcion',
        'seo_imagen',
        'es_sistema',
        'orden',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'es_sistema' => 'boolean',
        'orden' => 'integer',
    ];

    protected $attributes = [
        'tipo' => self::TIPO_LIBRE,
    ];

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    // ============================================================
    // RELACIONES
    // ============================================================

    /**
     * Borrador: lo que se edita en el panel.
     *
     * @return HasMany<PaginaSeccion, $this>
     */
    public function secciones(): HasMany
    {
        return $this->hasMany(PaginaSeccion::class)->ordenadas();
    }

    /**
     * @return HasMany<PaginaVersion, $this>
     */
    public function versiones(): HasMany
    {
        return $this->hasMany(PaginaVersion::class)->latest('created_at');
    }

    /**
     * @return BelongsTo<PaginaVersion, $this>
     */
    public function versionPublicada(): BelongsTo
    {
        return $this->belongsTo(PaginaVersion::class, 'version_publicada_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function actualizador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // ============================================================
    // SCOPES
    // ============================================================

    /**
     * @param  Builder<$this>  $query
     */
    public function scopePublicadas(Builder $query): void
    {
        $query->whereNotNull('version_publicada_id');
    }

    /**
     * @param  Builder<$this>  $query
     */
    public function scopeLibres(Builder $query): void
    {
        $query->where('tipo', self::TIPO_LIBRE);
    }

    /**
     * @param  Builder<$this>  $query
     */
    public function scopeDelModulo(Builder $query, string $modulo): void
    {
        $query->where('tipo', self::TIPO_MODULO)->where('modulo', $modulo);
    }

    // ============================================================
    // PUBLICACIÓN
    // ============================================================

    /**
     * Dirección fija de cada módulo. El slug de su página («modulo-…») no la
     * sirve: solo evita que choque con la ruta.
     *
     * @var array<string, string>
     */
    private const RUTAS_DE_MODULO = [
        'noticias' => '/noticias',
        'actividades' => '/actividades',
        'socios' => '/socios',
        'servicios' => '/servicios',
        'fichas-pais' => '/fichas-pais',
        'red-camaras' => '/red-camaras',
        'la-camara' => '/la-camara',
        'contacto' => '/contacto',
        'convenios' => '/convenios',
        'formulario-afiliacion' => '/afiliate/formulario',
        'bolsa-trabajo' => '/bolsa-de-trabajo',
    ];

    /**
     * Dónde ve el público esta página.
     */
    public function urlPublica(): string
    {
        if ($this->tipo === self::TIPO_MODULO && isset(self::RUTAS_DE_MODULO[$this->modulo])) {
            return url(self::RUTAS_DE_MODULO[$this->modulo]);
        }

        return url($this->slug === 'inicio' ? '/' : '/'.$this->slug);
    }

    public function esModulo(): bool
    {
        return $this->tipo === self::TIPO_MODULO;
    }

    public function estaPublicada(): bool
    {
        return $this->version_publicada_id !== null;
    }

    /**
     * Instantánea del borrador tal y como está ahora mismo.
     *
     * @return array<int, array<string, mixed>>
     */
    public function snapshotDelBorrador(): array
    {
        return $this->secciones()
            ->get()
            ->map(fn (PaginaSeccion $seccion) => $seccion->aArray())
            ->all();
    }

    /**
     * Reemplaza el borrador entero con lo que manda el editor.
     *
     * El editor trabaja sobre el documento completo (reordenar, duplicar,
     * borrar), así que guardar sección a sección obligaría a coordinar varias
     * peticiones y a resolver conflictos de orden. Se manda todo de una vez.
     *
     * Cada sección viaja con una `clave` estable generada en el cliente. Se
     * devuelve el mapa clave → id para que el editor sepa qué id recibió cada
     * sección nueva sin tener que recargar la página ni perder el foco.
     *
     * @param  array<int, array<string, mixed>>  $secciones
     * @return array<string, int> Mapa clave → id.
     */
    public function guardarBorrador(array $secciones, ?User $autor = null): array
    {
        return DB::transaction(function () use ($secciones, $autor): array {
            $mapa = [];
            $conservados = [];

            foreach (array_values($secciones) as $orden => $seccion) {
                $atributos = [
                    'bloque' => $seccion['bloque'],
                    'nombre' => $seccion['nombre'] ?? null,
                    'orden' => $orden,
                    'es_visible' => $seccion['es_visible'] ?? true,
                    'datos' => RegistroDeBloques::sanearDatos(
                        $seccion['bloque'],
                        $seccion['datos'] ?? [],
                    ),
                    'estilos' => $seccion['estilos'] ?? [],
                ];

                $modelo = isset($seccion['id'])
                    ? $this->secciones()->whereKey($seccion['id'])->first()
                    : null;

                if ($modelo) {
                    $modelo->update($atributos);
                } else {
                    $modelo = $this->secciones()->create($atributos);
                }

                $conservados[] = $modelo->id;
                $mapa[$seccion['clave']] = $modelo->id;
            }

            // Lo que el editor ya no manda es que se borró.
            $this->secciones()->whereNotIn('id', $conservados ?: [0])->forceDelete();

            $this->forceFill(['updated_by' => $autor?->id])->save();
            $this->unsetRelation('secciones');

            return $mapa;
        });
    }

    /**
     * Congela el borrador en una versión nueva y la deja como publicada.
     */
    public function publicar(?User $autor = null, ?string $etiqueta = null): PaginaVersion
    {
        return DB::transaction(function () use ($autor, $etiqueta): PaginaVersion {
            $version = $this->versiones()->create([
                'snapshot' => $this->snapshotDelBorrador(),
                'etiqueta' => $etiqueta,
                'created_by' => $autor?->id,
            ]);

            $this->forceFill([
                'version_publicada_id' => $version->id,
                'updated_by' => $autor?->id,
            ])->save();

            $this->setRelation('versionPublicada', $version);

            return $version;
        });
    }

    /**
     * Devuelve el borrador al contenido de una versión anterior.
     *
     * No publica: deja los cambios listos para revisar y publicar a mano, que
     * es lo que se espera al recuperar algo del historial.
     */
    public function revertirA(PaginaVersion $version): void
    {
        abort_unless($version->pagina_id === $this->id, 404);

        DB::transaction(function () use ($version): void {
            $this->secciones()->forceDelete();

            foreach ($version->snapshot ?? [] as $seccion) {
                $this->secciones()->create([
                    'bloque' => $seccion['bloque'],
                    'nombre' => $seccion['nombre'] ?? null,
                    'orden' => $seccion['orden'] ?? 0,
                    'es_visible' => $seccion['es_visible'] ?? true,
                    'datos' => $seccion['datos'] ?? [],
                    'estilos' => $seccion['estilos'] ?? [],
                ]);
            }
        });

        $this->unsetRelation('secciones');
    }

    /**
     * Si el borrador difiere de lo que está publicado. Alimenta el aviso de
     * «cambios sin publicar» del editor.
     */
    public function tieneCambiosSinPublicar(): bool
    {
        if (! $this->estaPublicada()) {
            return $this->secciones()->exists();
        }

        return $this->normalizar($this->snapshotDelBorrador())
            !== $this->normalizar($this->versionPublicada->snapshot ?? []);
    }

    /**
     * Deja dos instantáneas en forma comparable.
     *
     * Se descartan los ids, que cambian al revertir aunque el contenido sea el
     * mismo, y se ordenan las claves: jsonb no conserva el orden en que se
     * guardaron, y la comparación estricta de arrays en PHP sí lo tiene en
     * cuenta.
     *
     * @param  array<int, array<string, mixed>>  $snapshot
     * @return array<int, array<string, mixed>>
     */
    private function normalizar(array $snapshot): array
    {
        return array_map(static function (array $seccion): array {
            unset($seccion['id']);

            return self::ordenarClaves($seccion);
        }, $snapshot);
    }

    /**
     * @param  array<array-key, mixed>  $valor
     * @return array<array-key, mixed>
     */
    private static function ordenarClaves(array $valor): array
    {
        foreach ($valor as $clave => $contenido) {
            if (is_array($contenido)) {
                $valor[$clave] = self::ordenarClaves($contenido);
            }
        }

        ksort($valor);

        return $valor;
    }
}
