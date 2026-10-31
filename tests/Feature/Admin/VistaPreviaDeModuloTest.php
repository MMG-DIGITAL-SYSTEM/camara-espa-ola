<?php

use App\Models\Pagina;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

/*
 * El editor de una página de módulo enseña su contenido propio incrustando la
 * página pública real en modo «solo contenido».
 */

test('el editor de un módulo apunta a la dirección pública real', function () {
    $pagina = Pagina::factory()->deModulo('contacto')->create(['slug' => 'modulo-contacto']);

    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.paginas.edit', $pagina))
        ->assertInertia(fn (Assert $page) => $page
            ->where('pagina.url', url('/contacto'))
            ->where('pagina.es_modulo', true));
});

test('una página libre sigue en su slug y la portada en la raíz', function () {
    expect(Pagina::factory()->make(['slug' => 'quienes-somos'])->urlPublica())->toBe(url('/quienes-somos'))
        ->and(Pagina::factory()->make(['slug' => 'inicio'])->urlPublica())->toBe(url('/'));
});

test('el modo solo contenido es exclusivo de quien accede al panel', function () {
    $this->get('/contacto?solo_contenido=1')
        ->assertInertia(fn (Assert $page) => $page->where('soloContenido', false));

    $this->actingAs(User::factory()->empresa()->create())
        ->get('/contacto?solo_contenido=1')
        ->assertInertia(fn (Assert $page) => $page->where('soloContenido', false));

    $this->actingAs(User::factory()->editor()->create())
        ->get('/contacto?solo_contenido=1')
        ->assertInertia(fn (Assert $page) => $page->where('soloContenido', true));
});
