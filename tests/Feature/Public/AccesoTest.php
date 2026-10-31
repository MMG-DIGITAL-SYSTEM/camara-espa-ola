<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

/*
 * La barra del sitio decide qué botones de acceso pintar con `auth.user`:
 * iniciar sesión y registrarse si no hay sesión, y si la hay, el área de cada rol.
 */

test('el visitante llega sin sesión, para ver iniciar sesión y registrarse', function () {
    $this->get(route('servicios'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('auth.user', null));
});

test('las pantallas de iniciar sesión y registrarse están disponibles', function () {
    $this->get(route('login'))->assertOk();
    $this->get(route('register'))->assertOk();
});

test('cada rol recibe a qué área puede entrar', function (string $estado, bool $panel, bool $portal) {
    $usuario = $estado === 'usuario'
        ? User::factory()->create()
        : User::factory()->{$estado}()->create();

    $this->actingAs($usuario)
        ->get(route('servicios'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('auth.user.accede_al_panel', $panel)
            ->where('auth.user.accede_al_portal_de_empresas', $portal));
})->with([
    'administrador' => ['admin', true, false],
    'editor' => ['editor', true, false],
    'empresa' => ['empresa', false, true],
    'usuario' => ['usuario', false, false],
]);
