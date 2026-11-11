<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Editar una sección de «La Cámara». La imagen y el PDF se eligen de la
 * biblioteca de medios (o se pega una dirección), así que llegan como texto.
 */
class GuardarContenidoInstitucionalRequest extends FormRequest
{
    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:255'],
            'contenido' => ['required', 'string', 'max:10000'],
            'imagen' => ['nullable', 'string', 'max:500'],
            'pdf' => ['nullable', 'string', 'max:500'],
            'activo' => ['required', 'boolean'],
        ];
    }

    /**
     * Texto plano: título y contenido se pintan como texto en la página.
     */
    protected function prepareForValidation(): void
    {
        $limpios = [];

        foreach (['titulo', 'contenido', 'imagen', 'pdf'] as $campo) {
            if (is_string($this->input($campo))) {
                $limpios[$campo] = trim(strip_tags($this->input($campo)));
            }
        }

        $this->merge($limpios);
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'titulo' => 'título',
            'pdf' => 'PDF',
        ];
    }
}
