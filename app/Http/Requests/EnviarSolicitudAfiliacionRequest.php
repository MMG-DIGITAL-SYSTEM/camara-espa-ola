<?php

namespace App\Http\Requests;

use App\Rules\TelefonoValido;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Formulario público de afiliación.
 *
 * Los nombres de campo son los de las columnas de `solicitudes_afiliacion`.
 * Solo se validan los que escribe la empresa: estado, comentarios, revisor o
 * socio_id nunca llegan a `validated()`, así que no se pueden forzar.
 */
class EnviarSolicitudAfiliacionRequest extends FormRequest
{
    /**
     * Campos de texto libre que se limpian de HTML antes de validar.
     *
     * @var array<int, string>
     */
    private const CAMPOS_DE_TEXTO = [
        'nombre_razon_social',
        'representante_legal',
        'escritura_constitucion',
        'nit',
        'direccion',
        'ciudad',
        'telefono',
        'fax',
        'casilla',
        'correo_electronico',
        'pagina_web',
        'representante_camara',
        'cargo',
        'servicios_productos',
    ];

    /**
     * Los límites coinciden con el tamaño de cada columna.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nombre_razon_social' => ['required', 'string', 'max:255'],
            'representante_legal' => ['required', 'string', 'max:255'],
            'escritura_constitucion' => ['required', 'string', 'max:255'],
            // Fecha de constitución: no puede ser futura.
            'fecha' => ['nullable', 'date_format:Y-m-d', 'before_or_equal:today'],
            'nit' => ['nullable', 'string', 'max:30'],
            'direccion' => ['required', 'string', 'max:1000'],
            'ciudad' => ['required', 'string', 'max:255'],
            'telefono' => ['required', 'string', 'max:20', new TelefonoValido],
            'fax' => ['nullable', 'string', 'max:20', new TelefonoValido],
            'casilla' => ['required', 'string', 'max:255'],
            'correo_electronico' => ['required', 'string', 'email', 'max:255'],
            'pagina_web' => ['required', 'string', 'max:255', 'url:http,https'],
            'representante_camara' => ['required', 'string', 'max:255'],
            'cargo' => ['required', 'string', 'max:255'],
            'servicios_productos' => ['required', 'string', 'max:5000'],
        ];
    }

    /**
     * Se guarda texto plano, y la web se completa con https:// cuando la
     * escriben como «www.empresa.com», que es como la anota casi todo el mundo.
     */
    protected function prepareForValidation(): void
    {
        $limpios = [];

        foreach (self::CAMPOS_DE_TEXTO as $campo) {
            if (is_string($this->input($campo))) {
                $limpios[$campo] = trim(strip_tags($this->input($campo)));
            }
        }

        $web = $limpios['pagina_web'] ?? '';

        if ($web !== '' && ! preg_match('#^https?://#i', $web)) {
            $limpios['pagina_web'] = 'https://'.$web;
        }

        $this->merge($limpios);
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'nombre_razon_social' => 'nombre o razón social',
            'representante_legal' => 'representante(s) legal(es)',
            'escritura_constitucion' => 'escritura de constitución',
            'direccion' => 'dirección actual',
            'correo_electronico' => 'correo-e',
            'pagina_web' => 'página web',
            'representante_camara' => 'representante ante la Cámara',
            'servicios_productos' => 'servicios/productos que ofrece',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'fecha.date_format' => 'Escribe una fecha válida.',
            'fecha.before_or_equal' => 'La fecha de constitución no puede ser futura.',
            'correo_electronico.email' => 'Escribe un correo válido, por ejemplo nombre@empresa.com.',
            'pagina_web.url' => 'Escribe una dirección web válida, por ejemplo www.empresa.com.',
        ];
    }
}
