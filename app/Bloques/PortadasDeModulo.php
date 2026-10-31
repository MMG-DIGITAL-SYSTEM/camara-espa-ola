<?php

namespace App\Bloques;

use App\Models\Pagina;
use App\Models\PaginaSeccion;
use Illuminate\Support\Facades\DB;

/**
 * Portada con la que nace cada página de módulo.
 *
 * Antes estas portadas estaban escritas en cada vista y no se podían tocar
 * desde el panel. Ahora son una sección `portada-modulo` más, con este
 * contenido inicial: el mismo texto y aspecto que tenían en el código.
 */
class PortadasDeModulo
{
    public const BLOQUE = 'portada-modulo';

    /**
     * @var array<string, array<string, mixed>>
     */
    private const PORTADAS = [
        'actividades' => [
            'antetitulo' => 'Actualidad',
            'titulo' => 'Actividades y',
            'titulo_destacado' => 'Eventos',
            'descripcion' => 'Mantente informado sobre las últimas actividades, eventos y noticias de la Cámara Oficial Española en Bolivia.',
            'alineacion' => 'izquierda',
            'decoracion' => 'particulas',
            'etiquetas' => [
                ['icono' => 'search', 'texto' => 'Buscar actividades'],
                ['icono' => 'filter', 'texto' => 'Filtrar'],
            ],
        ],
        'noticias' => [
            'antetitulo' => 'Actualidad',
            'titulo' => 'Noticias',
            'titulo_destacado' => 'y Novedades',
            'descripcion' => 'Mantente informado sobre las últimas noticias y novedades de la Cámara Oficial Española en Bolivia.',
            'alineacion' => 'centro',
            'decoracion' => 'particulas',
            'etiquetas' => [
                ['icono' => 'clock', 'texto' => 'Últimas noticias'],
                ['icono' => 'trending-up', 'texto' => 'Tendencias'],
                ['icono' => 'sparkles', 'texto' => 'Destacadas'],
            ],
        ],
        'servicios' => [
            'antetitulo' => 'Servicios',
            'titulo' => 'Servicios',
            'titulo_destacado' => 'para tu',
            'titulo_cierre' => 'Empresa',
            'descripcion' => 'Conoce los servicios que ofrece la Cámara a sus asociados',
            'alineacion' => 'centro',
            'decoracion' => 'ninguna',
        ],
        'socios' => [
            'antetitulo' => 'Red de Negocios',
            'titulo' => 'Impulso',
            'titulo_destacado' => 'Empresarial:',
            'titulo_cierre' => "Nuestros Socios\nen Bolivia",
            'descripcion' => 'Conoce a nuestros socios, empresas líderes que contribuyen activamente al dinamismo del paisaje empresarial boliviano.',
            'alineacion' => 'izquierda',
            'decoracion' => 'moleculas',
            'cifras' => [
                ['icono' => 'trending-up', 'valor' => '$3.5B', 'etiqueta' => 'Inversiones'],
                ['icono' => 'users', 'valor' => '20K+', 'etiqueta' => 'Socios'],
                ['icono' => 'award', 'valor' => '4.7', 'etiqueta' => 'Rating'],
            ],
            'boton_texto' => 'Explorar Socios',
            'boton_enlace' => '#socios',
        ],
        'fichas-pais' => [
            'antetitulo' => 'Internacional',
            'titulo' => 'Ficha',
            'titulo_destacado' => 'País',
            'descripcion' => 'Conoce las oportunidades comerciales y económicas de España y Bolivia a través de nuestras fichas país.',
            'alineacion' => 'centro',
            'decoracion' => 'ninguna',
            'video' => 'https://www.shutterstock.com/shutterstock/videos/1090929639/preview/stock-footage-aerial-view-of-gothic-quarter-in-barcelona-time-lapse-at-sunset-catalonia-spain-basilica-of.webm',
            'etiquetas' => [
                ['icono' => 'globe', 'texto' => 'España'],
                ['icono' => 'map-pin', 'texto' => 'Bolivia'],
                ['icono' => 'building', 'texto' => 'Comercio'],
            ],
        ],
        'red-camaras' => [
            'antetitulo' => 'Internacional',
            'titulo' => 'Red de Cámaras',
            'titulo_destacado' => 'Españolas',
            'titulo_cierre' => 'por el Mundo',
            'descripcion' => 'Conoce las Cámaras Españolas en el mundo. Cada una conecta oportunidades empresariales entre España y su país de destino.',
            'alineacion' => 'centro',
            'decoracion' => 'ninguna',
            'video' => 'https://video-previews.elements.envatousercontent.com/7ca90e35-4b39-4131-a18c-5e3e6bb6bdd6/watermarked_preview/watermarked_preview.mp4',
            'etiquetas' => [
                ['icono' => 'globe', 'texto' => 'Conexión Global'],
                ['icono' => 'award', 'texto' => 'Red de Negocios'],
                ['icono' => 'users', 'texto' => 'Oportunidades'],
            ],
        ],
        'contacto' => [
            'tema' => 'claro',
            'antetitulo' => 'Contacto',
            'titulo' => 'Conéctate con',
            'titulo_destacado' => 'nosotros',
            'descripcion' => '¿Tienes preguntas o sugerencias? Nos encantaría escucharte. Completa este formulario y pronto estaremos en contacto contigo.',
            'alineacion' => 'centro',
            'espaciado' => 'compacto',
        ],
        'la-camara' => [
            'antetitulo' => 'Cámara Oficial Española en Bolivia',
            'titulo' => 'LA CÁMARA OFICIAL',
            'titulo_destacado' => 'ESPAÑOLA DE COMERCIO E',
            'titulo_cierre' => 'INDUSTRIA EN BOLIVIA',
            'alineacion' => 'centro',
            'decoracion' => 'ninguna',
            'imagen' => 'https://postcardnarrative.com/wp-content/uploads/2023/04/10.png',
        ],
    ];

    /**
     * Contenido inicial de la portada de un módulo, o null si el módulo no
     * tiene portada propia (contacto, bolsa de trabajo…).
     *
     * @return array<string, mixed>|null
     */
    public static function datosDe(string $modulo): ?array
    {
        return self::PORTADAS[$modulo] ?? null;
    }

    /**
     * Añade la portada a una página de módulo que todavía no la tiene.
     *
     * Va justo antes del marcador «listado», que es donde la vista pintaba su
     * portada fija, o al final si no hay marcador. Se añade también a la
     * versión publicada, sin publicar de paso otros cambios del borrador: así
     * el público sigue viendo su portada sin que nadie tenga que publicar.
     */
    public static function anadirA(Pagina $pagina): bool
    {
        $datos = $pagina->modulo ? self::datosDe($pagina->modulo) : null;

        if ($datos === null || $pagina->secciones()->where('bloque', self::BLOQUE)->exists()) {
            return false;
        }

        DB::transaction(function () use ($pagina, $datos): void {
            $borrador = $pagina->secciones()->get()->all();

            $portada = $pagina->secciones()->create([
                'bloque' => self::BLOQUE,
                'orden' => 0,
                'datos' => $datos,
                'estilos' => [],
            ]);

            $ordenadas = self::insertarAntesDelMarcador(
                $borrador,
                $portada,
                fn (PaginaSeccion $seccion): array => $seccion->only(['bloque', 'nombre']),
            );

            foreach ($ordenadas as $orden => $seccion) {
                $seccion->update(['orden' => $orden]);
            }

            if (! $pagina->estaPublicada()) {
                return;
            }

            $snapshot = $pagina->versionPublicada->snapshot ?? [];
            usort($snapshot, fn (array $a, array $b): int => ($a['orden'] ?? 0) <=> ($b['orden'] ?? 0));

            $publicadas = self::insertarAntesDelMarcador(
                $snapshot,
                $portada->fresh()->aArray(),
                fn (array $seccion): array => $seccion,
            );

            $version = $pagina->versiones()->create([
                'snapshot' => array_map(
                    fn (array $seccion, int $orden): array => [...$seccion, 'orden' => $orden],
                    $publicadas,
                    array_keys($publicadas),
                ),
                'etiqueta' => 'Portada editable',
            ]);

            $pagina->forceFill(['version_publicada_id' => $version->id])->save();
        });

        $pagina->unsetRelation('secciones')->unsetRelation('versionPublicada');

        return true;
    }

    /**
     * @template T
     *
     * @param  array<int, T>  $secciones
     * @param  T  $nueva
     * @param  callable(T): array<string, mixed>  $atributos
     * @return array<int, T>
     */
    private static function insertarAntesDelMarcador(array $secciones, mixed $nueva, callable $atributos): array
    {
        $posicion = count($secciones);

        foreach (array_values($secciones) as $indice => $seccion) {
            $datos = $atributos($seccion);

            if (($datos['bloque'] ?? null) === 'separador'
                && mb_strtolower(trim((string) ($datos['nombre'] ?? ''))) === 'listado') {
                $posicion = $indice;

                break;
            }
        }

        $secciones = array_values($secciones);
        array_splice($secciones, $posicion, 0, [$nueva]);

        return $secciones;
    }
}
