<?php

use App\Enums\Rol as RolEnum;
use App\Models\Rol;
use App\Models\User;
use Database\Factories\OfertaEmpleoFactory;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;

function rolId(RolEnum $rol): int
{
    return Rol::where('nombre', $rol->value)->value('id');
}

test('un editor no puede gestionar usuarios', function () {
    $editor = User::factory()->editor()->create();

    $this->actingAs($editor)->get(route('admin.usuarios.index'))->assertForbidden();
    $this->actingAs($editor)->post(route('admin.usuarios.store'))->assertForbidden();
});

test('el administrador ve el listado de usuarios', function () {
    $admin = User::factory()->admin()->create(['name' => 'Ana Admin']);
    User::factory()->create(['name' => 'Beto Usuario']);

    $this->actingAs($admin)
        ->get(route('admin.usuarios.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Usuarios/Index')
            ->has('usuarios.data', 2)
            ->has('roles', 4)
            ->has('socios')
            ->where('usuarios.data.0.name', 'Ana Admin')
            ->where('usuarios.data.0.es_usted', true)
            ->where('usuarios.data.1.es_usted', false));
});

test('el listado se puede filtrar por texto y por rol', function () {
    $admin = User::factory()->admin()->create(['name' => 'Ana Admin']);
    User::factory()->create(['name' => 'Beto Usuario', 'email' => 'beto@ejemplo.test']);
    User::factory()->editor()->create(['name' => 'Carla Editora']);

    $this->actingAs($admin)
        ->get(route('admin.usuarios.index', ['buscar' => 'beto@']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('usuarios.data', 1)
            ->where('usuarios.data.0.name', 'Beto Usuario'));

    $this->actingAs($admin)
        ->get(route('admin.usuarios.index', ['rol' => rolId(RolEnum::Editor)]))
        ->assertInertia(fn (Assert $page) => $page
            ->has('usuarios.data', 1)
            ->where('usuarios.data.0.name', 'Carla Editora'));
});

test('el administrador crea un usuario', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('admin.usuarios.store'), [
            'name' => 'Nueva Editora',
            'email' => 'nueva@camara.test',
            'rol_id' => rolId(RolEnum::Editor),
            'activo' => true,
            'password' => 'contrasena-larga',
            'password_confirmation' => 'contrasena-larga',
        ])
        ->assertRedirect()
        ->assertInertiaFlash('toast.type', 'success');

    $creada = User::where('email', 'nueva@camara.test')->sole();

    expect($creada->rolEnum())->toBe(RolEnum::Editor)
        ->and($creada->accedeAlPanel())->toBeTrue()
        ->and(Hash::check('contrasena-larga', $creada->password))->toBeTrue();
});

test('crear un usuario exige contraseña', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('admin.usuarios.store'), [
            'name' => 'Sin Clave',
            'email' => 'sinclave@camara.test',
            'rol_id' => rolId(RolEnum::Usuario),
            'activo' => true,
        ])
        ->assertSessionHasErrors('password');

    expect(User::where('email', 'sinclave@camara.test')->exists())->toBeFalse();
});

test('una cuenta de empresa necesita un socio asignado', function () {
    $admin = User::factory()->admin()->create();
    $socio = OfertaEmpleoFactory::socioActivo('Constructora Andina');

    $datos = [
        'name' => 'RRHH Andina',
        'email' => 'rrhh@andina.test',
        'rol_id' => rolId(RolEnum::Empresa),
        'activo' => true,
        'password' => 'contrasena-larga',
        'password_confirmation' => 'contrasena-larga',
    ];

    $this->actingAs($admin)
        ->post(route('admin.usuarios.store'), $datos)
        ->assertSessionHasErrors('socio_id');

    $this->actingAs($admin)
        ->post(route('admin.usuarios.store'), [...$datos, 'socio_id' => $socio->id])
        ->assertSessionHasNoErrors();

    $cuenta = User::where('email', 'rrhh@andina.test')->sole();

    expect($cuenta->socio_id)->toBe($socio->id)
        ->and($cuenta->accedeAlPortalDeEmpresas())->toBeTrue()
        ->and($cuenta->accedeAlPanel())->toBeFalse();
});

test('al dejar de ser empresa la cuenta pierde su socio', function () {
    $admin = User::factory()->admin()->create();
    $cuenta = User::factory()->empresa()->create();

    $this->actingAs($admin)
        ->patch(route('admin.usuarios.update', $cuenta), [
            'name' => $cuenta->name,
            'email' => $cuenta->email,
            'rol_id' => rolId(RolEnum::Usuario),
            'socio_id' => $cuenta->socio_id,
            'activo' => true,
        ])
        ->assertSessionHasNoErrors();

    expect($cuenta->fresh()->socio_id)->toBeNull();
});

test('editar sin contraseña conserva la actual', function () {
    $admin = User::factory()->admin()->create();
    $otro = User::factory()->create(['name' => 'Antes']);
    $claveOriginal = $otro->password;

    $this->actingAs($admin)
        ->patch(route('admin.usuarios.update', $otro), [
            'name' => 'Después',
            'email' => $otro->email,
            'rol_id' => $otro->rol_id,
            'activo' => true,
            'password' => '',
            'password_confirmation' => '',
        ])
        ->assertRedirect();

    expect($otro->fresh()->name)->toBe('Después')
        ->and($otro->fresh()->password)->toBe($claveOriginal);
});

test('el correo no puede repetirse, pero el propio sí se conserva al editar', function () {
    $admin = User::factory()->admin()->create();
    $ocupado = User::factory()->create(['email' => 'ocupado@camara.test']);
    $otro = User::factory()->create();

    $this->actingAs($admin)
        ->patch(route('admin.usuarios.update', $otro), [
            'name' => $otro->name,
            'email' => 'ocupado@camara.test',
            'rol_id' => $otro->rol_id,
            'activo' => true,
        ])
        ->assertSessionHasErrors('email');

    $this->actingAs($admin)
        ->patch(route('admin.usuarios.update', $ocupado), [
            'name' => 'Sigue Ocupado',
            'email' => 'ocupado@camara.test',
            'rol_id' => $ocupado->rol_id,
            'activo' => true,
        ])
        ->assertSessionHasNoErrors();
});

test('el administrador elimina a otro usuario, pero no a sí mismo', function () {
    $admin = User::factory()->admin()->create();
    $otro = User::factory()->create();

    $this->actingAs($admin)
        ->delete(route('admin.usuarios.destroy', $otro))
        ->assertInertiaFlash('toast.type', 'success');

    $this->assertSoftDeleted($otro);

    $this->actingAs($admin)
        ->delete(route('admin.usuarios.destroy', $admin))
        ->assertInertiaFlash('toast.type', 'error');

    expect(User::find($admin->id))->not->toBeNull();
});

test('no se puede dejar el panel sin ningún administrador activo', function () {
    $admin = User::factory()->admin()->create();

    // Degradarlo a Usuario siendo el único administrador.
    $this->actingAs($admin)
        ->patch(route('admin.usuarios.update', $admin), [
            'name' => $admin->name,
            'email' => $admin->email,
            'rol_id' => rolId(RolEnum::Usuario),
            'activo' => true,
        ])
        ->assertStatus(422);

    // Desactivarlo siendo el único administrador.
    $this->actingAs($admin)
        ->patch(route('admin.usuarios.update', $admin), [
            'name' => $admin->name,
            'email' => $admin->email,
            'rol_id' => $admin->rol_id,
            'activo' => false,
        ])
        ->assertStatus(422);

    expect($admin->fresh()->esAdmin())->toBeTrue()
        ->and($admin->fresh()->activo)->toBeTrue();
});

test('con dos administradores sí se puede degradar a uno', function () {
    $admin = User::factory()->admin()->create();
    $segundo = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->patch(route('admin.usuarios.update', $segundo), [
            'name' => $segundo->name,
            'email' => $segundo->email,
            'rol_id' => rolId(RolEnum::Usuario),
            'activo' => true,
        ])
        ->assertSessionHasNoErrors();

    expect($segundo->fresh()->esAdmin())->toBeFalse();
});
