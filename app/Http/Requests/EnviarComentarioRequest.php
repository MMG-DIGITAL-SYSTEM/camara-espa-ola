<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

/**
 * Comentario de un visitante en una noticia o actividad.
 *
 * Solo se validan los campos que escribe el visitante: el estado y la
 * revisión nunca pasan a `validated()`.
 */
class EnviarComentarioRequest extends FormRequest
{
    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'comentario' => ['required', 'string', 'min:3', 'max:3000'],
            'nombre' => ['required', 'string', 'max:100'],
            'correo' => ['required', 'string', 'email', 'max:255'],
            'web' => ['nullable', 'url:http,https', 'max:255'],
            // Trampa para robots: el campo está oculto, una persona no lo llena.
            'telefono' => ['prohibited'],
        ];
    }

    /**
     * Texto plano: se quitan etiquetas para que nadie cuele marcado en el
     * sitio ni en el panel. A una web sin esquema se le añade https://.
     */
    protected function prepareForValidation(): void
    {
        $limpios = [];

        foreach (['comentario', 'nombre', 'correo', 'web'] as $campo) {
            if (is_string($this->input($campo))) {
                $limpios[$campo] = trim(strip_tags($this->input($campo)));
            }
        }

        $web = $limpios['web'] ?? '';

        if ($web === '') {
            $limpios['web'] = null;
        } elseif (! Str::startsWith(Str::lower($web), ['http://', 'https://'])) {
            $limpios['web'] = 'https://'.$web;
        }

        $this->merge($limpios);
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'comentario.required' => 'Escribe tu comentario.',
            'comentario.min' => 'El comentario es demasiado corto.',
            'comentario.max' => 'El comentario puede tener como mucho 3000 caracteres.',
            'nombre.required' => 'Escribe tu nombre.',
            'nombre.max' => 'El nombre puede tener como mucho 100 caracteres.',
            'correo.required' => 'Escribe tu correo electrónico.',
            'correo.email' => 'Escribe un correo válido, por ejemplo nombre@empresa.com.',
            'web.url' => 'Escribe una dirección web válida, por ejemplo www.empresa.com.',
            'telefono.prohibited' => 'No pudimos enviar el comentario.',
        ];
    }
}
