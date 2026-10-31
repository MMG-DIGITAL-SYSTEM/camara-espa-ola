<?php

use App\Bloques\RegistroDeBloques;
use App\Models\FichaPais;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->editor = User::factory()->editor()->create();
});

/**
 * @param  array<string, mixed>  $extra
 * @return array<string, mixed>
 */
function datosDeFichaPais(array $extra = []): array
{
    return [
        'pais' => 'España',
        'titulo' => 'Ficha país: España',
        'descripcion' => 'Datos económicos y comercio bilateral.',
        'pdf_url' => 'http://localhost/storage/medios/2026/10/espana.pdf',
        'fecha_publicacion' => '2026-10-01',
        'orden' => 0,
        'activo' => true,
        ...$extra,
    ];
}

test('un usuario sin acceso al panel no entra a las fichas país', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('admin.fichas-pais.index'))
        ->assertForbidden();
});

test('el listado trae también las fichas ocultas', function () {
    FichaPais::factory()->create();
    FichaPais::factory()->inactiva()->create();

    $this->actingAs($this->editor)
        ->get(route('admin.fichas-pais.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/FichasPais/Index')
            ->has('fichas.data', 2));
});

test('crear una ficha la guarda con su autor', function () {
    $this->actingAs($this->editor)
        ->post(route('admin.fichas-pais.store'), datosDeFichaPais())
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $ficha = FichaPais::sole();

    expect($ficha->pais)->toBe('España')
        ->and($ficha->pdf_url)->toBe('http://localhost/storage/medios/2026/10/espana.pdf')
        ->and($ficha->created_by)->toBe($this->editor->id);
});

test('el país y el título son obligatorios', function () {
    $this->actingAs($this->editor)
        ->post(route('admin.fichas-pais.store'), datosDeFichaPais(['pais' => '', 'titulo' => '']))
        ->assertSessionHasErrors(['pais', 'titulo']);
});

test('el HTML se quita de los textos', function () {
    $this->actingAs($this->editor)
        ->post(route('admin.fichas-pais.store'), datosDeFichaPais([
            'descripcion' => '<script>alert(1)</script>Mercado abierto',
        ]));

    expect(FichaPais::sole()->descripcion)->toBe('alert(1)Mercado abierto');
});

test('editar una ficha actualiza sus datos', function () {
    $ficha = FichaPais::factory()->create();

    $this->actingAs($this->editor)
        ->patch(route('admin.fichas-pais.update', $ficha), datosDeFichaPais(['pais' => 'Portugal', 'activo' => false]))
        ->assertRedirect();

    $ficha->refresh();

    expect($ficha->pais)->toBe('Portugal')
        ->and($ficha->activo)->toBeFalse()
        ->and($ficha->updated_by)->toBe($this->editor->id);
});

test('eliminar una ficha es un borrado lógico', function () {
    $ficha = FichaPais::factory()->create();

    $this->actingAs($this->editor)
        ->delete(route('admin.fichas-pais.destroy', $ficha))
        ->assertRedirect();

    expect(FichaPais::count())->toBe(0)
        ->and(FichaPais::withTrashed()->count())->toBe(1);
});

test('el sitio solo muestra las fichas visibles, con su PDF', function () {
    FichaPais::factory()->create(['pais' => 'España', 'pdf_url' => 'fichas-pais/espana.pdf']);
    FichaPais::factory()->inactiva()->create(['pais' => 'Oculta']);

    $datos = RegistroDeBloques::datosDe('fichas-pais', []);

    expect($datos)->toHaveCount(1)
        ->and($datos[0]['pais'])->toBe('España')
        ->and($datos[0]['pdf'])->toBe(asset('storage/fichas-pais/espana.pdf'));
});

test('un PDF elegido de la biblioteca se publica tal cual', function () {
    FichaPais::factory()->create(['pdf_url' => 'https://cdn.test/espana.pdf']);

    expect(RegistroDeBloques::datosDe('fichas-pais', [])[0]['pdf'])->toBe('https://cdn.test/espana.pdf');
});
