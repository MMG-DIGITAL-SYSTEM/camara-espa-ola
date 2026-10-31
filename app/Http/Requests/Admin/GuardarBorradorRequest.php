<?php

namespace App\Http\Requests\Admin;

use App\Bloques\RegistroDeBloques;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GuardarBorradorRequest extends FormRequest
{
    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'secciones' => ['present', 'array', 'max:80'],
            'secciones.*.clave' => ['required', 'string', 'max:60'],
            'secciones.*.id' => ['nullable', 'integer'],
            'secciones.*.bloque' => ['required', 'string', Rule::in(RegistroDeBloques::claves())],
            'secciones.*.nombre' => ['nullable', 'string', 'max:120'],
            'secciones.*.es_visible' => ['required', 'boolean'],
            'secciones.*.datos' => ['present', 'array'],
            'secciones.*.estilos' => ['present', 'array'],
            'secciones.*.estilos.fondo' => ['nullable', Rule::in(['claro', 'suave', 'oscuro', 'marca'])],
            'secciones.*.estilos.espaciado' => ['nullable', Rule::in(['compacto', 'normal', 'amplio'])],
            'secciones.*.estilos.ancho' => ['nullable', Rule::in(['estrecho', 'normal', 'completo'])],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'secciones.*.bloque.in' => 'Uno de los bloques no existe en el catálogo.',
        ];
    }

    /**
     * Las secciones tal cual las espera Pagina::guardarBorrador().
     *
     * @return array<int, array<string, mixed>>
     */
    public function secciones(): array
    {
        return $this->validated('secciones');
    }
}
