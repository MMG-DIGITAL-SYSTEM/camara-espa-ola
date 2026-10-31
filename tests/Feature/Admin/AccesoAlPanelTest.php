<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('un invitado es enviado al login', function () {
    $this->get(route('admin.dashboard'))->assertRedirect(route('login'));
});

test('un usuario sin rol de panel recibe 403', function () {
    $usuario = User::factory()->create();

    $this->actingAs($usuario)
        ->get(route('admin.dashboard'))
        ->assertForbidden();
});

test('un administrador entra al panel', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Admin/Dashboard'));
});

test('un editor entra al panel', function () {
    $editor = User::factory()->editor()->create();

    $this->actingAs($editor)
        ->get(route('admin.dashboard'))
        ->assertOk();
});

test('una cuenta de empresa no entra al panel', function () {
    $this->actingAs(User::factory()->empresa()->create())
        ->get(route('admin.dashboard'))
        ->assertForbidden();
});

test('una cuenta desactivada no entra al panel aunque sea administradora', function () {
    $admin = User::factory()->admin()->desactivado()->create();

    $this->actingAs($admin)
        ->get(route('admin.dashboard'))
        ->assertForbidden();
});
