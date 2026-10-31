<?php

namespace App\Support;

use Illuminate\Support\Facades\Vite;

class PaginaInertia
{
    /**
     * Cache por petición: evita repetir is_file() en cada render.
     *
     * @var array<string, string|null>
     */
    private static array $resueltos = [];

    /**
     * @var array<string, bool>|null
     */
    private static ?array $manifiesto = null;

    /**
     * Punto de entrada Vite de una página de Inertia, o null si no procede
     * precargarla.
     *
     * Devuelve null cuando el archivo no está en el manifiesto compilado. Sin
     * esa salvaguarda, una página todavía sin compilar no se queda sin
     * precarga: tumba la petición entera con un 500.
     */
    public static function entrypoint(string $componente): ?string
    {
        return self::$resueltos[$componente] ??= self::resolver($componente);
    }

    private static function resolver(string $componente): ?string
    {
        $ruta = "resources/js/pages/{$componente}.tsx";

        return is_file(base_path($ruta)) && self::estaCompilado($ruta) ? $ruta : null;
    }

    /**
     * Con el servidor de desarrollo en marcha no hay manifiesto: Vite sirve
     * cualquier ruta que exista en disco.
     */
    private static function estaCompilado(string $ruta): bool
    {
        if (Vite::isRunningHot()) {
            return true;
        }

        self::$manifiesto ??= self::leerManifiesto();

        return isset(self::$manifiesto[$ruta]);
    }

    /**
     * @return array<string, bool>
     */
    private static function leerManifiesto(): array
    {
        $ruta = public_path('build/manifest.json');

        if (! is_file($ruta)) {
            return [];
        }

        $contenido = json_decode((string) file_get_contents($ruta), true);

        return is_array($contenido) ? array_fill_keys(array_keys($contenido), true) : [];
    }
}
