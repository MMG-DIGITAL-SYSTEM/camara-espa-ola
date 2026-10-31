<?php

namespace App\Enums;

use App\Concerns\EnumConOpciones;

/**
 * Revisión de una solicitud de afiliación. Los valores coinciden con el enum
 * de la columna `solicitudes_afiliacion.estado`.
 */
enum EstadoSolicitudAfiliacion: string
{
    use EnumConOpciones;

    case Pendiente = 'pendiente';
    case EnRevision = 'en_revision';
    case RequiereCambios = 'requiere_cambios';
    case Aprobada = 'aprobada';
    case Rechazada = 'rechazada';

    public function etiqueta(): string
    {
        return match ($this) {
            self::Pendiente => 'Pendiente',
            self::EnRevision => 'En revisión',
            self::RequiereCambios => 'Requiere cambios',
            self::Aprobada => 'Aprobada',
            self::Rechazada => 'Rechazada',
        };
    }

    /**
     * Ya se decidió: no queda nada por hacer con la solicitud.
     */
    public function estaResuelta(): bool
    {
        return $this === self::Aprobada || $this === self::Rechazada;
    }
}
