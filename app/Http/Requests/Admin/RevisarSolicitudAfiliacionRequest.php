<?php

namespace App\Http\Requests\Admin;

use App\Enums\EstadoSolicitudAfiliacion;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Cambio de estado de una solicitud con la nota interna de quien la revisa.
 * Aprobarla no pasa por aquí: tiene su propia acción, que además crea el socio.
 */
class RevisarSolicitudAfiliacionRequest extends FormRequest
{
    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'estado' => [
                'required',
                Rule::enum(EstadoSolicitudAfiliacion::class)->except(EstadoSolicitudAfiliacion::Aprobada),
            ],
            'comentarios' => ['nullable', 'string', 'max:5000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'estado.enum' => 'Para aprobar la solicitud usa «Aprobar y crear socio».',
        ];
    }
}
