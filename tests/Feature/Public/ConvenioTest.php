<?php

use App\Models\Convenio;
use Inertia\Testing\AssertableInertia as Assert;

/**
 * @param  array<string, mixed>  $extra
 */
function convenioPublicado(string $nombre, array $extra = []): Convenio
{
    return Convenio::create([
        'nombre' => $nombre,
        'descripcion' => 'Descuentos para los asociados de la Cámara.',
        ...$extra,
    ]);
}

test('la página de convenios usa su vista propia', function () {
    $this->get('/convenios')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Public/Convenios'));
});

test('solo se listan los convenios activos y no eliminados, por orden', function () {
    convenioPublicado('Segundo', ['orden' => 2]);
    convenioPublicado('Primero', ['orden' => 1]);
    convenioPublicado('Inactivo', ['activo' => false]);
    convenioPublicado('Eliminado')->delete();

    $this->getJson('/api/convenios')
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.nombre', 'Primero')
        ->assertJsonPath('data.1.nombre', 'Segundo');
});

test('imagen y PDF salen como URL pública y el correo como correo de contacto', function () {
    convenioPublicado('UNIR - Universidad del Internet', [
        'imagen' => 'convenios/unir.jpg',
        'pdf' => 'convenios/unir.pdf',
        'correo_electronico' => 'contacto@unir.test',
    ]);

    $this->getJson('/api/convenios')
        ->assertJsonPath('data.0.imagen', asset('storage/convenios/unir.jpg'))
        ->assertJsonPath('data.0.pdf_url', asset('storage/convenios/unir.pdf'))
        ->assertJsonPath('data.0.correo_contacto', 'contacto@unir.test')
        ->assertJsonMissingPath('data.0.activo')
        ->assertJsonMissingPath('data.0.created_by');
});

test('sin imagen, PDF ni correo esos campos llegan vacíos', function () {
    convenioPublicado('Sin archivos');

    $this->getJson('/api/convenios')
        ->assertJsonPath('data.0.imagen', null)
        ->assertJsonPath('data.0.pdf_url', null)
        ->assertJsonPath('data.0.correo_contacto', null);
});

test('sin convenios la API devuelve una lista vacía', function () {
    $this->getJson('/api/convenios')
        ->assertOk()
        ->assertJsonCount(0, 'data');
});
