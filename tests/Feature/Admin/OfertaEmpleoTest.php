<?php

use App\Enums\EstadoOferta;
use App\Models\OfertaEmpleo;
use App\Models\User;
use Database\Factories\OfertaEmpleoFactory;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->editor = User::factory()->editor()->create();
});

test('una cuenta de empresa no modera la bolsa de trabajo', function () {
    $this->actingAs(User::factory()->empresa()->create())
        ->get(route('admin.bolsa-trabajo.index'))
        ->assertForbidden();
});

test('el panel ve las ofertas de todos los socios y las filtra', function () {
    $andina = OfertaEmpleoFactory::socioActivo('Andina');
    OfertaEmpleo::factory()->create(['socio_id' => $andina->id, 'titulo' => 'Contador']);
    OfertaEmpleo::factory()->borrador()->create(['titulo' => 'Vendedor']);

    $this->actingAs($this->editor)
        ->get(route('admin.bolsa-trabajo.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/BolsaTrabajo/Index')
            ->has('ofertas.data', 2)
            ->has('socios', 2));

    $this->actingAs($this->editor)
        ->get(route('admin.bolsa-trabajo.index', ['socio' => $andina->id]))
        ->assertInertia(fn (Assert $page) => $page
            ->has('ofertas.data', 1)
            ->where('ofertas.data.0.empresa', 'Andina'));

    $this->actingAs($this->editor)
        ->get(route('admin.bolsa-trabajo.index', ['estado' => 'borrador']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('ofertas.data', 1)
            ->where('ofertas.data.0.titulo', 'Vendedor'));
});

test('desde el panel hay que elegir la empresa', function () {
    $socio = OfertaEmpleoFactory::socioActivo();

    $datos = [
        'titulo' => 'Asistente',
        'descripcion' => '<p>Apoyo administrativo.</p>',
        'modalidad' => 'hibrida',
        'jornada' => 'parcial',
        'vacantes' => 1,
        'correo_postulacion' => 'empleo@socio.test',
        'estado' => 'publicada',
    ];

    $this->actingAs($this->editor)
        ->post(route('admin.bolsa-trabajo.store'), $datos)
        ->assertSessionHasErrors('socio_id');

    $this->actingAs($this->editor)
        ->post(route('admin.bolsa-trabajo.store'), [...$datos, 'socio_id' => $socio->id])
        ->assertSessionHasNoErrors();

    expect(OfertaEmpleo::sole()->socio_id)->toBe($socio->id);
});

test('el panel puede cerrar la oferta de cualquier socio', function () {
    $oferta = OfertaEmpleo::factory()->create();

    $this->actingAs($this->editor)
        ->patch(route('admin.bolsa-trabajo.update', $oferta), [
            ...$this->getJson(route('admin.bolsa-trabajo.show', $oferta))->json(),
            'estado' => 'cerrada',
        ])
        ->assertSessionHasNoErrors();

    expect($oferta->fresh()->estado)->toBe(EstadoOferta::Cerrada);
});
