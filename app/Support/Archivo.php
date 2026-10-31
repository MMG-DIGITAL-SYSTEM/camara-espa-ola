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
     * La biblioteca de medios guarda URLs completas con el host de APP_URL.
     * Esas se rehacen con el host de la petición actual: si no, quien entra
     * por otra dirección (127.0.0.1 en vez de localhost) pide el archivo a
     * otro origen y el navegador bloquea las lecturas desde JavaScript, como
     * la que hace pdf.js con las fichas país.
     */
    public static function url(?string $ruta): ?string
    {
        if (blank($ruta)) {
            return null;
        }

        if (! filter_var($ruta, FILTER_VALIDATE_URL)) {
            return asset('storage/'.$ruta);
        }

        return self::esDelStoragePropio($ruta)
            ? asset(ltrim((string) parse_url($ruta, PHP_URL_PATH), '/'))
            : $ruta;
    }

    private static function esDelStoragePropio(string $url): bool
    {
        $app = parse_url((string) config('app.url'));
        $archivo = parse_url($url);

        return ($archivo['host'] ?? null) === ($app['host'] ?? null)
            && ($archivo['port'] ?? null) === ($app['port'] ?? null)
            && str_starts_with($archivo['path'] ?? '', '/storage/');
    }
}
