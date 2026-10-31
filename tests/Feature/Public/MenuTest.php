<?php

use App\Models\MenuItem;
use Inertia\Testing\AssertableInertia as Assert;

test('el menú llega al sitio ordenado y con sus submenús', function () {
    $padre = MenuItem::create([
        'ubicacion' => MenuItem::PRINCIPAL,
        'titulo' => 'La Cámara',
        'url' => '/la-camara',
        'orden' => 1,
    ]);

    MenuItem::create([
        'ubicacion' => MenuItem::PRINCIPAL,
        'titulo' => 'Quiénes somos',
        'url' => '/la-camara',
        'padre_id' => $padre->id,
        'orden' => 0,
    ]);

    MenuItem::create([
        'ubicacion' => MenuItem::PRINCIPAL,
        'titulo' => 'Inicio',
        'url' => '/',
        'orden' => 0,
    ]);

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('menus.principal', 2)
            ->where('menus.principal.0.titulo', 'Inicio')
            ->where('menus.principal.1.titulo', 'La Cámara')
            ->has('menus.principal.1.hijos', 1)
            ->where('menus.principal.1.hijos.0.titulo', 'Quiénes somos'));
});

test('las entradas desactivadas no se publican', function () {
    MenuItem::create([
        'ubicacion' => MenuItem::PRINCIPAL,
        'titulo' => 'Visible',
        'url' => '/',
    ]);

    MenuItem::create([
        'ubicacion' => MenuItem::PRINCIPAL,
        'titulo' => 'Escondida',
        'url' => '/',
        'activo' => false,
    ]);

    $this->get('/')
        ->assertInertia(fn (Assert $page) => $page
            ->has('menus.principal', 1)
            ->where('menus.principal.0.titulo', 'Visible'));
});

test('un hijo desactivado no aparece bajo su padre', function () {
    $padre = MenuItem::create([
        'ubicacion' => MenuItem::PRINCIPAL,
        'titulo' => 'Socios',
        'url' => '/socios',
    ]);

    MenuItem::create([
        'ubicacion' => MenuItem::PRINCIPAL,
        'titulo' => 'Oculto',
        'url' => '/x',
        'padre_id' => $padre->id,
        'activo' => false,
    ]);

    $this->get('/')
        ->assertInertia(fn (Assert $page) => $page->where('menus.principal.0.hijos', []));
});

test('cada ubicación trae solo lo suyo', function () {
    MenuItem::create(['ubicacion' => MenuItem::PRINCIPAL, 'titulo' => 'Arriba', 'url' => '/']);
    MenuItem::create(['ubicacion' => MenuItem::PIE, 'titulo' => 'Abajo', 'url' => '/']);

    $this->get('/')
        ->assertInertia(fn (Assert $page) => $page
            ->where('menus.principal.0.titulo', 'Arriba')
            ->where('menus.pie.0.titulo', 'Abajo')
            ->has('menus.principal', 1)
            ->has('menus.pie', 1));
});

test('una entrada sin dirección es solo un desplegable', function () {
    $padre = MenuItem::create([
        'ubicacion' => MenuItem::PRINCIPAL,
        'titulo' => 'España · Bolivia',
        'url' => null,
    ]);

    MenuItem::create([
        'ubicacion' => MenuItem::PRINCIPAL,
        'titulo' => 'Fichas país',
        'url' => '/fichas-pais',
        'padre_id' => $padre->id,
    ]);

    $this->get('/')
        ->assertInertia(fn (Assert $page) => $page
            ->where('menus.principal.0.url', null)
            ->has('menus.principal.0.hijos', 1));
});

test('borrar un padre se lleva sus hijos', function () {
    $padre = MenuItem::create(['ubicacion' => MenuItem::PRINCIPAL, 'titulo' => 'Padre', 'url' => '/']);
    $hijo = MenuItem::create([
        'ubicacion' => MenuItem::PRINCIPAL,
        'titulo' => 'Hijo',
        'url' => '/x',
        'padre_id' => $padre->id,
    ]);

    $padre->delete();

    $this->assertDatabaseMissing('menu_items', ['id' => $hijo->id]);
});
