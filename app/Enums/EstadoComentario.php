<?php

namespace App\Enums;

use App\Concerns\EnumConOpciones;

/**
 * Moderación de un comentario. Solo los aprobados se ven en el sitio.
 */
enum EstadoComentario: string
{
    use EnumConOpciones;

    case Pendiente = 'pendiente';
    case Aprobado = 'aprobado';
    case Rechazado = 'rechazado';

    public function etiqueta(): string
    {
        return match ($this) {
            self::Pendiente => 'Pendiente',
            self::Aprobado => 'Aprobado',
            self::Rechazado => 'Rechazado',
        };
    }
}
