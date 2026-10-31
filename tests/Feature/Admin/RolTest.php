<?php

use App\Enums\Rol as RolEnum;
use App\Models\Rol;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('un editor no puede ver los roles', function () {
    $editor = User::factory()->editor()->create();

    $this->actingAs($editor)->get(route('admin.roles.index'))->assertForbidden();
});

test('el administrador ve los cuatro roles con su alcance y su recuento', function () {
    $admin = User::factory()->admin()->create();
    User::factory()->editor()->create();
    User::factory()->count(2)->create();

    $this->actingAs($admin)
        ->get(route('admin.roles.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Roles/Index')
            ->has('roles', 4)
            ->where('roles.0.nombre', RolEnum::Administrador->value)
            ->where('roles.0.es_administrador', true)
            ->where('roles.0.accede_al_panel', true)
            ->where('roles.0.usuarios', 1)
            ->where('roles.1.accede_al_panel', true)
            ->where('roles.2.nombre', RolEnum::Empresa->value)
            ->where('roles.2.accede_al_panel', false)
            ->where('roles.3.nombre', RolEnum::Usuario->value)
            ->where('roles.3.accede_al_panel', false)
            ->where('roles.3.usuarios', 2)
            ->has('alcances.'.RolEnum::Administrador->value));
});

test('el recuento de usuarios ignora las cuentas eliminadas', function () {
    $admin = User::factory()->admin()->create();
    $borrado = User::factory()->editor()->create();
    $borrado->delete();

    $this->actingAs($admin)
        ->get(route('admin.roles.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('roles.1.nombre', RolEnum::Editor->value)
            ->where('roles.1.usuarios', 0));
});

test('el administrador actualiza la descripción de un rol', function () {
    $admin = User::factory()->admin()->create();
    $rol = Rol::where('nombre', RolEnum::Editor->value)->sole();

    $this->actingAs($admin)
        ->patch(route('admin.roles.update', $rol), [
            'descripcion' => 'Carga noticias y actividades.',
        ])
        ->assertInertiaFlash('toast.type', 'success');

    expect($rol->fresh()->descripcion)->toBe('Carga noticias y actividades.');
});

test('la descripción no puede pasar de 255 caracteres', function () {
    $admin = User::factory()->admin()->create();
    $rol = Rol::where('nombre', RolEnum::Editor->value)->sole();

    $this->actingAs($admin)
        ->patch(route('admin.roles.update', $rol), [
            'descripcion' => str_repeat('a', 256),
        ])
        ->assertSessionHasErrors('descripcion');
});
