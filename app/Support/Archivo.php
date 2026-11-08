<?php

namespace App\Support;

class Archivo
{
    /**
     * URL pública de un archivo guardado.
     *
     * El contenido antiguo mezcla rutas de `storage` con URLs externas
     * pegadas a mano, así que se distingue entre ambas.
     *
     * La biblioteca de medios guardaba URLs completas con el host de APP_URL.
     * Esas se rehacen con el host de la petición actual: si no, quien entra
     * por otra dirección (127.0.0.1 en vez de localhost) pide el archivo a
     * otro origen y el navegador bloquea las lecturas desde JavaScript, como
     * la que hace pdf.js con las fichas país. Lo mismo vale para las URLs que
     * se guardaron en desarrollo y llegaron a producción con la base.
     */
    public static function url(?string $ruta): ?string
    {
        if (blank($ruta)) {
            return null;
        }

        if (str_starts_with($ruta, '/storage/')) {
            return asset(ltrim($ruta, '/'));
        }

        if (! filter_var($ruta, FILTER_VALIDATE_URL)) {
            return asset('storage/'.ltrim($ruta, '/'));
        }

        return self::esDelStoragePropio($ruta)
            ? asset(ltrim((string) parse_url($ruta, PHP_URL_PATH), '/'))
            : $ruta;
    }

    /**
     * Rehace, dentro de unos datos anidados, solo las URLs que apuntan al
     * storage propio. El resto de valores se devuelve sin tocar.
     *
     * @param  array<array-key, mixed>  $datos
     * @return array<array-key, mixed>
     */
    public static function normalizarUrls(array $datos): array
    {
        foreach ($datos as $clave => $valor) {
            if (is_array($valor)) {
                $datos[$clave] = self::normalizarUrls($valor);
            } elseif (is_string($valor) && filter_var($valor, FILTER_VALIDATE_URL) && self::esDelStoragePropio($valor)) {
                $datos[$clave] = self::url($valor);
            }
        }

        return $datos;
    }

    private static function esDelStoragePropio(string $url): bool
    {
        $archivo = parse_url($url);

        if (! str_starts_with($archivo['path'] ?? '', '/storage/')) {
            return false;
        }

        $origenes = [config('app.url'), ...(array) config('app.urls_anteriores', [])];

        foreach ($origenes as $origen) {
            $propio = parse_url((string) $origen);

            if (($archivo['host'] ?? null) === ($propio['host'] ?? null)
                && ($archivo['port'] ?? null) === ($propio['port'] ?? null)) {
                return true;
            }
        }

        return false;
    }
}
