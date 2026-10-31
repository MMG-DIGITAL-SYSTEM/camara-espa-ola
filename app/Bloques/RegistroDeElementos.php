<?php

namespace App\Bloques;

use App\Support\HtmlSeguro;

/**
 * Catálogo de elementos sueltos que se colocan dentro de un bloque contenedor.
 *
 * Mientras un bloque es una franja entera de la página, un elemento es una
 * pieza pequeña —un título, una tarjeta, un botón— que el editor coloca en la
 * rejilla del lienzo a su gusto. La forma de trabajar es la misma que con los
 * bloques: el aspecto vive en `resources/js/blocks/elementos.ts` y aquí solo
 * importa qué claves son válidas y cuáles traen HTML que hay que sanear.
 *
 * ElementoTest comprueba que las dos listas no se separen.
 */
class RegistroDeElementos
{
    /**
     * Claves admitidas.
     *
     * @var array<int, string>
     */
    private const ELEMENTOS = [
        'titulo',
        'parrafo',
        'imagen',
        'boton',
        'tarjeta',
        'caracteristica',
        'cifra',
        'cita',
        'lista',
        'video',
        'separador',
        'espacio',
    ];

    /**
     * Campos de cada elemento que aceptan HTML del editor enriquecido.
     *
     * @var array<string, array<int, string>>
     */
    private const RICHTEXT = [
        'parrafo' => ['contenido'],
    ];

    /**
     * Fracciones de la rejilla que puede ocupar un elemento.
     *
     * @var array<int, string>
     */
    private const ANCHOS = [
        'completo',
        'dos-tercios',
        'mitad',
        'tercio',
        'cuarto',
    ];

    public const ANCHO_POR_DEFECTO = 'completo';

    /**
     * @return array<int, string>
     */
    public static function claves(): array
    {
        return self::ELEMENTOS;
    }

    public static function existe(string $elemento): bool
    {
        return in_array($elemento, self::ELEMENTOS, true);
    }

    /**
     * @return array<int, string>
     */
    public static function anchos(): array
    {
        return self::ANCHOS;
    }

    /**
     * @return array<int, string>
     */
    public static function camposRichtext(string $elemento): array
    {
        return self::RICHTEXT[$elemento] ?? [];
    }

    /**
     * Normaliza la lista de elementos de un lienzo antes de guardarla.
     *
     * Descarta lo que no reconoce en lugar de fallar: una página publicada
     * puede arrastrar elementos de una versión anterior del catálogo, y es
     * preferible perder la pieza retirada a bloquear el guardado entero.
     *
     * @param  array<int|string, mixed>  $elementos
     * @return array<int, array<string, mixed>>
     */
    public static function sanearElementos(array $elementos): array
    {
        $limpios = [];

        foreach ($elementos as $elemento) {
            if (! is_array($elemento)) {
                continue;
            }

            $clave = $elemento['elemento'] ?? null;

            if (! is_string($clave) || ! self::existe($clave)) {
                continue;
            }

            $datos = is_array($elemento['datos'] ?? null) ? $elemento['datos'] : [];

            foreach (self::camposRichtext($clave) as $campo) {
                if (array_key_exists($campo, $datos)) {
                    $datos[$campo] = HtmlSeguro::limpiar(
                        is_string($datos[$campo]) ? $datos[$campo] : null,
                    );
                }
            }

            $ancho = $elemento['ancho'] ?? null;

            $limpios[] = [
                'clave' => is_string($elemento['clave'] ?? null)
                    ? $elemento['clave']
                    : uniqid('e_'),
                'elemento' => $clave,
                'ancho' => is_string($ancho) && in_array($ancho, self::ANCHOS, true)
                    ? $ancho
                    : self::ANCHO_POR_DEFECTO,
                'datos' => $datos,
            ];
        }

        return $limpios;
    }
}
