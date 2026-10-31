<?php

use App\Models\Categoria;
use App\Models\EstadoPublicacion;
use App\Models\Noticia;
use App\Models\User;
use App\Models\Visibilidad;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->editor = User::factory()->editor()->create();

    foreach (['Publicada', 'Borrador', 'Archivada'] as $nombre) {
        EstadoPublicacion::firstOrCreate(['nombre' => $nombre]);
    }

    foreach (['Pública', 'Privada'] as $nombre) {
        Visibilidad::firstOrCreate(['nombre' => $nombre]);
    }
});

function idEstado(string $nombre): int
{
    return EstadoPublicacion::where('nombre', $nombre)->value('id');
}

function idVisibilidad(string $nombre): int
{
    return Visibilidad::where('nombre', $nombre)->value('id');
}

/**
 * @param  array<string, mixed>  $extra
 * @return array<string, mixed>
 */
function datosDeNoticia(array $extra = []): array
{
    return [
        'titulo' => 'La Cámara firma un convenio',
        'slug' => '',
        'extracto' => 'Un acuerdo con la patronal boliviana.',
        'descripcion' => '<p>El detalle del acuerdo.</p>',
        'fecha_publicacion' => now()->format('Y-m-d\TH:i'),
        'estado_id' => idEstado('Publicada'),
        'visibilidad_id' => idVisibilidad('Pública'),
        'destacada' => false,
        ...$extra,
    ];
}

test('un usuario sin acceso al panel no gestiona noticias', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('admin.noticias.index'))
        ->assertForbidden();
});

test('el listado muestra las noticias con su estado', function () {
    $this->actingAs($this->editor)->post(route('admin.noticias.store'), datosDeNoticia());

    $this->actingAs($this->editor)
        ->get(route('admin.noticias.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Noticias/Index')
            ->has('noticias.data', 1)
            ->where('noticias.data.0.estado', 'Publicada')
            ->has('catalogos.estados')
            ->has('catalogos.visibilidades'));
});

test('crear una noticia genera su dirección a partir del título', function () {
    $this->actingAs($this->editor)
        ->post(route('admin.noticias.store'), datosDeNoticia())
        ->assertInertiaFlash('toast.type', 'success');

    $noticia = Noticia::sole();

    expect($noticia->slug)->toBe('la-camara-firma-un-convenio')
        ->and($noticia->publicado_por)->toBe($this->editor->id);
});

test('una noticia publicada aparece en el sitio', function () {
    $this->actingAs($this->editor)->post(route('admin.noticias.store'), datosDeNoticia());

    // El scope público la ve porque estado y visibilidad se resuelven por nombre.
    expect(Noticia::activas()->count())->toBe(1);

    $this->getJson('/api/noticias')
        ->assertOk()
        ->assertJsonPath('data.0.titulo', 'La Cámara firma un convenio');
});

test('una noticia en borrador no aparece en el sitio', function () {
    $this->actingAs($this->editor)->post(
        route('admin.noticias.store'),
        datosDeNoticia(['estado_id' => idEstado('Borrador')]),
    );

    expect(Noticia::activas()->count())->toBe(0);
});

test('una noticia privada tampoco aparece', function () {
    $this->actingAs($this->editor)->post(
        route('admin.noticias.store'),
        datosDeNoticia(['visibilidad_id' => idVisibilidad('Privada')]),
    );

    expect(Noticia::activas()->count())->toBe(0);
});

test('el contenido se sanea antes de guardarse', function () {
    $this->actingAs($this->editor)->post(route('admin.noticias.store'), datosDeNoticia([
        'descripcion' => '<p>Texto</p><script>alert(1)</script><p onclick="x()">Más</p>',
    ]));

    expect(Noticia::sole()->descripcion)->toBe('<p>Texto</p><p>Más</p>');
});

test('la dirección no se puede repetir', function () {
    $this->actingAs($this->editor)->post(route('admin.noticias.store'), datosDeNoticia());

    $this->actingAs($this->editor)
        ->post(route('admin.noticias.store'), datosDeNoticia(['slug' => 'la-camara-firma-un-convenio']))
        ->assertSessionHasErrors('slug');

    expect(Noticia::count())->toBe(1);
});

test('editar conserva la dirección propia sin chocar consigo misma', function () {
    $this->actingAs($this->editor)->post(route('admin.noticias.store'), datosDeNoticia());
    $noticia = Noticia::sole();

    $this->actingAs($this->editor)
        ->patch(route('admin.noticias.update', $noticia), datosDeNoticia([
            'titulo' => 'Título corregido',
            'slug' => $noticia->slug,
        ]))
        ->assertSessionHasNoErrors();

    expect($noticia->fresh()->titulo)->toBe('Título corregido')
        ->and($noticia->fresh()->slug)->toBe('la-camara-firma-un-convenio');
});

test('las categorías se sincronizan al guardar', function () {
    $una = Categoria::create(['nombre' => 'Economía']);
    $otra = Categoria::create(['nombre' => 'Eventos']);

    $this->actingAs($this->editor)->post(
        route('admin.noticias.store'),
        datosDeNoticia(['categorias' => [$una->id, $otra->id]]),
    );

    $noticia = Noticia::sole();
    expect($noticia->categorias)->toHaveCount(2);

    $this->actingAs($this->editor)->patch(
        route('admin.noticias.update', $noticia),
        datosDeNoticia(['slug' => $noticia->slug, 'categorias' => [$una->id]]),
    );

    expect($noticia->fresh()->categorias->pluck('nombre')->all())->toBe(['Economía']);
});

test('el formulario de edición trae el cuerpo completo', function () {
    $this->actingAs($this->editor)->post(route('admin.noticias.store'), datosDeNoticia());
    $noticia = Noticia::sole();

    $this->actingAs($this->editor)
        ->getJson(route('admin.noticias.show', $noticia))
        ->assertOk()
        ->assertJsonPath('descripcion', '<p>El detalle del acuerdo.</p>')
        ->assertJsonPath('slug', 'la-camara-firma-un-convenio');
});

test('eliminar una noticia la retira del sitio', function () {
    $this->actingAs($this->editor)->post(route('admin.noticias.store'), datosDeNoticia());
    $noticia = Noticia::sole();

    $this->actingAs($this->editor)
        ->delete(route('admin.noticias.destroy', $noticia))
        ->assertInertiaFlash('toast.type', 'success');

    $this->assertSoftDeleted($noticia);
    expect(Noticia::activas()->count())->toBe(0);
});
