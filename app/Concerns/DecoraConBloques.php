<?php

namespace App\Concerns;

use App\Bloques\RegistroDeBloques;
use App\Models\Pagina;
use Illuminate\Http\Request;

/**
 * Permite decorar con bloques una vista a medida.
 *
 * Las páginas de módulo (Noticias, Socios, Fichas País…) conservan su vista
 * propia porque tienen filtros, paginación o visores de PDF que no tiene
 * sentido rehacer como bloques. Pero su encabezado y lo que va antes o después
 * del listado sí se editan desde el panel: este trait les añade esas secciones.
 *
 * Las secciones se reparten en dos huecos según su posición respecto al bloque
 * marcador `separador` con el nombre «listado»; si no lo hay, todas van arriba.
 */
trait DecoraConBloques
{
    /**
     * Nombre que hay que dar a un separador para marcar dónde va el listado.
     */
    private const MARCA_LISTADO = 'listado';

    /**
     * Props de bloques para una página de módulo.
     *
     * @return array<string, mixed>
     */
    protected function bloquesDelModulo(Request $request, string $modulo): array
    {
        $pagina = Pagina::delModulo($modulo)->first();

        if (! $pagina) {
            return ['seccionesArriba' => [], 'seccionesAbajo' => [], 'datosBloques' => []];
        }

        $puedeVerBorrador = $request->user()?->accedeAlPanel() ?? false;

        if (! $pagina->estaPublicada()) {
            if (! $puedeVerBorrador) {
                return ['seccionesArriba' => [], 'seccionesAbajo' => [], 'datosBloques' => []];
            }

            $secciones = array_values(array_filter(
                $pagina->snapshotDelBorrador(),
                fn (array $seccion): bool => $seccion['es_visible'],
            ));
        } else {
            $secciones = $pagina->versionPublicada->seccionesVisibles();
        }

        [$arriba, $abajo] = $this->repartir($secciones);

        return [
            'seccionesArriba' => $arriba,
            'seccionesAbajo' => $abajo,
            'datosBloques' => RegistroDeBloques::datosDeSecciones($secciones),
        ];
    }

    /**
     * @param  array<int, array<string, mixed>>  $secciones
     * @return array{0: array<int, array<string, mixed>>, 1: array<int, array<string, mixed>>}
     */
    private function repartir(array $secciones): array
    {
        $arriba = [];
        $abajo = [];
        $vistoElMarcador = false;

        foreach ($secciones as $seccion) {
            if ($this->esElMarcador($seccion)) {
                $vistoElMarcador = true;

                continue;
            }

            if ($vistoElMarcador) {
                $abajo[] = $seccion;
            } else {
                $arriba[] = $seccion;
            }
        }

        return [$arriba, $abajo];
    }

    /**
     * @param  array<string, mixed>  $seccion
     */
    private function esElMarcador(array $seccion): bool
    {
        return $seccion['bloque'] === 'separador'
            && mb_strtolower(trim((string) ($seccion['nombre'] ?? ''))) === self::MARCA_LISTADO;
    }
}
