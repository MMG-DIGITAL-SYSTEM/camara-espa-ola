<?php

use App\Models\Pagina;
use App\Models\User;
use Database\Factories\PaginaSeccionFactory;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

test('publicar congela el borrador en una versión', function () {
    $autor = User::factory()->admin()->create();
    $pagina = Pagina::factory()->create();

    PaginaSeccionFactory::new()
        ->bloque('hero', ['titulo' => 'Original'])
        ->create(['pagina_id' => $pagina->id]);

    $version = $pagina->publicar($autor, 'Primera publicación');

    expect($pagina->fresh()->version_publicada_id)->toBe($version->id)
        ->and($pagina->fresh()->estaPublicada())->toBeTrue()
        ->and($version->etiqueta)->toBe('Primera publicación')
        ->and($version->created_by)->toBe($autor->id)
        ->and($version->snapshot)->toHaveCount(1)
        ->and($version->snapshot[0]['datos']['titulo'])->toBe('Original');
});

test('el snapshot no cambia aunque el borrador siga editándose', function () {
    $pagina = Pagina::factory()->create();
    $seccion = PaginaSeccionFactory::new()
        ->bloque('hero', ['titulo' => 'Original'])
        ->create(['pagina_id' => $pagina->id]);

    $version = $pagina->publicar();

    $seccion->update(['datos' => ['titulo' => 'Editado']]);

    expect($version->fresh()->snapshot[0]['datos']['titulo'])->toBe('Original')
        ->and($pagina->fresh()->secciones()->first()->datos['titulo'])->toBe('Editado');
});

test('detecta cambios sin publicar', function () {
    $pagina = Pagina::factory()->create();

    // Sin secciones y sin publicar: nada que publicar.
    expect($pagina->tieneCambiosSinPublicar())->toBeFalse();

    $seccion = PaginaSeccionFactory::new()
        ->bloque('texto', ['contenido' => '<p>Uno</p>'])
        ->create(['pagina_id' => $pagina->id]);

    expect($pagina->fresh()->tieneCambiosSinPublicar())->toBeTrue();

    $pagina->publicar();
    expect($pagina->fresh()->tieneCambiosSinPublicar())->toBeFalse();

    $seccion->update(['datos' => ['contenido' => '<p>Dos</p>']]);
    expect($pagina->fresh()->tieneCambiosSinPublicar())->toBeTrue();
});

test('añadir u ocultar una sección cuenta como cambio sin publicar', function () {
    $pagina = Pagina::factory()->create();
    $seccion = PaginaSeccionFactory::new()->create(['pagina_id' => $pagina->id]);
    $pagina->publicar();

    $seccion->update(['es_visible' => false]);
    expect($pagina->fresh()->tieneCambiosSinPublicar())->toBeTrue();

    $seccion->update(['es_visible' => true]);
    expect($pagina->fresh()->tieneCambiosSinPublicar())->toBeFalse();

    PaginaSeccionFactory::new()->create(['pagina_id' => $pagina->id, 'orden' => 5]);
    expect($pagina->fresh()->tieneCambiosSinPublicar())->toBeTrue();
});

test('revertir devuelve el borrador a una versión anterior sin publicarla', function () {
    $pagina = Pagina::factory()->create();
    $seccion = PaginaSeccionFactory::new()
        ->bloque('texto', ['contenido' => '<p>Versión uno</p>'])
        ->create(['pagina_id' => $pagina->id]);

    $primera = $pagina->publicar();

    $seccion->update(['datos' => ['contenido' => '<p>Versión dos</p>']]);
    $pagina->publicar();

    $pagina->revertirA($primera);
    $pagina->refresh();

    // El borrador vuelve atrás…
    expect($pagina->secciones()->first()->datos['contenido'])->toBe('<p>Versión uno</p>')
        // …pero lo publicado sigue siendo la versión dos hasta que se publique.
        ->and($pagina->versionPublicada->snapshot[0]['datos']['contenido'])->toBe('<p>Versión dos</p>')
        ->and($pagina->tieneCambiosSinPublicar())->toBeTrue()
        ->and($pagina->versiones()->count())->toBe(2);
});

test('no se puede revertir a una versión de otra página', function () {
    $unaPagina = Pagina::factory()->create();
    PaginaSeccionFactory::new()->create(['pagina_id' => $unaPagina->id]);
    $versionAjena = $unaPagina->publicar();

    $otraPagina = Pagina::factory()->create();

    expect(fn () => $otraPagina->revertirA($versionAjena))
        ->toThrow(NotFoundHttpException::class);
});

test('borrar una página se lleva sus secciones y versiones', function () {
    $pagina = Pagina::factory()->create();
    PaginaSeccionFactory::new()->create(['pagina_id' => $pagina->id]);
    $pagina->publicar();

    $id = $pagina->id;
    $pagina->forceDelete();

    $this->assertDatabaseMissing('pagina_secciones', ['pagina_id' => $id]);
    $this->assertDatabaseMissing('pagina_versiones', ['pagina_id' => $id]);
});
