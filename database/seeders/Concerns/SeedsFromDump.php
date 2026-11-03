<?php

namespace Database\Seeders\Concerns;

use Illuminate\Support\Facades\DB;

/**
 * Inserta en las tablas reales los datos extraídos de camaraesp.sql,
 * preservando los ids originales del backup (otras filas los referencian por
 * clave foránea) y dejando la secuencia de Postgres lista para el próximo
 * insert sin id explícito.
 *
 * Los datos viven en database/seeders/data/{tabla}.php, un array por tabla
 * generado una sola vez a partir del backup restaurado; no se editan a mano.
 */
trait SeedsFromDump
{
    /**
     * @param  string|null  $idColumn  null en tablas sin id (pivotes, o con otra PK no numérica y sin secuencia)
     */
    protected function insertRows(string $tabla, ?string $idColumn = 'id'): int
    {
        $filas = $this->datosDe($tabla);

        if ($filas === []) {
            return 0;
        }

        DB::table($tabla)->insert($filas);

        if ($idColumn !== null) {
            $this->reajustarSecuencia($tabla, $idColumn);
        }

        $this->command?->info(sprintf('  %s: %d filas', $tabla, count($filas)));

        return count($filas);
    }

    /**
     * Para pares de tablas con referencia circular (ej. users.socio_id ↔
     * socios.created_by): inserta la tabla dejando en null la columna que
     * todavía no puede apuntar a nada, y devuelve [id => valor original] para
     * restaurarla después con restaurarColumna(), una vez exista la otra tabla.
     *
     * @return array<int|string, mixed>
     */
    protected function insertRowsDiferido(string $tabla, string $columnaDiferida, string $idColumn = 'id'): array
    {
        $filas = $this->datosDe($tabla);

        if ($filas === []) {
            return [];
        }

        $valoresOriginales = array_column($filas, $columnaDiferida, $idColumn);

        $filasSinColumna = array_map(function (array $fila) use ($columnaDiferida) {
            $fila[$columnaDiferida] = null;

            return $fila;
        }, $filas);

        DB::table($tabla)->insert($filasSinColumna);
        $this->reajustarSecuencia($tabla, $idColumn);

        $this->command?->info(sprintf('  %s: %d filas (%s pendiente)', $tabla, count($filas), $columnaDiferida));

        return $valoresOriginales;
    }

    /**
     * @param  array<int|string, mixed>  $valoresOriginales
     */
    protected function restaurarColumna(string $tabla, string $columna, array $valoresOriginales, string $idColumn = 'id'): void
    {
        foreach ($valoresOriginales as $id => $valor) {
            if ($valor === null) {
                continue;
            }

            DB::table($tabla)->where($idColumn, $id)->update([$columna => $valor]);
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function datosDe(string $tabla): array
    {
        $ruta = database_path("seeders/data/{$tabla}.php");

        if (! is_file($ruta)) {
            return [];
        }

        return require $ruta;
    }

    private function reajustarSecuencia(string $tabla, string $idColumn): void
    {
        DB::statement(
            "SELECT setval(pg_get_serial_sequence(?, ?), COALESCE((SELECT MAX({$idColumn}) FROM {$tabla}), 1))",
            [$tabla, $idColumn],
        );
    }
}
