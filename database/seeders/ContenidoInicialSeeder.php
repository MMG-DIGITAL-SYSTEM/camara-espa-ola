<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * Restaura el contenido que existía en la base antes de rehacer el esquema.
 *
 * El respaldo vive en database/seeders/data/contenido-inicial.json y se generó
 * desde la base de producción de pruebas. La tabla `teams` de aquel esquema es
 * la que hoy es `socios`, por eso se traduce al vuelo.
 */
class ContenidoInicialSeeder extends Seeder
{
    /**
     * Orden de inserción: respeta las claves foráneas.
     *
     * @var array<int, string>
     */
    private array $orden = [
        'estados_publicacion',
        'estados_comercial',
        'visibilidad',
        'categorias',
        'categorias_afiliados',
        'socios',
        'contenido_institucional',
        'directivos',
        'servicios',
        'fichas_pais',
        'redes_camaras',
        'noticias',
        'actividades',
        'contactos_afiliados',
        'noticia_categoria',
        'actividad_categoria',
    ];

    /**
     * Tablas pivote: no tienen columna id ni secuencia que reajustar.
     *
     * @var array<int, string>
     */
    private array $pivotes = ['noticia_categoria', 'actividad_categoria'];

    public function run(): void
    {
        $ruta = database_path('seeders/data/contenido-inicial.json');

        if (! is_file($ruta)) {
            $this->command?->warn('No hay respaldo de contenido; se omite ContenidoInicialSeeder.');

            return;
        }

        $respaldo = json_decode((string) file_get_contents($ruta), true, 512, JSON_THROW_ON_ERROR);

        $datos = $this->traducirTeamsASocios($respaldo);

        foreach ($this->orden as $tabla) {
            $filas = $datos[$tabla] ?? [];

            if ($filas === []) {
                continue;
            }

            DB::table($tabla)->insert($this->ajustarAlEsquema($tabla, $filas));

            if (! in_array($tabla, $this->pivotes, true)) {
                $this->reajustarSecuencia($tabla);
            }

            $this->command?->info(sprintf('  %s: %d registros', $tabla, count($filas)));
        }
    }

    /**
     * El respaldo procede de una base que había derivado del esquema de las
     * migraciones (columnas añadidas a mano por SQL). Se descartan las columnas
     * que la tabla ya no tiene, avisando de cuáles para no perderlas en silencio.
     *
     * @param  array<int, array<string, mixed>>  $filas
     * @return array<int, array<string, mixed>>
     */
    private function ajustarAlEsquema(string $tabla, array $filas): array
    {
        $columnas = array_flip(Schema::getColumnListing($tabla));

        $sobrantes = array_diff(array_keys($filas[0]), array_keys($columnas));

        if ($sobrantes !== []) {
            $this->command?->warn(sprintf(
                '  %s: columnas del respaldo que ya no existen y se descartan: %s',
                $tabla,
                implode(', ', $sobrantes),
            ));
        }

        return array_map(
            fn (array $fila): array => array_intersect_key($fila, $columnas),
            $filas,
        );
    }

    /**
     * El esquema anterior guardaba los socios en `teams`, con `name` en lugar de
     * `nombre` y sin las columnas nuevas del modelo Socio.
     *
     * @param  array<string, array<int, array<string, mixed>>>  $respaldo
     * @return array<string, array<int, array<string, mixed>>>
     */
    private function traducirTeamsASocios(array $respaldo): array
    {
        $socios = array_map(function (array $team): array {
            return [
                'id' => $team['id'],
                'nombre' => $team['name'],
                'slug' => $team['slug'] ?: Str::slug($team['name']),
                'nit' => $team['nit'] ?? null,
                'descripcion' => $team['descripcion'] ?? null,
                'imagen' => $team['imagen'] ?? null,
                'sitio_web' => null,
                'nombre_contacto' => $team['nombre_contacto'] ?? null,
                'telefono1' => $team['telefono1'] ?? null,
                'telefono2' => $team['telefono2'] ?? null,
                'correo_electronico' => $team['correo_electronico'] ?? null,
                'direccion' => $team['direccion'] ?? null,
                'categoria_id' => $team['categoria_id'] ?? null,
                'estado_id' => $team['estado_id'] ?? null,
                'fecha_afiliacion' => $team['fecha_afiliacion'] ?? now()->toDateString(),
                'destacado' => false,
                'orden' => 0,
                'created_by' => null,
                'updated_by' => null,
                'created_at' => $team['created_at'] ?? null,
                'updated_at' => $team['updated_at'] ?? null,
                'deleted_at' => $team['deleted_at'] ?? null,
            ];
        }, $respaldo['teams'] ?? []);

        $contactos = array_map(function (array $contacto): array {
            $contacto['socio_id'] = $contacto['team_id'];
            unset($contacto['team_id']);

            return $contacto;
        }, $respaldo['contactos_afiliados'] ?? []);

        unset($respaldo['teams']);

        return [
            ...$respaldo,
            'socios' => $socios,
            'contactos_afiliados' => $contactos,
        ];
    }

    /**
     * Tras insertar ids explícitos, Postgres deja la secuencia atrás y el
     * siguiente insert automático chocaría. Esto la pone al día.
     */
    private function reajustarSecuencia(string $tabla): void
    {
        DB::statement(
            "SELECT setval(pg_get_serial_sequence(?, 'id'), COALESCE((SELECT MAX(id) FROM {$tabla}), 1))",
            [$tabla],
        );
    }
}
