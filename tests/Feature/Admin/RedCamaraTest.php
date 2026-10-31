<?php

use App\Bloques\RegistroDeBloques;
use App\Models\RedCamara;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->editor = User::factory()->editor()->create();
});

/**
 * @param  array<string, mixed>  $extra
 * @return array<string, mixed>
 */
function datosDeRedCamara(array $extra = []): array
{
    return [
        'nombre' => 'Cámara Oficial de Comercio de España en Chile',
        'pais' => 'Chile',
        'ciudad' => 'Santiago',
        'direccion' => 'Av. Andrés Bello 2777',
        'telefono' => '+56 2 2000000',
        'correo' => 'info@camacoes.test',
        'pagina_web' => 'https://camacoes.test',
        'logo' => 'http://localhost/storage/medios/2026/10/camara-chile.png',
        'orden' => 0,
        'activo' => true,
        ...$extra,
    ];
}

test('un usuario sin acceso al panel no entra a la red de cámaras', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('admin.red-camaras.index'))
        ->assertForbidden();
});

test('el listado trae también las cámaras ocultas', function () {
    RedCamara::factory()->create();
    RedCamara::factory()->inactiva()->create();

    $this->actingAs($this->editor)
        ->get(route('admin.red-camaras.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/RedCamaras/Index')
            ->has('camaras.data', 2));
});

test('el listado se filtra por país', function () {
    RedCamara::factory()->create(['pais' => 'Chile']);
    RedCamara::factory()->create(['pais' => 'Perú']);

    $this->actingAs($this->editor)
        ->get(route('admin.red-camaras.index', ['buscar' => 'chile']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('camaras.data', 1)
            ->where('camaras.data.0.pais', 'Chile'));
});

test('crear una cámara la guarda con su autor', function () {
    $this->actingAs($this->editor)
        ->post(route('admin.red-camaras.store'), datosDeRedCamara())
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $camara = RedCamara::sole();

    expect($camara->nombre)->toBe('Cámara Oficial de Comercio de España en Chile')
        ->and($camara->logo)->toBe('http://localhost/storage/medios/2026/10/camara-chile.png')
        ->and($camara->created_by)->toBe($this->editor->id);
});

test('valida el correo y el sitio web', function () {
    $this->actingAs($this->editor)
        ->post(route('admin.red-camaras.store'), datosDeRedCamara([
            'correo' => 'no-es-correo',
            'pagina_web' => 'sin esquema',
        ]))
        ->assertSessionHasErrors(['correo', 'pagina_web']);
});

test('editar una cámara actualiza sus datos', function () {
    $camara = RedCamara::factory()->create();

    $this->actingAs($this->editor)
        ->patch(route('admin.red-camaras.update', $camara), datosDeRedCamara(['ciudad' => 'Valparaíso']))
        ->assertRedirect();

    expect($camara->fresh()->ciudad)->toBe('Valparaíso')
        ->and($camara->fresh()->updated_by)->toBe($this->editor->id);
});

test('eliminar una cámara es un borrado lógico', function () {
    $camara = RedCamara::factory()->create();

    $this->actingAs($this->editor)
        ->delete(route('admin.red-camaras.destroy', $camara))
        ->assertRedirect();

    expect(RedCamara::count())->toBe(0)
        ->and(RedCamara::withTrashed()->count())->toBe(1);
});

test('el sitio solo muestra las cámaras visibles, con su logo', function () {
    RedCamara::factory()->create(['nombre' => 'Visible', 'logo' => 'https://cdn.test/logo.png']);
    RedCamara::factory()->inactiva()->create(['nombre' => 'Oculta']);

    $datos = RegistroDeBloques::datosDe('red-camaras', []);

    expect($datos)->toHaveCount(1)
        ->and($datos[0]['nombre'])->toBe('Visible')
        ->and($datos[0]['logo'])->toBe('https://cdn.test/logo.png');
});
