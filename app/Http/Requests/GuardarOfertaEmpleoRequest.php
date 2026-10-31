<?php

namespace App\Http\Requests;

use App\Enums\EstadoOferta;
use App\Enums\JornadaLaboral;
use App\Enums\ModalidadTrabajo;
use App\Models\Socio;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Alta y edición de ofertas, desde el panel o desde el portal de empresas.
 *
 * Solo el panel elige el socio: en el portal la oferta es siempre del socio
 * de la cuenta, y un `socio_id` enviado a mano se ignora.
 */
class GuardarOfertaEmpleoRequest extends FormRequest
{
    public function desdeElPanel(): bool
    {
        return $this->routeIs('admin.*');
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            ...($this->desdeElPanel() ? [
                'socio_id' => ['required', Rule::exists(Socio::class, 'id')->whereNull('deleted_at')],
            ] : []),
            'titulo' => ['required', 'string', 'max:255'],
            'descripcion' => ['required', 'string', 'max:20000'],
            'area' => ['nullable', 'string', 'max:120'],
            'ubicacion' => ['nullable', 'string', 'max:120'],
            'modalidad' => ['required', Rule::enum(ModalidadTrabajo::class)],
            'jornada' => ['required', Rule::enum(JornadaLaboral::class)],
            'salario' => ['nullable', 'string', 'max:120'],
            'vacantes' => ['required', 'integer', 'min:1', 'max:999'],
            // Sin una de las dos vías nadie podría postularse.
            'correo_postulacion' => ['nullable', 'required_without:enlace_postulacion', 'email', 'max:255'],
            'enlace_postulacion' => ['nullable', 'url:http,https', 'max:500'],
            'fecha_cierre' => ['nullable', 'date'],
            'estado' => ['required', Rule::enum(EstadoOferta::class)],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'socio_id' => 'empresa',
            'titulo' => 'puesto',
            'descripcion' => 'descripción',
            'area' => 'área',
            'ubicacion' => 'ubicación',
            'correo_postulacion' => 'correo de postulación',
            'enlace_postulacion' => 'enlace de postulación',
            'fecha_cierre' => 'fecha de cierre',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'correo_postulacion.required_without' => 'Indica un correo o un enlace para que los candidatos puedan postularse.',
        ];
    }
}
