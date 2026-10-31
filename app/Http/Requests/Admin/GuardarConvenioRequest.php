<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Crear o editar un convenio. Imagen y PDF llegan como archivos: si no se
 * envía uno nuevo al editar, se conserva el que ya tenía.
 */
class GuardarConvenioRequest extends FormRequest
{
    /**
     * Sin SVG: puede llevar scripts y se mostraría tal cual en el sitio.
     * Se valida por extensión y por MIME real, como en la biblioteca de medios.
     */
    private const IMAGENES = 'jpg,jpeg,png,webp';

    /** Kilobytes. */
    private const PESO_IMAGEN = 4096;

    private const PESO_PDF = 10240;

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:255'],
            'descripcion' => ['required', 'string', 'max:2000'],
            'correo_electronico' => ['nullable', 'string', 'email', 'max:255'],
            'imagen' => [
                'nullable',
                'file',
                'image',
                'extensions:'.self::IMAGENES,
                'mimes:'.self::IMAGENES,
                'max:'.self::PESO_IMAGEN,
            ],
            'pdf' => [
                'nullable',
                'file',
                'extensions:pdf',
                'mimes:pdf',
                'max:'.self::PESO_PDF,
            ],
            'orden' => ['nullable', 'integer', 'min:0'],
            'activo' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * Texto plano: nombre y descripción se pintan como texto en la tarjeta.
     */
    protected function prepareForValidation(): void
    {
        $limpios = [];

        foreach (['nombre', 'descripcion', 'correo_electronico'] as $campo) {
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
            'descripcion' => 'descripción',
            'correo_electronico' => 'correo de contacto',
            'pdf' => 'PDF del convenio',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'imagen.image' => 'La imagen debe ser JPG, PNG o WebP.',
            'imagen.extensions' => 'La imagen debe ser JPG, PNG o WebP.',
            'imagen.mimes' => 'El contenido de la imagen no corresponde con su extensión.',
            'imagen.max' => 'La imagen puede pesar como mucho 4 MB.',
            'pdf.extensions' => 'El detalle del convenio debe ser un PDF.',
            'pdf.mimes' => 'El archivo no es un PDF válido.',
            'pdf.max' => 'El PDF puede pesar como mucho 10 MB.',
        ];
    }
}
