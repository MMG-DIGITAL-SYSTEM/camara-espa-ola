<?php

namespace App\Http\Requests\Admin;

use App\Models\Categoria;
use App\Models\EstadoPublicacion;
use App\Models\Visibilidad;
use App\Support\HtmlSeguro;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GuardarActividadRequest extends FormRequest
{
    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:255'],
            'descripcion' => ['required', 'string'],
            'imagen' => ['nullable', 'string', 'max:500'],
            'fecha_publicacion' => ['required', 'date'],
            // La columna no admite nulos: toda actividad ocurre un día.
            'fecha_evento' => ['required', 'date'],
            'estado_id' => ['required', Rule::exists(EstadoPublicacion::class, 'id')],
            'visibilidad_id' => ['required', Rule::exists(Visibilidad::class, 'id')],
            'autor_visible' => ['required', 'string', 'max:255'],
            'categorias' => ['array'],
            'categorias.*' => [Rule::exists(Categoria::class, 'id')],

            'secciones' => ['array', 'max:30'],
            'secciones.*.titulo' => ['required', 'string', 'max:255'],
            'secciones.*.contenido' => ['required', 'string'],

            'archivos' => ['array', 'max:30'],
            'archivos.*.nombre' => ['required', 'string', 'max:255'],
            'archivos.*.archivo_url' => ['required', 'string', 'max:500'],
            'archivos.*.tipo' => ['nullable', 'string', 'max:50'],
        ];
    }

    /**
     * El cuerpo y el contenido de cada sección salen del editor enriquecido y
     * acaban pintados con dangerouslySetInnerHTML, así que se sanean aquí.
     *
     * @return array<string, mixed>
     */
    public function validated($key = null, $default = null): mixed
    {
        $datos = parent::validated();

        $datos['descripcion'] = HtmlSeguro::limpiar($datos['descripcion'] ?? null);

        $datos['secciones'] = array_map(
            fn (array $seccion): array => [
                ...$seccion,
                'contenido' => HtmlSeguro::limpiar($seccion['contenido'] ?? null),
            ],
            $datos['secciones'] ?? [],
        );

        if ($key !== null) {
            return data_get($datos, $key, $default);
        }

        return $datos;
    }

    protected function prepareForValidation(): void
    {
        if (blank($this->input('autor_visible'))) {
            $this->merge(['autor_visible' => 'Cámara']);
        }
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'titulo' => 'título',
            'descripcion' => 'descripción',
            'fecha_publicacion' => 'fecha de publicación',
            'fecha_evento' => 'fecha del evento',
            'estado_id' => 'estado',
            'visibilidad_id' => 'visibilidad',
            'autor_visible' => 'autor',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'secciones.*.titulo.required' => 'Cada sección necesita un título.',
            'secciones.*.contenido.required' => 'Cada sección necesita contenido.',
            'archivos.*.nombre.required' => 'Cada archivo necesita un nombre.',
            'archivos.*.archivo_url.required' => 'Cada archivo necesita su dirección.',
        ];
    }
}
