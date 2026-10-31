<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Crear o editar una ficha país. El PDF se elige de la biblioteca de medios
 * (o se pega una dirección), así que llega como texto, igual que el logo de
 * un socio.
 */
class GuardarFichaPaisRequest extends FormRequest
{
    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'pais' => ['required', 'string', 'max:255'],
            'titulo' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string', 'max:2000'],
            'pdf_url' => ['nullable', 'string', 'max:500'],
            'fecha_publicacion' => ['required', 'date'],
            'orden' => ['required', 'integer', 'min:0', 'max:9999'],
            'activo' => ['required', 'boolean'],
        ];
    }

    /**
     * Texto plano: país, título y descripción se pintan como texto.
     */
    protected function prepareForValidation(): void
    {
        $limpios = [];

        foreach (['pais', 'titulo', 'descripcion', 'pdf_url'] as $campo) {
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
            'pais' => 'país',
            'titulo' => 'título',
            'descripcion' => 'descripción',
            'pdf_url' => 'PDF',
            'fecha_publicacion' => 'fecha de publicación',
        ];
    }
}
