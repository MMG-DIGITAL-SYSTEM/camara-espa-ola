<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SubirMedioRequest extends FormRequest
{
    /**
     * Tipos admitidos. Se valida por extensión y por MIME real: comprobar solo
     * la extensión dejaría subir un script renombrado a .jpg.
     */
    private const IMAGENES = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];

    private const DOCUMENTOS = ['pdf'];

    /** Kilobytes. */
    private const PESO_MAXIMO = 8192;

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $extensiones = implode(',', [...self::IMAGENES, ...self::DOCUMENTOS]);

        return [
            'archivos' => ['required', 'array', 'max:20'],
            'archivos.*' => [
                'required',
                'file',
                'max:'.self::PESO_MAXIMO,
                'extensions:'.$extensiones,
                'mimes:'.$extensiones,
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'archivos.*.max' => 'Cada archivo puede pesar como mucho 8 MB.',
            'archivos.*.extensions' => 'Solo se admiten imágenes (JPG, PNG, WebP, GIF, SVG) y PDF.',
            'archivos.*.mimes' => 'El contenido del archivo no corresponde con su extensión.',
        ];
    }
}
