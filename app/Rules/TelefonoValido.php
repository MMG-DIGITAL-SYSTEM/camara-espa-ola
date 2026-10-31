<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Teléfono de cualquier país: admite +, espacios, guiones y paréntesis, pero
 * exige entre 7 y 15 dígitos (el máximo del estándar E.164). No asume el
 * formato boliviano de 8 dígitos porque escriben también empresas de España.
 */
class TelefonoValido implements ValidationRule
{
    private const FORMATO = '/^(?=(?:\D*\d){7,15}\D*$)\+?[\d\s().-]+$/';

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || ! preg_match(self::FORMATO, $value)) {
            $fail('Escribe un teléfono válido, con entre 7 y 15 dígitos.');
        }
    }
}
