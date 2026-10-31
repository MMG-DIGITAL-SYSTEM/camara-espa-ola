<?php

use App\Enums\EstadoOferta;
use App\Models\OfertaEmpleo;
use App\Models\User;
use Database\Factories\OfertaEmpleoFactory;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->socio = OfertaEmpleoFactory::socioActivo('Constructora Andina');
    $this->empresa = User::factory()->empresa($this->socio)->create();
});

/**
 * @param  array<string, mixed>  $extra
 * @return array<string, mixed>
 */
function datosDeOferta(array $extra = []): array
{
    return [
        'titulo' => 'Ingeniero civil',
        'descripcion' => '<p>Dirección de obra en Santa Cruz.</p>',
        'area' => 'Ingeniería',
        'ubicacion' => 'Santa Cruz',
        'modalidad' => 'presencial',
        'jornada' => 'completa',
        'salario' => 'A convenir',
        'vacantes' => 2,
        'correo_postulacion' => 'rrhh@andina.test',
        'enlace_postulacion' => '',
        'fecha_cierre' => '',
        'estado' => 'publicada',
        ...$extra,
    ];
}

test('quien no tiene rol de empresa no entra al portal', function (string $estado) {
    $usuario = User::factory()->{$estado}()->create();

    $this->actingAs($usuario)
        ->get(route('empresa.ofertas.index'))
        ->assertForbidden();
})->with(['admin', 'editor', 'desactivado']);

test('una cuenta de empresa sin socio asignado no entra al portal', function () {
    $this->empresa->update(['socio_id' => null]);

    $this->actingAs($this->empresa)
        ->get(route('empresa.ofertas.index'))
        ->assertForbidden();
});

test('un invitado es enviado al login', function () {
    $this->get(route('empresa.ofertas.index'))->assertRedirect(route('login'));
});

test('la empresa solo ve sus propias ofertas', function () {
    OfertaEmpleo::factory()->create(['socio_id' => $this->socio->id, 'titulo' => 'Mía']);
    OfertaEmpleo::factory()->create(['titulo' => 'De otro socio']);

    $this->actingAs($this->empresa)
        ->get(route('empresa.ofertas.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Empresa/Ofertas/Index')
            ->has('ofertas.data', 1)
            ->where('ofertas.data.0.titulo', 'Mía')
            ->has('opciones.modalidades', 3));
});

test('la oferta creada queda a nombre del socio de la cuenta', function () {
    $otroSocio = OfertaEmpleoFactory::socioActivo('Otra');

    $this->actingAs($this->empresa)
        ->post(route('empresa.ofertas.store'), datosDeOferta(['socio_id' => $otroSocio->id]))
        ->assertInertiaFlash('toast.type', 'success');

    $oferta = OfertaEmpleo::sole();

    expect($oferta->socio_id)->toBe($this->socio->id)
        ->and($oferta->estado)->toBe(EstadoOferta::Publicada)
        ->and($oferta->publicada_en)->not->toBeNull()
        ->and($oferta->created_by)->toBe($this->empresa->id);
});

test('un borrador no tiene fecha de publicación hasta que se publica', function () {
    $this->actingAs($this->empresa)
        ->post(route('empresa.ofertas.store'), datosDeOferta(['estado' => 'borrador']));

    $oferta = OfertaEmpleo::sole();
    expect($oferta->publicada_en)->toBeNull();

    $this->actingAs($this->empresa)
        ->patch(route('empresa.ofertas.update', $oferta), datosDeOferta());

    expect($oferta->fresh()->publicada_en)->not->toBeNull();
});

test('la descripción se sanea antes de guardarse', function () {
    $this->actingAs($this->empresa)->post(route('empresa.ofertas.store'), datosDeOferta([
        'descripcion' => '<p>Texto</p><script>alert(1)</script><p onclick="x()">Más</p>',
    ]));

    expect(OfertaEmpleo::sole()->descripcion)->toBe('<p>Texto</p><p>Más</p>');
});

test('hace falta un correo o un enlace para postularse', function () {
    $this->actingAs($this->empresa)
        ->post(route('empresa.ofertas.store'), datosDeOferta(['correo_postulacion' => '', 'enlace_postulacion' => '']))
        ->assertSessionHasErrors('correo_postulacion');

    $this->actingAs($this->empresa)
        ->post(route('empresa.ofertas.store'), datosDeOferta(['correo_postulacion' => '', 'enlace_postulacion' => 'https://andina.test/empleo']))
        ->assertSessionHasNoErrors();
});

test('los valores fuera de las opciones se rechazan', function (string $campo) {
    $this->actingAs($this->empresa)
        ->post(route('empresa.ofertas.store'), datosDeOferta([$campo => 'inventado']))
        ->assertSessionHasErrors($campo);
})->with(['modalidad', 'jornada', 'estado']);

test('la empresa no puede ver, editar ni borrar ofertas ajenas', function () {
    $ajena = OfertaEmpleo::factory()->create(['titulo' => 'Ajena']);

    $this->actingAs($this->empresa)
        ->getJson(route('empresa.ofertas.show', $ajena))
        ->assertForbidden();

    $this->actingAs($this->empresa)
        ->patch(route('empresa.ofertas.update', $ajena), datosDeOferta())
        ->assertForbidden();

    $this->actingAs($this->empresa)
        ->delete(route('empresa.ofertas.destroy', $ajena))
        ->assertForbidden();

    expect($ajena->fresh()->titulo)->toBe('Ajena')
        ->and($ajena->fresh()->trashed())->toBeFalse();
});

test('la empresa edita y elimina sus ofertas', function () {
    $oferta = OfertaEmpleo::factory()->create(['socio_id' => $this->socio->id]);

    $this->actingAs($this->empresa)
        ->getJson(route('empresa.ofertas.show', $oferta))
        ->assertOk()
        ->assertJsonPath('id', $oferta->id);

    $this->actingAs($this->empresa)
        ->patch(route('empresa.ofertas.update', $oferta), datosDeOferta(['titulo' => 'Arquitecto', 'estado' => 'cerrada']))
        ->assertSessionHasNoErrors();

    expect($oferta->fresh())
        ->titulo->toBe('Arquitecto')
        ->estado->toBe(EstadoOferta::Cerrada);

    $this->actingAs($this->empresa)
        ->delete(route('empresa.ofertas.destroy', $oferta))
        ->assertInertiaFlash('toast.type', 'success');

    $this->assertSoftDeleted($oferta);
});
