<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Crear o editar una cámara de la red. El logo se elige de la biblioteca de
 * medios, igual que el de un socio.
 */
class GuardarRedCamaraRequest extends FormRequest
{
    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:255'],
            'pais' => ['required', 'string', 'max:255'],
            'ciudad' => ['nullable', 'string', 'max:255'],
            'direccion' => ['nullable', 'string', 'max:1000'],
            'telefono' => ['nullable', 'string', 'max:50'],
            'correo' => ['nullable', 'email', 'max:255'],
            'pagina_web' => ['nullable', 'url', 'max:255'],
            'logo' => ['nullable', 'string', 'max:500'],
            'orden' => ['required', 'integer', 'min:0', 'max:9999'],
            'activo' => ['required', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'pais' => 'país',
            'direccion' => 'dirección',
            'telefono' => 'teléfono',
            'pagina_web' => 'sitio web',
        ];
    }
}
