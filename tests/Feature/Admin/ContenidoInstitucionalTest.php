<?php

use App\Models\ContenidoInstitucional;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->editor = User::factory()->editor()->create();
});

function seccionInstitucional(string $seccion, array $extra = []): ContenidoInstitucional
{
    return ContenidoInstitucional::create([
        'seccion' => $seccion,
        'titulo' => ucfirst($seccion),
        'contenido' => 'Texto de '.$seccion,
        'orden' => 0,
        'activo' => true,
        ...$extra,
    ]);
}

/**
 * @param  array<string, mixed>  $extra
 * @return array<string, mixed>
 */
function datosDeSeccionInstitucional(array $extra = []): array
{
    return [
        'titulo' => 'Estatutos',
        'contenido' => 'La normativa que rige la Cámara.',
        'imagen' => '',
        'pdf' => 'http://localhost/storage/medios/2026/11/estatutos.pdf',
        'activo' => true,
        ...$extra,
    ];
}

test('un usuario sin acceso al panel no entra al contenido institucional', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('admin.contenido-institucional.index'))
        ->assertForbidden();
});

test('el listado trae las secciones y solo estatutos admite PDF', function () {
    seccionInstitucional('mision', ['orden' => 3]);
    seccionInstitucional('estatutos', ['orden' => 5, 'pdf' => 'medios/2026/11/estatutos.pdf']);

    $this->actingAs($this->editor)
        ->get(route('admin.contenido-institucional.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/ContenidoInstitucional/Index')
            ->has('secciones', 2)
            ->where('secciones.0.admite_pdf', false)
            ->where('secciones.1.nombre', 'Estatutos')
            ->where('secciones.1.admite_pdf', true)
            ->where('secciones.1.pdf_url', asset('storage/medios/2026/11/estatutos.pdf')));
});

test('editar una sección guarda el PDF y quién la cambió', function () {
    $estatutos = seccionInstitucional('estatutos');

    $this->actingAs($this->editor)
        ->patch(route('admin.contenido-institucional.update', $estatutos), datosDeSeccionInstitucional())
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $estatutos->refresh();

    expect($estatutos->pdf)->toBe('http://localhost/storage/medios/2026/11/estatutos.pdf')
        ->and($estatutos->contenido)->toBe('La normativa que rige la Cámara.')
        ->and($estatutos->imagen)->toBeNull()
        ->and($estatutos->updated_by)->toBe($this->editor->id);
});

test('el título y el texto son obligatorios', function () {
    $estatutos = seccionInstitucional('estatutos');

    $this->actingAs($this->editor)
        ->patch(route('admin.contenido-institucional.update', $estatutos), datosDeSeccionInstitucional([
            'titulo' => '',
            'contenido' => '',
        ]))
        ->assertSessionHasErrors(['titulo', 'contenido']);
});

test('el HTML se quita del texto', function () {
    $estatutos = seccionInstitucional('estatutos');

    $this->actingAs($this->editor)
        ->patch(route('admin.contenido-institucional.update', $estatutos), datosDeSeccionInstitucional([
            'contenido' => '<script>alert(1)</script>Normativa',
        ]));

    expect($estatutos->fresh()->contenido)->toBe('alert(1)Normativa');
});

test('la página La Cámara recibe el PDF de los estatutos con su dirección pública', function () {
    seccionInstitucional('estatutos', ['pdf' => 'medios/2026/11/estatutos.pdf']);

    $this->get('/la-camara')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Public/Camara')
            ->where('data.estatutos.pdf_url', asset('storage/medios/2026/11/estatutos.pdf')));
});

test('un PDF elegido de la biblioteca de medios llega a la página sin romperse', function () {
    seccionInstitucional('estatutos', ['pdf' => url('/storage/medios/2026/11/estatutos.pdf')]);

    $this->get('/la-camara')
        ->assertInertia(fn (Assert $page) => $page
            ->where('data.estatutos.pdf_url', asset('storage/medios/2026/11/estatutos.pdf')));
});

test('una sección oculta no llega a la página', function () {
    seccionInstitucional('estatutos', ['activo' => false, 'pdf' => 'medios/x.pdf']);

    $this->get('/la-camara')
        ->assertInertia(fn (Assert $page) => $page->where('data.estatutos.pdf_url', null));
});
