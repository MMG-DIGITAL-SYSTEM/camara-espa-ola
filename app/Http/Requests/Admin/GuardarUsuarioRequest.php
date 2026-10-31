<?php

namespace App\Http\Requests\Admin;

use App\Concerns\ProfileValidationRules;
use App\Enums\Rol as RolEnum;
use App\Models\Rol;
use App\Models\Socio;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class GuardarUsuarioRequest extends FormRequest
{
    use ProfileValidationRules;

    /**
     * Usuario que se está editando, o null si es un alta.
     */
    public function usuario(): ?User
    {
        return $this->route('usuario');
    }

    /**
     * Determina si el rol elegido es el de Empresa.
     */
    public function esCuentaDeEmpresa(): bool
    {
        return Rol::find($this->integer('rol_id'))?->aEnum() === RolEnum::Empresa;
    }

    /**
     * Datos listos para guardar: sin la confirmación de contraseña y sin socio
     * si la cuenta no es de empresa, para que un cambio de rol no lo arrastre.
     *
     * @return array<string, mixed>
     */
    public function datosDeUsuario(): array
    {
        return [
            ...$this->safe()->except('password_confirmation'),
            'socio_id' => $this->esCuentaDeEmpresa() ? $this->validated('socio_id') : null,
        ];
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $esAlta = $this->usuario() === null;

        return [
            ...$this->profileRules($this->usuario()?->id),
            'rol_id' => ['required', Rule::exists(Rol::class, 'id')],
            // Una cuenta de empresa publica en nombre de un socio concreto.
            'socio_id' => [
                Rule::requiredIf(fn (): bool => $this->esCuentaDeEmpresa()),
                'nullable',
                Rule::exists(Socio::class, 'id')->whereNull('deleted_at'),
            ],
            'activo' => ['required', 'boolean'],
            // Al editar, dejar la contraseña vacía significa «no cambiarla».
            'password' => [
                $esAlta ? 'required' : 'nullable',
                'string',
                Password::default(),
                'confirmed',
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'nombre',
            'email' => 'correo electrónico',
            'rol_id' => 'rol',
            'socio_id' => 'empresa',
            'password' => 'contraseña',
        ];
    }
}
