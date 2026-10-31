<?php

use App\Bloques\PortadasDeModulo;
use App\Bloques\RegistroDeBloques;
use App\Models\Pagina;
use Database\Factories\PaginaSeccionFactory;
use Database\Seeders\PaginasSeeder;
use Inertia\Testing\AssertableInertia as Assert;

/*
 * La portada de cada módulo dejó de estar escrita en su vista: es una sección
 * `portada-modulo` que se edita, oculta o quita desde el editor.
 */

/**
 * Página de módulo publicada con un bloque arriba, el marcador y otro abajo.
 */
function moduloConMarcador(string $modulo): Pagina
{
    $pagina = Pagina::factory()->deModulo($modulo)->create(['slug' => 'modulo-'.$modulo]);

    foreach ([['encabezado', ['titulo' => 'Arriba'], null], ['separador', [], 'listado'], ['cta', ['titulo' => 'Abajo'], null]] as $orden => [$bloque, $datos, $nombre]) {
        PaginaSeccionFactory::new()->bloque($bloque, $datos)->create([
            'pagina_id' => $pagina->id,
            'orden' => $orden,
            'nombre' => $nombre,
        ]);
    }

    $pagina->publicar();

    return $pagina;
}

test('la portada de módulo es un bloque del catálogo', function () {
    expect(RegistroDeBloques::existe(PortadasDeModulo::BLOQUE))->toBeTrue()
        ->and(RegistroDeBloques::necesitaDatos(PortadasDeModulo::BLOQUE))->toBeFalse();
});

test('se añade justo antes del listado, en el borrador y en lo publicado', function () {
    $pagina = moduloConMarcador('actividades');

    expect(PortadasDeModulo::anadirA($pagina))->toBeTrue();

    $pagina->refresh();

    expect(array_column($pagina->snapshotDelBorrador(), 'bloque'))
        ->toBe(['encabezado', 'portada-modulo', 'separador', 'cta'])
        ->and(array_column($pagina->versionPublicada->seccionesVisibles(), 'bloque'))
        ->toBe(['encabezado', 'portada-modulo', 'separador', 'cta'])
        ->and($pagina->tieneCambiosSinPublicar())->toBeFalse();

    $this->get('/actividades')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('seccionesArriba', 2)
            ->where('seccionesArriba.1.bloque', 'portada-modulo')
            ->where('seccionesArriba.1.datos.titulo_destacado', 'Eventos'));
});

test('no publica de paso los cambios pendientes del borrador', function () {
    $pagina = moduloConMarcador('noticias');

    PaginaSeccionFactory::new()->bloque('cta', ['titulo' => 'Sin publicar'])
        ->create(['pagina_id' => $pagina->id, 'orden' => 9]);

    PortadasDeModulo::anadirA($pagina);

    $publicadas = array_column($pagina->refresh()->versionPublicada->snapshot, 'datos');

    expect(array_column($publicadas, 'titulo'))->not->toContain('Sin publicar')
        ->and($pagina->tieneCambiosSinPublicar())->toBeTrue();
});

test('no se duplica ni se añade a módulos sin portada propia', function () {
    $pagina = moduloConMarcador('servicios');

    expect(PortadasDeModulo::anadirA($pagina))->toBeTrue()
        ->and(PortadasDeModulo::anadirA($pagina))->toBeFalse()
        ->and(PortadasDeModulo::anadirA(moduloConMarcador('bolsa-trabajo')))->toBeFalse();

    expect($pagina->secciones()->where('bloque', 'portada-modulo')->count())->toBe(1);
});

test('oculta en el editor, la portada desaparece del sitio', function () {
    $pagina = moduloConMarcador('socios');
    PortadasDeModulo::anadirA($pagina);

    $pagina->secciones()->where('bloque', 'portada-modulo')->update(['es_visible' => false]);
    $pagina->publicar();

    $this->get('/socios')
        ->assertInertia(fn (Assert $page) => $page
            ->has('seccionesArriba', 1)
            ->where('seccionesArriba.0.bloque', 'encabezado'));
});

test('las páginas de módulo sembradas nacen con su portada', function () {
    $this->seed(PaginasSeeder::class);

    $this->get('/la-camara')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('seccionesArriba.0.bloque', 'portada-modulo')
            ->where('seccionesArriba.0.datos.titulo', 'LA CÁMARA OFICIAL'));

    // La bolsa de trabajo no tenía portada a medida: sigue sin ella.
    expect(Pagina::delModulo('bolsa-trabajo')->first()->secciones()->where('bloque', 'portada-modulo')->exists())
        ->toBeFalse();
});

test('la cabecera de contacto es una portada clara y editable', function () {
    $this->seed(PaginasSeeder::class);

    $this->get('/contacto')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('seccionesArriba.0.bloque', 'portada-modulo')
            ->where('seccionesArriba.0.datos.tema', 'claro')
            ->where('seccionesArriba.0.datos.titulo_destacado', 'nosotros'));
});
