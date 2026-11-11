<?php

namespace Database\Factories;

use App\Enums\EstadoComentario;
use App\Models\Comentario;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Sin contenido comentado: se crea con `->for($noticia, 'contenido')`.
 *
 * @extends Factory<Comentario>
 */
class ComentarioFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nombre' => fake()->name(),
            'correo' => fake()->safeEmail(),
            'web' => null,
            'contenido_texto' => fake()->sentence(12),
            'estado' => EstadoComentario::Pendiente,
        ];
    }

    public function aprobado(): static
    {
        return $this->state(fn (): array => ['estado' => EstadoComentario::Aprobado]);
    }

    public function rechazado(): static
    {
        return $this->state(fn (): array => ['estado' => EstadoComentario::Rechazado]);
    }
}
