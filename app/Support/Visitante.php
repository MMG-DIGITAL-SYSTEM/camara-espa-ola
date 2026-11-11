<?php

namespace App\Support;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Cookie;

/**
 * Identifica a un visitante anónimo del sitio público por una cookie.
 *
 * La cookie lleva un UUID al azar (Laravel la cifra); en la base solo se
 * guarda su huella, así que no hay forma de volver de ella al navegador.
 */
class Visitante
{
    public const COOKIE = 'visitante';

    /** Dos años, en minutos. */
    private const DURACION = 60 * 24 * 365 * 2;

    /**
     * Huella del visitante, o null si su navegador aún no tiene cookie.
     */
    public static function huella(Request $request): ?string
    {
        $id = $request->cookie(self::COOKIE);

        return is_string($id) && Str::isUuid($id) ? self::huellaDe($id) : null;
    }

    /**
     * Huella del visitante y, si es nuevo, la cookie que hay que enviarle.
     *
     * @return array{0: string, 1: Cookie|null}
     */
    public static function identificar(Request $request): array
    {
        $huella = self::huella($request);

        if ($huella !== null) {
            return [$huella, null];
        }

        $id = (string) Str::uuid();

        return [self::huellaDe($id), cookie(self::COOKIE, $id, self::DURACION)];
    }

    private static function huellaDe(string $id): string
    {
        return hash('sha256', $id);
    }
}
