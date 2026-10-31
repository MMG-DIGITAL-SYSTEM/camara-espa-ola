<?php

namespace App\Http\Requests\Admin;

use App\Models\Categoria;
use App\Models\EstadoPublicacion;
use App\Models\Noticia;
use App\Models\Visibilidad;
use App\Support\HtmlSeguro;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class GuardarNoticiaRequest extends FormRequest
{
    public function noticia(): ?Noticia
    {
        return $this->route('noticia');
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('noticias', 'slug')
                    ->ignore($this->noticia()?->id)
                    ->whereNull('deleted_at'),
            ],
            'extracto' => ['nullable', 'string', 'max:500'],
            'descripcion' => ['required', 'string'],
            'imagen' => ['nullable', 'string', 'max:500'],
            'fecha_publicacion' => ['required', 'date'],
            'fecha_evento' => ['nullable', 'date'],
            'estado_id' => ['required', Rule::exists(EstadoPublicacion::class, 'id')],
            'visibilidad_id' => ['required', Rule::exists(Visibilidad::class, 'id')],
            'destacada' => ['required', 'boolean'],
            'categorias' => ['array'],
            'categorias.*' => [Rule::exists(Categoria::class, 'id')],
        ];
    }

    /**
     * El cuerpo llega del editor enriquecido y acaba pintado en el sitio con
     * dangerouslySetInnerHTML, así que se sanea antes de guardarlo.
     *
     * @return array<string, mixed>
     */
    public function validated($key = null, $default = null): mixed
    {
        $datos = parent::validated();

        $datos['descripcion'] = HtmlSeguro::limpiar($datos['descripcion'] ?? null);

        if ($key !== null) {
            return data_get($datos, $key, $default);
        }

        return $datos;
    }

    protected function prepareForValidation(): void
    {
        $slug = $this->string('slug')->trim();

        $this->merge([
            'slug' => Str::slug($slug->isEmpty() ? $this->string('titulo') : $slug),
        ]);
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'titulo' => 'título',
            'slug' => 'dirección',
            'descripcion' => 'contenido',
            'fecha_publicacion' => 'fecha de publicación',
            'fecha_evento' => 'fecha del evento',
            'estado_id' => 'estado',
            'visibilidad_id' => 'visibilidad',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'slug.unique' => 'Ya existe una noticia con esa dirección.',
            'slug.regex' => 'La dirección solo admite minúsculas, números y guiones.',
        ];
    }
}
