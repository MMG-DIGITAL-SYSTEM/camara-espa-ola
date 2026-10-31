<?php

namespace Database\Factories;

use App\Models\Pagina;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Pagina>
 */
class PaginaFactory extends Factory
{
    protected $model = Pagina::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $titulo = fake()->unique()->words(3, true);

        return [
            'titulo' => Str::ucfirst($titulo),
            'slug' => Str::slug($titulo),
            'tipo' => Pagina::TIPO_LIBRE,
            'es_sistema' => false,
            'orden' => 0,
        ];
    }

    /**
     * Página de módulo: conserva su vista a medida.
     */
    public function deModulo(string $modulo): static
    {
        return $this->state(fn (): array => [
            'tipo' => Pagina::TIPO_MODULO,
            'modulo' => $modulo,
        ]);
    }

    public function deSistema(): static
    {
        return $this->state(fn (): array => ['es_sistema' => true]);
    }

    /**
     * Crea la página, le añade secciones y la publica.
     */
    public function publicada(): static
    {
        return $this->afterCreating(function (Pagina $pagina): void {
            if ($pagina->secciones()->doesntExist()) {
                PaginaSeccionFactory::new()->create(['pagina_id' => $pagina->id]);
            }

            $pagina->publicar();
        });
    }
}
