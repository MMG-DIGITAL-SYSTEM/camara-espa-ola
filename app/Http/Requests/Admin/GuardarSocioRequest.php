<?php

namespace App\Http\Requests\Admin;

use App\Models\CategoriaAfiliado;
use App\Models\EstadoComercial;
use App\Models\Socio;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class GuardarSocioRequest extends FormRequest
{
    public function socio(): ?Socio
    {
        return $this->route('socio');
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:255'],
            // El índice único de la tabla también cubre a los socios borrados.
            'slug' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('socios', 'slug')->ignore($this->socio()?->id),
            ],
            'nit' => ['nullable', 'string', 'max:30'],
            'descripcion' => ['nullable', 'string', 'max:5000'],
            'imagen' => ['nullable', 'string', 'max:500'],
            'sitio_web' => ['nullable', 'url', 'max:255'],
            'telefono1' => ['nullable', 'string', 'max:20'],
            'telefono2' => ['nullable', 'string', 'max:20'],
            'correo_electronico' => ['nullable', 'email', 'max:255'],
            'direccion' => ['nullable', 'string', 'max:1000'],
            'categoria_id' => ['nullable', Rule::exists(CategoriaAfiliado::class, 'id')],
            // Permite dar de alta un rubro nuevo sin salir del formulario.
            'categoria_nueva' => ['nullable', 'string', 'max:100'],
            'estado_id' => ['required', Rule::exists(EstadoComercial::class, 'id')],
            'fecha_afiliacion' => ['required', 'date'],
            'destacado' => ['required', 'boolean'],
            'orden' => ['required', 'integer', 'min:0', 'max:9999'],

            'contactos' => ['array', 'max:30'],
            'contactos.*.nombre' => ['required', 'string', 'max:255'],
            'contactos.*.cargo' => ['nullable', 'string', 'max:255'],
            'contactos.*.telefono' => ['nullable', 'string', 'max:20'],
            'contactos.*.correo_electronico' => ['nullable', 'email', 'max:255'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $slug = $this->string('slug')->trim();

        $this->merge([
            'slug' => Str::slug($slug->isEmpty() ? $this->string('nombre') : $slug),
        ]);
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'slug' => 'dirección',
            'nit' => 'NIT',
            'descripcion' => 'descripción',
            'sitio_web' => 'sitio web',
            'telefono1' => 'teléfono',
            'telefono2' => 'celular',
            'correo_electronico' => 'correo',
            'direccion' => 'dirección postal',
            'categoria_id' => 'rubro',
            'categoria_nueva' => 'rubro nuevo',
            'estado_id' => 'estado',
            'fecha_afiliacion' => 'fecha de afiliación',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'slug.unique' => 'Ya existe un socio con esa dirección.',
            'slug.regex' => 'La dirección solo admite minúsculas, números y guiones.',
            'contactos.*.nombre.required' => 'Cada contacto necesita un nombre.',
            'contactos.*.correo_electronico.email' => 'El correo de un contacto no es válido.',
        ];
    }
}
