<?php

namespace App\Http\Requests\Admin;

use App\Models\Pagina;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class GuardarPaginaRequest extends FormRequest
{
    public function pagina(): ?Pagina
    {
        return $this->route('pagina');
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:160'],
            'slug' => [
                'required',
                'string',
                'max:160',
                // Solo minúsculas, números y guiones: es lo que acepta la ruta
                // comodín que sirve estas páginas.
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                // Estas URLs ya las atiende una ruta fija.
                Rule::notIn($this->slugsReservados()),
                Rule::unique('paginas', 'slug')->ignore($this->pagina()?->id)->whereNull('deleted_at'),
            ],
            'seo_titulo' => ['nullable', 'string', 'max:160'],
            'seo_descripcion' => ['nullable', 'string', 'max:300'],
        ];
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
            'seo_titulo' => 'título SEO',
            'seo_descripcion' => 'descripción SEO',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'slug.not_in' => 'Esa dirección ya la usa una sección fija del sitio.',
            'slug.unique' => 'Ya existe una página con esa dirección.',
            'slug.regex' => 'La dirección solo admite minúsculas, números y guiones.',
        ];
    }

    /**
     * Primer segmento de las rutas fijas: una página no puede robárselas.
     *
     * @return array<int, string>
     */
    private function slugsReservados(): array
    {
        return [
            'admin', 'empresa', 'api', 'settings', 'login', 'register', 'logout',
            'storage', 'build', 'up', 'inicio',
            'socios', 'noticias', 'servicios', 'actividades',
            'la-camara', 'fichas-pais', 'red-camaras', 'contacto', 'convenios', 'afiliate',
            'bolsa-de-trabajo',
        ];
    }
}
