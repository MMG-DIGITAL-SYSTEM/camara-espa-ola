<?php

use App\Models\Servicio;
use App\Models\User;

/**
 * @param  array<string, mixed>  $extra
 */
function servicioActivo(string $titulo, array $extra = []): Servicio
{
    return Servicio::create([
        'titulo' => $titulo,
        'contenido' => 'Descripción del servicio.',
        'activo' => true,
        ...$extra,
    ]);
}

// ============================================================
// API PÚBLICA
// ============================================================

test('un servicio con enlace lo devuelve con su texto', function () {
    servicioActivo('Convenios', ['enlace' => '/convenios', 'enlace_texto' => 'Ver convenios']);

    $this->getJson('/api/servicios')
        ->assertJsonPath('data.0.enlace', '/convenios')
        ->assertJsonPath('data.0.enlace_texto', 'Ver convenios');
});

test('sin texto propio el botón dice «Ver más», y sin enlace no hay botón', function () {
    servicioActivo('Con enlace', ['enlace' => '/convenios', 'orden' => 1]);
    servicioActivo('Sin enlace', ['orden' => 2]);

    $this->getJson('/api/servicios')
        ->assertJsonPath('data.0.enlace_texto', 'Ver más')
        ->assertJsonPath('data.1.enlace', null)
        ->assertJsonPath('data.1.enlace_texto', null);
});

test('cada servicio trae su propia imagen, sea de storage o de la biblioteca', function () {
    servicioActivo('Con ruta', ['imagen' => 'servicios/logo.jpg', 'orden' => 1]);
    servicioActivo('Con URL', ['imagen' => 'https://cdn.test/foto.jpg', 'orden' => 2]);
    servicioActivo('Sin imagen', ['orden' => 3]);

    $this->getJson('/api/servicios')
        ->assertJsonPath('data.0.imagen', asset('storage/servicios/logo.jpg'))
        // Una URL de la biblioteca de medios no se prefija con storage.
        ->assertJsonPath('data.1.imagen', 'https://cdn.test/foto.jpg')
        ->assertJsonPath('data.2.imagen', null);
});

// ============================================================
// PANEL
// ============================================================

test('el panel guarda el enlace y el texto del botón', function () {
    $servicio = servicioActivo('Convenios');

    $this->actingAs(User::factory()->editor()->create())
        ->patch(route('admin.servicios.update', $servicio), [
            'titulo' => 'Convenios',
            'contenido' => 'Descuentos para asociados.',
            'enlace' => '/convenios',
            'enlace_texto' => 'Ver convenios',
            'activo' => true,
        ])
        ->assertSessionHasNoErrors();

    expect($servicio->fresh()->only('enlace', 'enlace_texto'))
        ->toBe(['enlace' => '/convenios', 'enlace_texto' => 'Ver convenios']);
});

test('el enlace debe ser una ruta del sitio o una dirección http', function (string $enlace) {
    $servicio = servicioActivo('Convenios');

    $this->actingAs(User::factory()->editor()->create())
        ->patch(route('admin.servicios.update', $servicio), [
            'titulo' => 'Convenios',
            'contenido' => 'x',
            'enlace' => $enlace,
            'activo' => true,
        ])
        ->assertSessionHasErrors('enlace');
})->with([
    'javascript' => 'javascript:alert(1)',
    'sin barra' => 'convenios',
]);
