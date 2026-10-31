<?php

namespace App\Enums;

use App\Concerns\EnumConOpciones;

/**
 * Ciclo de vida de una oferta de la bolsa de trabajo. Solo las publicadas
 * llegan al sitio; una cerrada se conserva para el historial de la empresa.
 */
enum EstadoOferta: string
{
    use EnumConOpciones;

    case Borrador = 'borrador';
    case Publicada = 'publicada';
    case Cerrada = 'cerrada';

    public function etiqueta(): string
    {
        return match ($this) {
            self::Borrador => 'Borrador',
            self::Publicada => 'Publicada',
            self::Cerrada => 'Cerrada',
        };
    }
}
