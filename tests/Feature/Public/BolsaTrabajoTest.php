<?php

use App\Models\EstadoComercial;
use App\Models\OfertaEmpleo;
use Database\Factories\OfertaEmpleoFactory;
use Inertia\Testing\AssertableInertia as Assert;

test('solo se listan las ofertas publicadas, vigentes y de socios activos', function () {
    $visible = OfertaEmpleo::factory()->create(['titulo' => 'Visible']);
    OfertaEmpleo::factory()->create(['titulo' => 'Cierra hoy', 'fecha_cierre' => today()]);
    OfertaEmpleo::factory()->borrador()->create();
    OfertaEmpleo::factory()->cerrada()->create();
    OfertaEmpleo::factory()->vencida()->create();
    OfertaEmpleo::factory()->create()->delete();

    $inactivo = OfertaEmpleoFactory::socioActivo('Ya no afiliado');
    $inactivo->update(['estado_id' => EstadoComercial::firstOrCreate(['nombre' => 'Inactivo'])->id]);
    OfertaEmpleo::factory()->create(['socio_id' => $inactivo->id]);

    $this->get(route('bolsa-trabajo'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Public/BolsaTrabajo')
            ->has('ofertas.data', 2)
            ->has('seccionesArriba')
            ->where('ofertas.data.1.titulo', 'Visible')
            ->where('ofertas.data.1.empresa.nombre', $visible->socio->nombre));
});

test('el listado se filtra por texto, modalidad y jornada', function () {
    OfertaEmpleo::factory()->create(['titulo' => 'Contador', 'modalidad' => 'remota', 'jornada' => 'completa']);
    OfertaEmpleo::factory()->create(['titulo' => 'Vendedor', 'modalidad' => 'presencial', 'jornada' => 'parcial']);

    $this->get(route('bolsa-trabajo', ['buscar' => 'conta']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('ofertas.data', 1)
            ->where('ofertas.data.0.titulo', 'Contador'));

    $this->get(route('bolsa-trabajo', ['modalidad' => 'presencial']))
        ->assertInertia(fn (Assert $page) => $page->where('ofertas.data.0.titulo', 'Vendedor'));

    $this->get(route('bolsa-trabajo', ['jornada' => 'completa']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('ofertas.data', 1)
            ->where('ofertas.data.0.jornada', 'Tiempo completo'));
});

test('un filtro inventado se rechaza', function () {
    $this->get(route('bolsa-trabajo', ['modalidad' => 'en-la-luna']))
        ->assertSessionHasErrors('modalidad');
});

test('el detalle de una oferta visible muestra cómo postularse', function () {
    $oferta = OfertaEmpleo::factory()->create([
        'correo_postulacion' => 'rrhh@empresa.test',
        'enlace_postulacion' => 'https://empresa.test/empleo',
    ]);

    $this->get(route('bolsa-trabajo.show', $oferta))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Public/BolsaTrabajo/Show')
            ->where('oferta.titulo', $oferta->titulo)
            ->where('oferta.correo_postulacion', 'rrhh@empresa.test')
            ->where('oferta.enlace_postulacion', 'https://empresa.test/empleo'));
});

test('una oferta no visible da 404', function (string $estado) {
    $oferta = OfertaEmpleo::factory()->{$estado}()->create();

    $this->get(route('bolsa-trabajo.show', $oferta))->assertNotFound();
})->with(['borrador', 'cerrada', 'vencida']);
