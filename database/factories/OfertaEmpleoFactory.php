<?php

namespace Database\Factories;

use App\Enums\EstadoOferta;
use App\Enums\JornadaLaboral;
use App\Enums\ModalidadTrabajo;
use App\Models\EstadoComercial;
use App\Models\OfertaEmpleo;
use App\Models\Socio;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<OfertaEmpleo>
 */
class OfertaEmpleoFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'socio_id' => fn (): int => self::socioActivo()->id,
            'titulo' => fake()->jobTitle(),
            'descripcion' => '<p>'.fake()->paragraph().'</p>',
            'area' => fake()->randomElement(['Administración', 'Ventas', 'Tecnología', 'Logística']),
            'ubicacion' => fake()->randomElement(['La Paz', 'Santa Cruz', 'Cochabamba']),
            'modalidad' => fake()->randomElement(ModalidadTrabajo::cases()),
            'jornada' => fake()->randomElement(JornadaLaboral::cases()),
            'vacantes' => 1,
            'correo_postulacion' => fake()->companyEmail(),
            'estado' => EstadoOferta::Publicada,
        ];
    }

    public function borrador(): static
    {
        return $this->state(fn (): array => ['estado' => EstadoOferta::Borrador]);
    }

    public function cerrada(): static
    {
        return $this->state(fn (): array => ['estado' => EstadoOferta::Cerrada]);
    }

    /**
     * Fecha de cierre ya pasada: sigue publicada pero no debe verse.
     */
    public function vencida(): static
    {
        return $this->state(fn (): array => ['fecha_cierre' => today()->subDay()]);
    }

    /**
     * Socio en estado Activo, el único cuyas ofertas salen en el sitio.
     *
     * Socio no tiene factory propia: se crea aquí con lo mínimo.
     */
    public static function socioActivo(string $nombre = 'Empresa Afiliada'): Socio
    {
        return Socio::create([
            'nombre' => $nombre,
            'slug' => Str::slug($nombre).'-'.Str::lower(Str::random(5)),
            'estado_id' => EstadoComercial::firstOrCreate(['nombre' => 'Activo'])->id,
        ]);
    }
}
