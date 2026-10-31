<?php

use App\Models\Pagina;
use App\Models\User;
use Database\Factories\PaginaSeccionFactory;
use Inertia\Testing\AssertableInertia as Assert;

/**
 * Crea la página de un módulo con sus secciones, ya publicada.
 *
 * @param  array<int, array{string, array<string, mixed>, string|null}>  $secciones
 */
function paginaDeModulo(string $modulo, array $secciones): Pagina
{
    $pagina = Pagina::factory()->deModulo($modulo)->create([
        'slug' => 'modulo-'.$modulo,
    ]);

    foreach ($secciones as $orden => [$bloque, $datos, $nombre]) {
        PaginaSeccionFactory::new()
            ->bloque($bloque, $datos)
            ->create([
                'pagina_id' => $pagina->id,
                'orden' => $orden,
                'nombre' => $nombre,
            ]);
    }

    $pagina->publicar();

    return $pagina;
}

test('sin página de módulo la vista sigue funcionando y no recibe secciones', function () {
    $this->get('/noticias')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Public/Noticias')
            ->where('seccionesArriba', [])
            ->where('seccionesAbajo', []));
});

test('el separador llamado «listado» reparte las secciones arriba y abajo', function () {
    paginaDeModulo('noticias', [
        ['encabezado', ['titulo' => 'Arriba del listado'], null],
        ['separador', [], 'listado'],
        ['cta', ['titulo' => 'Debajo del listado'], null],
    ]);

    $this->get('/noticias')
        ->assertInertia(fn (Assert $page) => $page
            ->has('seccionesArriba', 1)
            ->where('seccionesArriba.0.datos.titulo', 'Arriba del listado')
            ->has('seccionesAbajo', 1)
            ->where('seccionesAbajo.0.datos.titulo', 'Debajo del listado'));
});

test('sin marcador, todas las secciones van arriba', function () {
    paginaDeModulo('servicios', [
        ['encabezado', ['titulo' => 'Uno'], null],
        ['cta', ['titulo' => 'Dos'], null],
    ]);

    $this->get('/servicios')
        ->assertInertia(fn (Assert $page) => $page
            ->has('seccionesArriba', 2)
            ->where('seccionesAbajo', []));
});

test('el marcador no se pinta como una sección más', function () {
    paginaDeModulo('socios', [
        ['separador', [], 'listado'],
    ]);

    $this->get('/socios')
        ->assertInertia(fn (Assert $page) => $page
            ->where('seccionesArriba', [])
            ->where('seccionesAbajo', []));
});

test('un separador normal sí se pinta', function () {
    paginaDeModulo('socios', [
        ['separador', ['altura' => 40], 'un respiro'],
    ]);

    $this->get('/socios')
        ->assertInertia(fn (Assert $page) => $page->has('seccionesArriba', 1));
});

test('las secciones ocultas no llegan al público', function () {
    $pagina = Pagina::factory()->deModulo('red-camaras')->create(['slug' => 'modulo-red-camaras']);

    PaginaSeccionFactory::new()->bloque('encabezado', ['titulo' => 'Visible'])
        ->create(['pagina_id' => $pagina->id, 'orden' => 0]);
    PaginaSeccionFactory::new()->bloque('cta', ['titulo' => 'Oculta'])->oculta()
        ->create(['pagina_id' => $pagina->id, 'orden' => 1]);

    $pagina->publicar();

    $this->get('/red-camaras')
        ->assertInertia(fn (Assert $page) => $page
            ->has('seccionesArriba', 1)
            ->where('seccionesArriba.0.datos.titulo', 'Visible'));
});

test('el borrador de un módulo solo lo ve quien accede al panel', function () {
    $pagina = Pagina::factory()->deModulo('servicios')->create(['slug' => 'modulo-servicios']);

    PaginaSeccionFactory::new()
        ->bloque('encabezado', ['titulo' => 'Todavía en borrador'])
        ->create(['pagina_id' => $pagina->id]);

    // Sin publicar: el visitante no ve nada añadido.
    $this->get('/servicios')
        ->assertInertia(fn (Assert $page) => $page->where('seccionesArriba', []));

    $this->actingAs(User::factory()->editor()->create())
        ->get('/servicios')
        ->assertInertia(fn (Assert $page) => $page
            ->has('seccionesArriba', 1)
            ->where('seccionesArriba.0.datos.titulo', 'Todavía en borrador'));
});

test('los bloques dinámicos de un módulo llegan con sus datos', function () {
    $pagina = paginaDeModulo('la-camara', [
        ['directorio', ['titulo' => 'Nuestro directorio'], null],
    ]);

    $seccion = $pagina->versionPublicada->snapshot[0];

    $this->get('/la-camara')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Public/Camara')
            ->has('datosBloques.'.$seccion['id'])
            ->has('seccionesArriba', 1));
});

test('cada módulo recibe solo sus propias secciones', function () {
    paginaDeModulo('noticias', [['encabezado', ['titulo' => 'De noticias'], null]]);
    paginaDeModulo('socios', [['encabezado', ['titulo' => 'De socios'], null]]);

    $this->get('/noticias')
        ->assertInertia(fn (Assert $page) => $page
            ->where('seccionesArriba.0.datos.titulo', 'De noticias'));

    $this->get('/socios')
        ->assertInertia(fn (Assert $page) => $page
            ->where('seccionesArriba.0.datos.titulo', 'De socios'));
});
