<?php

use App\Enums\EstadoComentario;
use App\Models\Comentario;
use App\Models\EstadoPublicacion;
use App\Models\Noticia;
use App\Models\User;
use App\Models\Visibilidad;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->editor = User::factory()->editor()->create();

    $this->noticia = Noticia::create([
        'titulo' => 'La Cámara firma un convenio',
        'slug' => 'la-camara-firma-un-convenio',
        'descripcion' => '<p>Detalle.</p>',
        'fecha_publicacion' => now(),
        'estado_id' => EstadoPublicacion::firstOrCreate(['nombre' => 'Publicada'])->id,
        'visibilidad_id' => Visibilidad::firstOrCreate(['nombre' => 'Pública'])->id,
        'destacada' => false,
    ]);
});

test('un usuario sin acceso al panel no modera comentarios', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('admin.comentarios.index'))
        ->assertForbidden();
});

test('el listado trae los comentarios con su publicación y cuántos esperan revisión', function () {
    Comentario::factory()->for($this->noticia, 'contenido')->count(2)->create();
    Comentario::factory()->for($this->noticia, 'contenido')->aprobado()->create();

    $this->actingAs($this->editor)
        ->get(route('admin.comentarios.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Comentarios/Index')
            ->has('comentarios.data', 3)
            ->where('pendientes', 2)
            ->where('comentarios.data.0.en.tipo', 'Noticia')
            ->where('comentarios.data.0.en.titulo', 'La Cámara firma un convenio'));
});

test('el listado se filtra por estado', function () {
    Comentario::factory()->for($this->noticia, 'contenido')->create();
    Comentario::factory()->for($this->noticia, 'contenido')->aprobado()->create();

    $this->actingAs($this->editor)
        ->get(route('admin.comentarios.index', ['estado' => 'aprobado']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('comentarios.data', 1)
            ->where('comentarios.data.0.estado', 'aprobado'));
});

test('aprobar un comentario lo publica y guarda quién lo revisó', function () {
    $comentario = Comentario::factory()->for($this->noticia, 'contenido')->create();

    $this->actingAs($this->editor)
        ->patch(route('admin.comentarios.update', $comentario), ['estado' => 'aprobado'])
        ->assertRedirect();

    $comentario->refresh();

    expect($comentario->estado)->toBe(EstadoComentario::Aprobado)
        ->and($comentario->revisado_por)->toBe($this->editor->id)
        ->and($comentario->revisado_en)->not->toBeNull();

    $this->getJson('/api/noticias/'.$this->noticia->slug)
        ->assertJsonCount(1, 'comentarios');
});

test('rechazar un comentario publicado lo quita del sitio', function () {
    $comentario = Comentario::factory()->for($this->noticia, 'contenido')->aprobado()->create();

    $this->actingAs($this->editor)
        ->patch(route('admin.comentarios.update', $comentario), ['estado' => 'rechazado']);

    $this->getJson('/api/noticias/'.$this->noticia->slug)
        ->assertJsonCount(0, 'comentarios');
});

test('un estado inventado no se acepta', function () {
    $comentario = Comentario::factory()->for($this->noticia, 'contenido')->create();

    $this->actingAs($this->editor)
        ->patch(route('admin.comentarios.update', $comentario), ['estado' => 'destacado'])
        ->assertSessionHasErrors('estado');
});

test('eliminar un comentario lo borra', function () {
    $comentario = Comentario::factory()->for($this->noticia, 'contenido')->create();

    $this->actingAs($this->editor)
        ->delete(route('admin.comentarios.destroy', $comentario))
        ->assertRedirect();

    expect(Comentario::count())->toBe(0);
});
