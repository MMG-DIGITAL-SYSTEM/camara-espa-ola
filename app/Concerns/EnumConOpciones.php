<?php

namespace App\Concerns;

/**
 * Para enums con `etiqueta()`: la lista de opciones que pintan los selects del
 * front, así el texto visible vive en un solo sitio.
 */
trait EnumConOpciones
{
    /**
     * @return array<int, array{valor: string, etiqueta: string}>
     */
    public static function opciones(): array
    {
        return array_map(
            fn (self $caso): array => ['valor' => $caso->value, 'etiqueta' => $caso->etiqueta()],
            self::cases(),
        );
    }
}
