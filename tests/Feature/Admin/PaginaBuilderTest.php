<?php

use App\Models\Pagina;
use App\Models\User;
use Database\Factories\PaginaSeccionFactory;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->editor = User::factory()->editor()->create();
});

/**
 * Sección tal y como la manda el editor.
 *
 * @param  array<string, mixed>  $extra
 * @return array<string, mixed>
 */
function seccionEnviada(string $clave, string $bloque = 'texto', array $extra = []): array
{
    return [
        'clave' => $clave,
        'bloque' => $bloque,
        'nombre' => null,
        'es_visible' => true,
        'datos' => [],
        'estilos' => [],
        ...$extra,
    ];
}

// ============================================================
// ACCESO Y LISTADO
// ============================================================

test('un usuario sin acceso al panel no entra al constructor', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('admin.paginas.index'))
        ->assertForbidden();
});

test('el editor ve el listado con el estado de cada página', function () {
    $publicada = Pagina::factory()->create(['titulo' => 'Afíliate']);
    PaginaSeccionFactory::new()->create(['pagina_id' => $publicada->id]);
    $publicada->publicar();

    Pagina::factory()->create(['titulo' => 'Borrador']);

    $this->actingAs($this->editor)
        ->get(route('admin.paginas.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Paginas/Index')
            ->has('paginas.data', 2)
            ->where('paginas.data.0.titulo', 'Afíliate')
            ->where('paginas.data.0.publicada', true)
            ->where('paginas.data.0.sin_publicar', false)
            ->where('paginas.data.0.secciones', 1)
            ->where('paginas.data.1.publicada', false));
});

// ============================================================
// CREAR
// ============================================================

test('crear una página lleva directamente a su editor', function () {
    $this->actingAs($this->editor)
        ->post(route('admin.paginas.store'), ['titulo' => 'Trabaja con nosotros', 'slug' => ''])
        ->assertRedirect(route('admin.paginas.edit', 'trabaja-con-nosotros'));

    expect(Pagina::where('slug', 'trabaja-con-nosotros')->exists())->toBeTrue();
});

test('el slug se normaliza a partir del título', function (string $titulo, string $esperado) {
    $this->actingAs($this->editor)
        ->post(route('admin.paginas.store'), ['titulo' => $titulo, 'slug' => '']);

    expect(Pagina::where('slug', $esperado)->exists())->toBeTrue();
})->with([
    ['Afíliate Ya', 'afiliate-ya'],
    ['  Quiénes Somos  ', 'quienes-somos'],
    ['Ficha País 2026', 'ficha-pais-2026'],
]);

test('no se puede robar la dirección de una ruta fija', function (string $slug) {
    $this->actingAs($this->editor)
        ->post(route('admin.paginas.store'), ['titulo' => 'Intento', 'slug' => $slug])
        ->assertSessionHasErrors('slug');
})->with(['admin', 'socios', 'noticias', 'api', 'la-camara', 'contacto']);

test('no se puede repetir la dirección de otra página', function () {
    Pagina::factory()->create(['slug' => 'preguntas-frecuentes']);

    $this->actingAs($this->editor)
        ->post(route('admin.paginas.store'), ['titulo' => 'Otras preguntas', 'slug' => 'preguntas-frecuentes'])
        ->assertSessionHasErrors('slug');
});

// ============================================================
// EDITOR Y BORRADOR
// ============================================================

test('el editor recibe la página y sus secciones ordenadas', function () {
    $pagina = Pagina::factory()->create(['slug' => 'afiliate']);
    PaginaSeccionFactory::new()->bloque('cta')->create(['pagina_id' => $pagina->id, 'orden' => 1]);
    PaginaSeccionFactory::new()->bloque('hero')->create(['pagina_id' => $pagina->id, 'orden' => 0]);

    $this->actingAs($this->editor)
        ->get(route('admin.paginas.edit', $pagina))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Paginas/Editor')
            ->where('pagina.slug', 'afiliate')
            ->has('secciones', 2)
            ->where('secciones.0.bloque', 'hero')
            ->where('secciones.1.bloque', 'cta'));
});

test('guardar el borrador crea, actualiza y borra en una sola petición', function () {
    $pagina = Pagina::factory()->create();
    $existente = PaginaSeccionFactory::new()
        ->bloque('texto', ['contenido' => '<p>Vieja</p>'])
        ->create(['pagina_id' => $pagina->id, 'orden' => 0]);
    $aBorrar = PaginaSeccionFactory::new()->create(['pagina_id' => $pagina->id, 'orden' => 1]);

    $respuesta = $this->actingAs($this->editor)
        ->putJson(route('admin.paginas.borrador', $pagina), [
            'secciones' => [
                seccionEnviada('c1', 'hero', ['datos' => ['titulo' => 'Nueva portada']]),
                seccionEnviada('c2', 'texto', [
                    'id' => $existente->id,
                    'datos' => ['contenido' => '<p>Actualizada</p>'],
                ]),
            ],
        ])
        ->assertOk();

    $secciones = $pagina->fresh()->secciones()->get();

    expect($secciones)->toHaveCount(2)
        // El orden lo fija la posición en el array, no lo que mande el cliente.
        ->and($secciones[0]->bloque)->toBe('hero')
        ->and($secciones[0]->orden)->toBe(0)
        ->and($secciones[1]->id)->toBe($existente->id)
        ->and($secciones[1]->datos['contenido'])->toBe('<p>Actualizada</p>')
        ->and($secciones[1]->orden)->toBe(1);

    // La que no vino en la petición se eliminó.
    $this->assertDatabaseMissing('pagina_secciones', ['id' => $aBorrar->id]);

    // El mapa permite al editor conocer el id de la sección nueva.
    $mapa = $respuesta->json('mapa');
    expect($mapa)->toHaveKeys(['c1', 'c2'])
        ->and($mapa['c1'])->toBe($secciones[0]->id)
        ->and($mapa['c2'])->toBe($existente->id);
});

test('guardar un borrador vacío deja la página sin secciones', function () {
    $pagina = Pagina::factory()->create();
    PaginaSeccionFactory::new()->create(['pagina_id' => $pagina->id]);

    $this->actingAs($this->editor)
        ->putJson(route('admin.paginas.borrador', $pagina), ['secciones' => []])
        ->assertOk();

    expect($pagina->fresh()->secciones()->count())->toBe(0);
});

test('el borrador sanea el HTML que llega del editor', function () {
    $pagina = Pagina::factory()->create();

    $this->actingAs($this->editor)
        ->putJson(route('admin.paginas.borrador', $pagina), [
            'secciones' => [
                seccionEnviada('c1', 'texto', [
                    'datos' => ['contenido' => '<p>Hola</p><script>alert(1)</script>'],
                ]),
            ],
        ])
        ->assertOk();

    expect($pagina->fresh()->secciones()->first()->datos['contenido'])
        ->toBe('<p>Hola</p>');
});

test('el lienzo guarda sus elementos y descarta los desconocidos', function () {
    $pagina = Pagina::factory()->create();

    $this->actingAs($this->editor)
        ->putJson(route('admin.paginas.borrador', $pagina), [
            'secciones' => [
                seccionEnviada('c1', 'lienzo', [
                    'datos' => [
                        'separacion' => 'normal',
                        'elementos' => [
                            [
                                'clave' => 'e1',
                                'elemento' => 'tarjeta',
                                'ancho' => 'tercio',
                                'datos' => ['titulo' => 'Asesoría'],
                            ],
                            [
                                'clave' => 'e2',
                                'elemento' => 'parrafo',
                                'ancho' => 'completo',
                                'datos' => ['contenido' => '<p>Hola</p><script>alert(1)</script>'],
                            ],
                            ['clave' => 'e3', 'elemento' => 'retirado', 'datos' => []],
                        ],
                    ],
                ]),
            ],
        ])
        ->assertOk();

    $elementos = $pagina->fresh()->secciones()->first()->datos['elementos'];

    expect($elementos)->toHaveCount(2)
        ->and($elementos[0]['datos']['titulo'])->toBe('Asesoría')
        ->and($elementos[0]['ancho'])->toBe('tercio')
        ->and($elementos[1]['datos']['contenido'])->toBe('<p>Hola</p>');
});

test('un bloque que no existe en el catálogo se rechaza', function () {
    $pagina = Pagina::factory()->create();

    $this->actingAs($this->editor)
        ->putJson(route('admin.paginas.borrador', $pagina), [
            'secciones' => [seccionEnviada('c1', 'bloque-inventado')],
        ])
        ->assertJsonValidationErrors('secciones.0.bloque');
});

test('un estilo fuera de las opciones se rechaza', function () {
    $pagina = Pagina::factory()->create();

    $this->actingAs($this->editor)
        ->putJson(route('admin.paginas.borrador', $pagina), [
            'secciones' => [
                seccionEnviada('c1', 'hero', ['estilos' => ['fondo' => 'fucsia']]),
            ],
        ])
        ->assertJsonValidationErrors('secciones.0.estilos.fondo');
});

test('no se pueden adoptar secciones de otra página', function () {
    $ajena = Pagina::factory()->create();
    $seccionAjena = PaginaSeccionFactory::new()->create(['pagina_id' => $ajena->id]);

    $pagina = Pagina::factory()->create();

    $this->actingAs($this->editor)
        ->putJson(route('admin.paginas.borrador', $pagina), [
            'secciones' => [seccionEnviada('c1', 'hero', ['id' => $seccionAjena->id])],
        ])
        ->assertOk();

    // Se creó una sección nueva en vez de robar la ajena.
    expect($pagina->fresh()->secciones()->first()->id)->not->toBe($seccionAjena->id)
        ->and($ajena->fresh()->secciones()->count())->toBe(1);
});

// ============================================================
// PUBLICAR, HISTORIAL Y REVERTIR
// ============================================================

test('publicar deja la página visible para el público', function () {
    $pagina = Pagina::factory()->create(['slug' => 'trabaja-con-nosotros']);
    PaginaSeccionFactory::new()->bloque('hero', ['titulo' => 'Hola'])->create(['pagina_id' => $pagina->id]);

    $this->get('/trabaja-con-nosotros')->assertNotFound();

    $this->actingAs($this->editor)
        ->post(route('admin.paginas.publicar', $pagina), ['etiqueta' => 'Primera'])
        ->assertInertiaFlash('toast.type', 'success');

    $this->get('/trabaja-con-nosotros')->assertOk();

    expect($pagina->fresh()->versionPublicada->etiqueta)->toBe('Primera')
        ->and($pagina->fresh()->versionPublicada->created_by)->toBe($this->editor->id);
});

test('el historial lista las versiones y señala la publicada', function () {
    $pagina = Pagina::factory()->create();
    $seccion = PaginaSeccionFactory::new()->create(['pagina_id' => $pagina->id]);

    $primera = $pagina->publicar($this->editor, 'Uno');
    $seccion->update(['datos' => ['contenido' => '<p>Cambio</p>']]);
    $segunda = $pagina->publicar($this->editor, 'Dos');

    $respuesta = $this->actingAs($this->editor)
        ->getJson(route('admin.paginas.versiones', $pagina))
        ->assertOk();

    $versiones = collect($respuesta->json('versiones'));

    expect($versiones)->toHaveCount(2)
        ->and($versiones->firstWhere('id', $segunda->id)['es_la_publicada'])->toBeTrue()
        ->and($versiones->firstWhere('id', $primera->id)['es_la_publicada'])->toBeFalse()
        ->and($versiones->first()['autor'])->toBe($this->editor->name);
});

test('revertir restaura el borrador sin cambiar lo publicado', function () {
    $pagina = Pagina::factory()->create(['slug' => 'historia']);
    $seccion = PaginaSeccionFactory::new()
        ->bloque('texto', ['contenido' => '<p>Uno</p>'])
        ->create(['pagina_id' => $pagina->id]);

    $primera = $pagina->publicar($this->editor);

    $seccion->update(['datos' => ['contenido' => '<p>Dos</p>']]);
    $pagina->publicar($this->editor);

    $this->actingAs($this->editor)
        ->post(route('admin.paginas.revertir', [$pagina, $primera]))
        ->assertInertiaFlash('toast.type', 'success');

    expect($pagina->fresh()->secciones()->first()->datos['contenido'])->toBe('<p>Uno</p>');

    // El público sigue viendo la versión dos hasta que se publique de nuevo.
    $this->get('/historia')
        ->assertInertia(fn (Assert $page) => $page
            ->where('secciones.0.datos.contenido', '<p>Dos</p>'));
});

// ============================================================
// BORRAR
// ============================================================

test('una página de sistema no se puede eliminar', function () {
    $pagina = Pagina::factory()->deSistema()->create();

    $this->actingAs($this->editor)
        ->delete(route('admin.paginas.destroy', $pagina))
        ->assertInertiaFlash('toast.type', 'error');

    expect(Pagina::find($pagina->id))->not->toBeNull();
});

test('una página normal sí se elimina', function () {
    $pagina = Pagina::factory()->create();

    $this->actingAs($this->editor)
        ->delete(route('admin.paginas.destroy', $pagina))
        ->assertInertiaFlash('toast.type', 'success');

    $this->assertSoftDeleted($pagina);
});

test('lo guardado en el editor es lo que ve el público tras publicar', function () {
    $pagina = Pagina::factory()->create(['slug' => 'trabaja-con-nosotros']);

    $this->actingAs($this->editor)->putJson(route('admin.paginas.borrador', $pagina), [
        'secciones' => [seccionEnviada('c1', 'hero', ['datos' => ['titulo' => 'Primera versión']])],
    ])->assertOk();
    $this->actingAs($this->editor)->post(route('admin.paginas.publicar', $pagina));

    // Un cambio posterior: hasta publicar, el público sigue viendo lo anterior.
    $seccion = $pagina->fresh()->secciones()->sole();
    $this->actingAs($this->editor)->putJson(route('admin.paginas.borrador', $pagina), [
        'secciones' => [seccionEnviada('c1', 'hero', ['id' => $seccion->id, 'datos' => ['titulo' => 'Segunda versión']])],
    ])->assertOk()->assertJsonPath('sin_publicar', true);

    auth()->logout();
    $this->get('/trabaja-con-nosotros')
        ->assertInertia(fn (Assert $page) => $page->where('secciones.0.datos.titulo', 'Primera versión'));

    $this->actingAs($this->editor)
        ->post(route('admin.paginas.publicar', $pagina))
        ->assertInertiaFlash('toast.type', 'success');

    auth()->logout();
    $this->get('/trabaja-con-nosotros')
        ->assertInertia(fn (Assert $page) => $page
            ->where('vistaPrevia', false)
            ->where('secciones.0.datos.titulo', 'Segunda versión'));
});
