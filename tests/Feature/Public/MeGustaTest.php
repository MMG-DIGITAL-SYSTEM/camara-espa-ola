<?php

use App\Models\Actividad;
use App\Models\EstadoPublicacion;
use App\Models\MeGusta;
use App\Models\Noticia;
use App\Models\Visibilidad;
use App\Support\Visitante;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    foreach (['Publicada', 'Borrador'] as $nombre) {
        EstadoPublicacion::firstOrCreate(['nombre' => $nombre]);
    }

    foreach (['Pública', 'Privada'] as $nombre) {
        Visibilidad::firstOrCreate(['nombre' => $nombre]);
    }

    // Las peticiones JSON de los tests no mandan cookies si no se pide: el
    // navegador sí manda la del visitante, que es del mismo sitio.
    $this->withCredentials();
});

/**
 * @param  array<string, mixed>  $extra
 */
function noticiaParaMeGusta(array $extra = []): Noticia
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
function actividadParaMeGusta(array $extra = []): Actividad
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

// ============================================================
// DAR Y QUITAR
// ============================================================

test('dar me gusta a una noticia la cuenta y deja la cookie del visitante', function () {
    $noticia = noticiaParaMeGusta();

    $this->postJson(route('api.me-gusta.noticia.marcar', $noticia->slug))
        ->assertOk()
        ->assertJson(['le_gusta' => true, 'total' => 1])
        ->assertCookie(Visitante::COOKIE);

    expect($noticia->meGusta()->count())->toBe(1);
});

test('el mismo navegador cuenta una sola vez aunque repita el clic', function () {
    $noticia = noticiaParaMeGusta();
    $navegador = (string) Str::uuid();

    $this->withCookie(Visitante::COOKIE, $navegador)
        ->postJson(route('api.me-gusta.noticia.marcar', $noticia->slug));
    $this->withCookie(Visitante::COOKIE, $navegador)
        ->postJson(route('api.me-gusta.noticia.marcar', $noticia->slug))
        ->assertJson(['le_gusta' => true, 'total' => 1]);

    expect(MeGusta::count())->toBe(1);
});

test('dos navegadores distintos suman dos', function () {
    $noticia = noticiaParaMeGusta();

    foreach ([Str::uuid(), Str::uuid()] as $navegador) {
        $this->withCookie(Visitante::COOKIE, (string) $navegador)
            ->postJson(route('api.me-gusta.noticia.marcar', $noticia->slug));
    }

    expect($noticia->meGusta()->count())->toBe(2);
});

test('quitar el me gusta lo descuenta solo para ese navegador', function () {
    $noticia = noticiaParaMeGusta();
    $mio = (string) Str::uuid();

    $this->withCookie(Visitante::COOKIE, $mio)->postJson(route('api.me-gusta.noticia.marcar', $noticia->slug));
    $this->withCookie(Visitante::COOKIE, (string) Str::uuid())->postJson(route('api.me-gusta.noticia.marcar', $noticia->slug));

    $this->withCookie(Visitante::COOKIE, $mio)
        ->deleteJson(route('api.me-gusta.noticia.quitar', $noticia->slug))
        ->assertOk()
        ->assertJson(['le_gusta' => false, 'total' => 1]);
});

test('en la base se guarda la huella, no el identificador de la cookie', function () {
    $noticia = noticiaParaMeGusta();
    $navegador = (string) Str::uuid();

    $this->withCookie(Visitante::COOKIE, $navegador)
        ->postJson(route('api.me-gusta.noticia.marcar', $noticia->slug));

    expect(MeGusta::sole()->visitante)->toBe(hash('sha256', $navegador))
        ->and(MeGusta::sole()->contenido_type)->toBe('noticia');
});

test('dar y quitar me gusta a una actividad', function () {
    $actividad = actividadParaMeGusta();
    $navegador = (string) Str::uuid();

    $this->withCookie(Visitante::COOKIE, $navegador)
        ->postJson(route('api.me-gusta.actividad.marcar', $actividad->id))
        ->assertJson(['le_gusta' => true, 'total' => 1]);

    $this->withCookie(Visitante::COOKIE, $navegador)
        ->deleteJson(route('api.me-gusta.actividad.quitar', $actividad->id))
        ->assertJson(['le_gusta' => false, 'total' => 0]);

    expect(MeGusta::count())->toBe(0);
});

test('no se puede dar me gusta a contenido sin publicar', function () {
    $borrador = EstadoPublicacion::where('nombre', 'Borrador')->value('id');

    $noticia = noticiaParaMeGusta(['estado_id' => $borrador]);
    $actividad = actividadParaMeGusta(['estado_id' => $borrador]);

    $this->postJson(route('api.me-gusta.noticia.marcar', $noticia->slug))->assertNotFound();
    $this->postJson(route('api.me-gusta.actividad.marcar', $actividad->id))->assertNotFound();

    expect(MeGusta::count())->toBe(0);
});

// ============================================================
// LO QUE VEN LAS PÁGINAS
// ============================================================

test('el listado y el detalle de noticias traen el total y si a este visitante le gusta', function () {
    $noticia = noticiaParaMeGusta();
    $navegador = (string) Str::uuid();

    $this->withCookie(Visitante::COOKIE, $navegador)->postJson(route('api.me-gusta.noticia.marcar', $noticia->slug));
    $this->withCookie(Visitante::COOKIE, (string) Str::uuid())->postJson(route('api.me-gusta.noticia.marcar', $noticia->slug));

    $this->withCookie(Visitante::COOKIE, $navegador)
        ->getJson('/api/noticias')
        ->assertJsonPath('data.0.me_gusta_count', 2)
        ->assertJsonPath('data.0.le_gusta', true);

    // Otro visitante ve el total, pero no lo tiene marcado.
    $this->withCookie(Visitante::COOKIE, (string) Str::uuid())
        ->getJson('/api/noticias/'.$noticia->slug)
        ->assertJsonPath('data.me_gusta_count', 2)
        ->assertJsonPath('data.le_gusta', false);
});

test('el listado y el detalle de actividades traen el total y si a este visitante le gusta', function () {
    $actividad = actividadParaMeGusta();
    $navegador = (string) Str::uuid();

    $this->withCookie(Visitante::COOKIE, $navegador)->postJson(route('api.me-gusta.actividad.marcar', $actividad->id));

    $this->withCookie(Visitante::COOKIE, $navegador)
        ->get('/actividades')
        ->assertInertia(fn (Assert $page) => $page
            ->where('data.data.0.me_gusta_count', 1)
            ->where('data.data.0.le_gusta', true));

    $this->withCookie(Visitante::COOKIE, (string) Str::uuid())
        ->get('/actividades/'.$actividad->id)
        ->assertInertia(fn (Assert $page) => $page
            ->where('data.me_gusta_count', 1)
            ->where('data.le_gusta', false));
});
