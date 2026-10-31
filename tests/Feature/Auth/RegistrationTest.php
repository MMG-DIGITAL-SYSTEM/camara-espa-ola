<?php

use App\Enums\Rol as RolEnum;
use App\Models\User;

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('new users can register', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('home'));
});

test('el registro público asigna el rol Usuario, sin acceso al panel', function () {
    $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $usuario = User::where('email', 'test@example.com')->sole();

    expect($usuario->rolEnum())->toBe(RolEnum::Usuario)
        ->and($usuario->esAdmin())->toBeFalse()
        ->and($usuario->accedeAlPanel())->toBeFalse();
});
