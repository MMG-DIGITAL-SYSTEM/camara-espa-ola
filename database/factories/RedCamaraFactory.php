<?php

namespace Database\Factories;

use App\Models\RedCamara;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RedCamara>
 */
class RedCamaraFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nombre' => 'Cámara de Comercio de '.fake()->city(),
            'pais' => fake()->country(),
            'ciudad' => fake()->city(),
            'correo' => fake()->companyEmail(),
            'pagina_web' => fake()->url(),
            'orden' => 0,
            'activo' => true,
        ];
    }

    public function inactiva(): static
    {
        return $this->state(fn (): array => ['activo' => false]);
    }
}
