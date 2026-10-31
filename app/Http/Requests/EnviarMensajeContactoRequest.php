<?php

namespace App\Http\Requests;

use App\Rules\TelefonoValido;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Formulario público «Conéctate con nosotros».
 *
 * Solo se validan los campos que escribe el visitante: cualquier otro que
 * llegue (estado, comentarios…) se ignora porque nunca pasa a `validated()`.
 */
class EnviarMensajeContactoRequest extends FormRequest
{
    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'necesidad' => ['required', 'string', 'min:10', 'max:2000'],
            'nombre' => ['required', 'string', 'max:150'],
            'empresa' => ['required', 'string', 'max:150'],
            'correo' => ['required', 'string', 'email', 'max:255'],
            'telefono' => ['required', 'string', 'max:25', new TelefonoValido],
            'acepta_privacidad' => ['accepted'],
        ];
    }

    /**
     * El contenido se guarda como texto plano: se quitan etiquetas HTML para
     * que nadie pueda colar marcado en el panel donde se leerán los mensajes.
     */
    protected function prepareForValidation(): void
    {
        $limpios = [];

        foreach (['necesidad', 'nombre', 'empresa', 'correo', 'telefono'] as $campo) {
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
            'necesidad' => 'lo que necesitas',
            'nombre' => 'tu nombre',
            'empresa' => 'la empresa',
            'correo' => 'el email',
            'telefono' => 'el teléfono',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'necesidad.required' => 'Cuéntanos brevemente qué necesitas.',
            'necesidad.min' => 'Danos un poco más de detalle (al menos 10 caracteres).',
            'correo.email' => 'Escribe un email válido, por ejemplo nombre@empresa.com.',
            'acepta_privacidad.accepted' => 'Debes aceptar la Política de Privacidad para enviar el formulario.',
        ];
    }
}
