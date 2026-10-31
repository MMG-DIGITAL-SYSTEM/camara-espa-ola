<?php

namespace App\Enums;

use App\Concerns\EnumConOpciones;

enum JornadaLaboral: string
{
    use EnumConOpciones;

    case Completa = 'completa';
    case Parcial = 'parcial';
    case PorProyecto = 'por-proyecto';
    case Practicas = 'practicas';

    public function etiqueta(): string
    {
        return match ($this) {
            self::Completa => 'Tiempo completo',
            self::Parcial => 'Medio tiempo',
            self::PorProyecto => 'Por proyecto',
            self::Practicas => 'Pasantía',
        };
    }
}
