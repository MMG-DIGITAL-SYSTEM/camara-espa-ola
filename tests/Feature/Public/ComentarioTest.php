<?php

use App\Enums\EstadoComentario;
use App\Models\Actividad;
use App\Models\Comentario;
use App\Models\EstadoPublicacion;
use App\Models\Noticia;
use App\Models\Visibilidad;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    foreach (['Publicada', 'Borrador'] as $nombre) {
        EstadoPublicacion::firstOrCreate(['nombre' => $nombre]);
    }

    foreach (['Pública', 'Privada'] as $nombre) {
        Visibilidad::firstOrCreate(['nombre' => $nombre]);
    }
});

/**
 * @param  array<string, mixed>  $extra
 */
function noticiaComentable(array $extra = []): Noticia
{
    return Noticia::create([
        'titulo' => 'La Cámara firma un convenio',
        'slug' => 'la-camara-firma-un-convenio',
        'descripcion' => '<p>Detalle.</p>',
        'fecha_publicacion' => now(),
        'estado_id' => EstadoPublicacion::where('nombre', 'Publicada')->value('id'),
        'visibilidad_id' => Visibilidad::where('nombre', 'Pública')->value('id'),
        'destacada' => false,
        ...$extra,
    ]);
}

/**
 * @param  array<string, mixed>  $extra
 */
function actividadComentable(array $extra = []): Actividad
{
    return Actividad::create([
        'titulo' => 'Feria Expocruz',
        'descripcion' => '<p>Detalle.</p>',
        'fecha_publicacion' => now(),
        'fecha_evento' => now()->addMonth(),
        'estado_id' => EstadoPublicacion::where('nombre', 'Publicada')->value('id'),
        'visibilidad_id' => Visibilidad::where('nombre', 'Pública')->value('id'),
        ...$extra,
    ]);
}

/**
 * @param  array<string, mixed>  $extra
 * @return array<string, mixed>
 */
function datosDeComentario(array $extra = []): array
{
    return [
        'comentario' => 'Muy buena iniciativa de la Cámara.',
        'nombre' => 'Ana Pérez',
        'correo' => 'ana@empresa.test',
        'web' => '',
        ...$extra,
    ];
}

// ============================================================
// ENVIAR
// ============================================================

test('un comentario a una noticia entra pendiente', function () {
    $noticia = noticiaComentable();

    $this->postJson(route('api.comentarios.noticia', $noticia->slug), datosDeComentario())
        ->assertCreated()
        ->assertJsonPath('success', true);

    $comentario = Comentario::sole();

    expect($comentario->estado)->toBe(EstadoComentario::Pendiente)
        ->and($comentario->contenido_texto)->toBe('Muy buena iniciativa de la Cámara.')
        ->and($comentario->contenido_type)->toBe('noticia')
        ->and($comentario->contenido_id)->toBe($noticia->id)
        ->and($comentario->web)->toBeNull()
        ->and($comentario->ip)->not->toBeNull();
});

test('un comentario a una actividad entra pendiente', function () {
    $actividad = actividadComentable();

    $this->postJson(route('api.comentarios.actividad', $actividad->id), datosDeComentario())
        ->assertCreated();

    expect(Comentario::sole()->contenido_type)->toBe('actividad');
});

test('nombre, correo y comentario son obligatorios', function () {
    $noticia = noticiaComentable();

    $this->postJson(route('api.comentarios.noticia', $noticia->slug), datosDeComentario([
        'comentario' => '',
        'nombre' => '',
        'correo' => 'no-es-correo',
    ]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['comentario', 'nombre', 'correo']);

    expect(Comentario::count())->toBe(0);
});

test('una web sin https se completa y una inválida se rechaza', function () {
    $noticia = noticiaComentable();

    $this->postJson(route('api.comentarios.noticia', $noticia->slug), datosDeComentario(['web' => 'www.empresa.test']))
        ->assertCreated();

    expect(Comentario::sole()->web)->toBe('https://www.empresa.test');

    $this->postJson(route('api.comentarios.noticia', $noticia->slug), datosDeComentario(['web' => 'no es una web']))
        ->assertJsonValidationErrors('web');
});

test('el HTML se quita del comentario', function () {
    $noticia = noticiaComentable();

    $this->postJson(route('api.comentarios.noticia', $noticia->slug), datosDeComentario([
        'comentario' => '<script>alert(1)</script><b>Hola</b> Cámara',
    ]));

    expect(Comentario::sole()->contenido_texto)->toBe('alert(1)Hola Cámara');
});

test('el visitante no puede publicar su comentario directamente', function () {
    $noticia = noticiaComentable();

    $this->postJson(route('api.comentarios.noticia', $noticia->slug), datosDeComentario([
        'estado' => 'aprobado',
    ]))->assertCreated();

    expect(Comentario::sole()->estado)->toBe(EstadoComentario::Pendiente);
});

test('un robot que llena el campo oculto no deja comentario', function () {
    $noticia = noticiaComentable();

    $this->postJson(route('api.comentarios.noticia', $noticia->slug), datosDeComentario([
        'telefono' => '555-1234',
    ]))->assertUnprocessable();

    expect(Comentario::count())->toBe(0);
});

test('no se puede comentar contenido sin publicar', function () {
    $borrador = EstadoPublicacion::where('nombre', 'Borrador')->value('id');

    $noticia = noticiaComentable(['estado_id' => $borrador]);
    $actividad = actividadComentable(['estado_id' => $borrador]);

    $this->postJson(route('api.comentarios.noticia', $noticia->slug), datosDeComentario())->assertNotFound();
    $this->postJson(route('api.comentarios.actividad', $actividad->id), datosDeComentario())->assertNotFound();
});

test('más de tres comentarios seguidos desde la misma IP se frenan', function () {
    $noticia = noticiaComentable();

    foreach (range(1, 3) as $intento) {
        $this->postJson(route('api.comentarios.noticia', $noticia->slug), datosDeComentario())->assertCreated();
    }

    $this->postJson(route('api.comentarios.noticia', $noticia->slug), datosDeComentario())->assertTooManyRequests();
});

// ============================================================
// LO QUE SE VE EN EL SITIO
// ============================================================

test('la noticia solo muestra los comentarios aprobados y nunca el correo', function () {
    $noticia = noticiaComentable();

    Comentario::factory()->for($noticia, 'contenido')->aprobado()->create(['nombre' => 'Visible', 'correo' => 'secreto@empresa.test']);
    Comentario::factory()->for($noticia, 'contenido')->create(['nombre' => 'Pendiente']);
    Comentario::factory()->for($noticia, 'contenido')->rechazado()->create(['nombre' => 'Rechazado']);

    $this->getJson('/api/noticias/'.$noticia->slug)
        ->assertOk()
        ->assertJsonCount(1, 'comentarios')
        ->assertJsonPath('comentarios.0.nombre', 'Visible')
        ->assertJsonMissingPath('comentarios.0.correo')
        ->assertDontSee('secreto@empresa.test');
});

test('la actividad solo muestra los comentarios aprobados', function () {
    $actividad = actividadComentable();

    Comentario::factory()->for($actividad, 'contenido')->aprobado()->create(['nombre' => 'Visible']);
    Comentario::factory()->for($actividad, 'contenido')->create();

    $this->get('/actividades/'.$actividad->id)
        ->assertInertia(fn (Assert $page) => $page
            ->has('data.comentarios', 1)
            ->where('data.comentarios.0.nombre', 'Visible')
            ->missing('data.comentarios.0.correo'));
});
