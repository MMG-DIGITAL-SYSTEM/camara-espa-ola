<?php

namespace Database\Factories;

use App\Models\Pagina;
use App\Models\PaginaSeccion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PaginaSeccion>
 */
class PaginaSeccionFactory extends Factory
{
    protected $model = PaginaSeccion::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'pagina_id' => Pagina::factory(),
            'bloque' => 'texto',
            'nombre' => null,
            'orden' => 0,
            'es_visible' => true,
            'datos' => ['contenido' => '<p>'.fake()->sentence().'</p>'],
            'estilos' => [],
        ];
    }

    public function bloque(string $bloque, array $datos = []): static
    {
        return $this->state(fn (): array => [
            'bloque' => $bloque,
            'datos' => $datos,
        ]);
    }

    public function oculta(): static
    {
        return $this->state(fn (): array => ['es_visible' => false]);
    }
}
