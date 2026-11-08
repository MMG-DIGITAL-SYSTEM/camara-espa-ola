<?php

use App\Models\Pagina;
use App\Models\PaginaSeccion;
use App\Models\User;
use Database\Factories\PaginaSeccionFactory;
use Inertia\Testing\AssertableInertia as Assert;

test('una página publicada se sirve por su slug', function () {
    $pagina = Pagina::factory()->create(['slug' => 'trabaja-con-nosotros', 'titulo' => 'Afíliate']);

    PaginaSeccionFactory::new()
        ->bloque('hero', ['titulo' => 'Únete a la Cámara'])
        ->create(['pagina_id' => $pagina->id, 'orden' => 0]);

    $pagina->publicar();

    $this->get('/trabaja-con-nosotros')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Public/Pagina')
            ->where('pagina.titulo', 'Afíliate')
            ->where('vistaPrevia', false)
            ->has('secciones', 1)
            ->where('secciones.0.bloque', 'hero')
            ->where('secciones.0.datos.titulo', 'Únete a la Cámara'));
});

test('las secciones llegan ordenadas y sin las ocultas', function () {
    $pagina = Pagina::factory()->create(['slug' => 'nosotros']);

    PaginaSeccionFactory::new()->bloque('cta')->create(['pagina_id' => $pagina->id, 'orden' => 2]);
    PaginaSeccionFactory::new()->bloque('hero')->create(['pagina_id' => $pagina->id, 'orden' => 0]);
    PaginaSeccionFactory::new()->bloque('texto')->oculta()->create(['pagina_id' => $pagina->id, 'orden' => 1]);

    $pagina->publicar();

    $this->get('/nosotros')
        ->assertInertia(fn (Assert $page) => $page
            ->has('secciones', 2)
            ->where('secciones.0.bloque', 'hero')
            ->where('secciones.1.bloque', 'cta'));
});

test('un borrador da 404 al visitante', function () {
    Pagina::factory()->create(['slug' => 'en-obras']);

    $this->get('/en-obras')->assertNotFound();
});

test('quien accede al panel sí ve el borrador, marcado como vista previa', function () {
    $pagina = Pagina::factory()->create(['slug' => 'en-obras']);
    PaginaSeccionFactory::new()->create(['pagina_id' => $pagina->id]);

    $this->actingAs(User::factory()->editor()->create())
        ->get('/en-obras')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('vistaPrevia', true));

    $this->actingAs(User::factory()->create())
        ->get('/en-obras')
        ->assertNotFound();
});

test('un slug inexistente da 404', function () {
    $this->get('/no-existe-esta-pagina')->assertNotFound();
});

test('la ruta comodín no pisa las rutas fijas', function (string $ruta) {
    // Si el comodín se las tragara, responderían 404 en vez de su vista.
    $this->get($ruta)->assertOk();
})->with(['/', '/socios', '/noticias', '/servicios', '/la-camara']);

test('los bloques dinámicos llegan con sus datos resueltos', function () {
    $pagina = Pagina::factory()->create(['slug' => 'servicios-demo']);

    $seccion = PaginaSeccionFactory::new()
        ->bloque('servicios', ['titulo' => 'Lo que hacemos'])
        ->create(['pagina_id' => $pagina->id]);

    $pagina->publicar();

    $this->get('/servicios-demo')
        ->assertInertia(fn (Assert $page) => $page
            ->has('datos.'.$seccion->id)
            ->where('secciones.0.datos.titulo', 'Lo que hacemos'));
});

test('los bloques estructurales no reciben datos del servidor', function () {
    $pagina = Pagina::factory()->create(['slug' => 'solo-texto']);
    PaginaSeccionFactory::new()->bloque('texto')->create(['pagina_id' => $pagina->id]);
    $pagina->publicar();

    $this->get('/solo-texto')
        ->assertInertia(fn (Assert $page) => $page->where('datos', []));
});

test('el público ve lo publicado aunque el borrador haya cambiado', function () {
    $pagina = Pagina::factory()->create(['slug' => 'historia']);

    $seccion = PaginaSeccionFactory::new()
        ->bloque('texto', ['contenido' => '<p>Versión publicada</p>'])
        ->create(['pagina_id' => $pagina->id]);

    $pagina->publicar();

    $seccion->update(['datos' => ['contenido' => '<p>Borrador nuevo</p>']]);

    $this->get('/historia')
        ->assertInertia(fn (Assert $page) => $page
            ->where('secciones.0.datos.contenido', '<p>Versión publicada</p>'));

    $this->actingAs(User::factory()->admin()->create())
        ->get('/historia?borrador=1')
        ->assertInertia(fn (Assert $page) => $page
            ->where('secciones.0.datos.contenido', '<p>Borrador nuevo</p>')
            ->where('vistaPrevia', true));
});

test('la sección se guarda con datos y estilos como jsonb', function () {
    $pagina = Pagina::factory()->create();

    $seccion = PaginaSeccion::create([
        'pagina_id' => $pagina->id,
        'bloque' => 'hero',
        'datos' => ['titulo' => 'Hola', 'boton_enlace' => '/afiliate'],
        'estilos' => ['fondo' => 'oscuro', 'espaciado' => 'amplio'],
    ]);

    expect($seccion->fresh()->datos)->toBe(['titulo' => 'Hola', 'boton_enlace' => '/afiliate'])
        ->and($seccion->fresh()->estilos)->toBe(['fondo' => 'oscuro', 'espaciado' => 'amplio']);
});

test('la portada se cae a la vista mínima si no hay página de inicio', function () {
    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Public/Home'));
});

test('la portada usa el constructor cuando existe la página de inicio', function () {
    $pagina = Pagina::factory()->create(['slug' => 'inicio', 'titulo' => 'Inicio']);

    PaginaSeccionFactory::new()
        ->bloque('hero', ['titulo' => 'Cámara Española'])
        ->create(['pagina_id' => $pagina->id]);

    $pagina->publicar();

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Public/Pagina')
            ->where('secciones.0.datos.titulo', 'Cámara Española'));
});

test('una portada en borrador no se muestra al visitante, pero sí al editor', function () {
    $pagina = Pagina::factory()->create(['slug' => 'inicio']);
    PaginaSeccionFactory::new()->bloque('hero')->create(['pagina_id' => $pagina->id]);

    // Sin publicar: el visitante recibe la portada mínima, no un 404.
    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Public/Home'));

    $this->actingAs(User::factory()->editor()->create())
        ->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Public/Pagina')
            ->where('vistaPrevia', true));
});

test('una imagen guardada con el host de desarrollo se sirve con el de la petición', function () {
    config(['app.url' => 'https://camara.test']);

    $pagina = Pagina::factory()->create(['slug' => 'con-portada']);

    PaginaSeccionFactory::new()
        ->bloque('hero', ['imagen' => 'http://localhost:8000/storage/medios/2026/11/portada.jpg'])
        ->create(['pagina_id' => $pagina->id, 'orden' => 0]);

    $pagina->publicar();

    $this->get('/con-portada')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('secciones.0.datos.imagen', url('/storage/medios/2026/11/portada.jpg')));
});
