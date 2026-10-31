<?php

namespace Database\Factories;

use App\Enums\EstadoSolicitudAfiliacion;
use App\Models\SolicitudAfiliacion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SolicitudAfiliacion>
 */
class SolicitudAfiliacionFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $representante = fake()->name();

        return [
            'nombre_razon_social' => fake()->company().' S.R.L.',
            'representante_legal' => $representante,
            'escritura_constitucion' => fake()->numerify('###/20##'),
            'fecha' => fake()->date(),
            'nit' => fake()->numerify('##########'),
            'direccion' => fake()->streetAddress(),
            'ciudad' => fake()->randomElement(['La Paz', 'Santa Cruz', 'Cochabamba']),
            'telefono' => fake()->numerify('+591 7#######'),
            'correo_electronico' => fake()->companyEmail(),
            'pagina_web' => fake()->url(),
            'representante_camara' => $representante,
            'cargo' => 'Gerente General',
            'servicios_productos' => fake()->sentence(),
        ];
    }

    public function enEstado(EstadoSolicitudAfiliacion $estado): static
    {
        return $this->state(fn (): array => ['estado' => $estado]);
    }
}
