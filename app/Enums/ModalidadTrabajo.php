<?php

namespace App\Enums;

use App\Concerns\EnumConOpciones;

enum ModalidadTrabajo: string
{
    use EnumConOpciones;

    case Presencial = 'presencial';
    case Hibrida = 'hibrida';
    case Remota = 'remota';

    public function etiqueta(): string
    {
        return match ($this) {
            self::Presencial => 'Presencial',
            self::Hibrida => 'Híbrida',
            self::Remota => 'Remota',
        };
    }
}
