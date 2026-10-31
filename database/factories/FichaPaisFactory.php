<?php

namespace Database\Factories;

use App\Models\FichaPais;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FichaPais>
 */
class FichaPaisFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $pais = fake()->unique()->country();

        return [
            'pais' => $pais,
            'titulo' => 'Ficha país: '.$pais,
            'descripcion' => fake()->sentence(),
            'pdf_url' => 'fichas-pais/'.fake()->slug(2).'.pdf',
            'orden' => 0,
            'activo' => true,
            'fecha_publicacion' => now(),
        ];
    }

    public function inactiva(): static
    {
        return $this->state(fn (): array => ['activo' => false]);
    }
}
