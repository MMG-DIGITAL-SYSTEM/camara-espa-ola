<?php

namespace App\Bloques;

use App\Bloques\Datos\CarruselSocios;
use App\Bloques\Datos\DirectorioDirectivos;
use App\Bloques\Datos\ListaFichasPais;
use App\Bloques\Datos\ListaRedCamaras;
use App\Bloques\Datos\PresentacionInstitucional;
use App\Bloques\Datos\ServiciosDestacados;
use App\Bloques\Datos\UltimasActividades;
use App\Bloques\Datos\UltimasNoticias;
use App\Support\HtmlSeguro;
use Illuminate\Support\Facades\App;

/**
 * Catálogo de bloques del lado servidor.
 *
 * El aspecto de cada bloque vive en `resources/js/blocks`; aquí solo importa
 * qué claves son válidas y cuáles necesitan datos de la base. Las dos listas
 * deben mantenerse alineadas: `BloqueTest` lo comprueba.
 */
class RegistroDeBloques
{
    /**
     * Bloques que solo muestran lo que el editor escribió.
     *
     * @var array<int, string>
     */
    private const ESTRUCTURALES = [
        'lienzo',
        'hero',
        'portada-modulo',
        'encabezado',
        'texto',
        'texto-imagen',
        'cta',
        'separador',
        'galeria',
        'acordeon',
        'cifras',
        'timeline',
        'video',
        'descargas',
        'mapa',
    ];

    /**
     * Bloques que consultan la base, con su proveedor de datos.
     *
     * @var array<string, class-string<ProveeDatos>>
     */
    private const CON_DATOS = [
        'servicios' => ServiciosDestacados::class,
        'noticias-recientes' => UltimasNoticias::class,
        'actividades-proximas' => UltimasActividades::class,
        'directorio' => DirectorioDirectivos::class,
        'socios' => CarruselSocios::class,
        'fichas-pais' => ListaFichasPais::class,
        'red-camaras' => ListaRedCamaras::class,
        'presentacion' => PresentacionInstitucional::class,
    ];

    /**
     * Campos de cada bloque que aceptan HTML del editor enriquecido.
     *
     * Solo estos se sanean; el resto se guarda tal cual, porque son texto
     * plano y escapar sus «<» los mostraría con entidades a la vista.
     *
     * Debe coincidir con los campos `richtext` del registro del cliente:
     * BloqueTest lo comprueba.
     *
     * @var array<string, array<int, string>>
     */
    private const RICHTEXT = [
        'texto' => ['contenido'],
        'texto-imagen' => ['contenido'],
    ];

    /**
     * Bloques cuyo contenido es una lista libre de elementos.
     *
     * Su campo `elementos` no se valida campo a campo como el resto: lo
     * delega en RegistroDeElementos, que conoce cada pieza.
     *
     * @var array<int, string>
     */
    private const CON_ELEMENTOS = [
        'lienzo',
    ];

    /**
     * Todas las claves admitidas.
     *
     * @return array<int, string>
     */
    public static function claves(): array
    {
        return [...self::ESTRUCTURALES, ...array_keys(self::CON_DATOS)];
    }

    public static function existe(string $bloque): bool
    {
        return in_array($bloque, self::claves(), true);
    }

    public static function necesitaDatos(string $bloque): bool
    {
        return isset(self::CON_DATOS[$bloque]);
    }

    /**
     * Resuelve los datos de un bloque inteligente.
     *
     * @param  array<string, mixed>  $config
     */
    public static function datosDe(string $bloque, array $config): mixed
    {
        if (! self::necesitaDatos($bloque)) {
            return null;
        }

        return App::make(self::CON_DATOS[$bloque])->datos($config);
    }

    /**
     * Campos con HTML de un bloque.
     *
     * @return array<int, string>
     */
    public static function camposRichtext(string $bloque): array
    {
        return self::RICHTEXT[$bloque] ?? [];
    }

    public static function admiteElementos(string $bloque): bool
    {
        return in_array($bloque, self::CON_ELEMENTOS, true);
    }

    /**
     * Sanea el HTML de los campos enriquecidos antes de guardarlos.
     *
     * Se aplica siempre al guardar una sección: el contenido acaba pintado con
     * dangerouslySetInnerHTML en el sitio público, así que no puede quedar al
     * criterio de quien llame al controlador.
     *
     * @param  array<string, mixed>  $datos
     * @return array<string, mixed>
     */
    public static function sanearDatos(string $bloque, array $datos): array
    {
        foreach (self::camposRichtext($bloque) as $campo) {
            if (array_key_exists($campo, $datos)) {
                $datos[$campo] = HtmlSeguro::limpiar(
                    is_string($datos[$campo]) ? $datos[$campo] : null,
                );
            }
        }

        foreach ($datos as $campo => $valor) {
            if (is_string($campo) && str_starts_with($campo, 'color_')) {
                $datos[$campo] = self::colorHex($valor);
            }
        }

        if (self::admiteElementos($bloque)) {
            $datos['elementos'] = RegistroDeElementos::sanearElementos(
                is_array($datos['elementos'] ?? null) ? $datos['elementos'] : [],
            );
        }

        return $datos;
    }

    /**
     * Los campos `color_*` se pintan en estilos en línea: solo pasan
     * hexadecimales; cualquier otra cosa vuelve al color del diseño.
     */
    private static function colorHex(mixed $valor): string
    {
        return is_string($valor) && preg_match('/^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i', $valor)
            ? $valor
            : '';
    }

    /**
     * Adjunta a cada sección los datos que su bloque necesite.
     *
     * Los proveedores se memorizan por bloque y configuración: una página con
     * dos bloques de «últimas noticias» iguales hace una sola consulta.
     *
     * @param  array<int, array<string, mixed>>  $secciones
     * @return array<int|string, mixed> Mapa id de sección → datos.
     */
    public static function datosDeSecciones(array $secciones): array
    {
        $resueltos = [];
        $memoria = [];

        foreach ($secciones as $seccion) {
            $bloque = $seccion['bloque'] ?? '';

            if (! self::necesitaDatos($bloque)) {
                continue;
            }

            $config = $seccion['datos'] ?? [];
            $huella = $bloque.':'.md5(json_encode($config) ?: '');

            $resueltos[$seccion['id']] = $memoria[$huella] ??= self::datosDe($bloque, $config);
        }

        return $resueltos;
    }
}
