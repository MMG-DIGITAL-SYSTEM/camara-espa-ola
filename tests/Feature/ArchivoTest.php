<?php

use App\Support\Archivo;
use Illuminate\Support\Facades\URL;

beforeEach(function () {
    config(['app.url' => 'http://localhost:8000']);
    // Quien navega entra por otra dirección que la de APP_URL.
    URL::forceRootUrl('http://127.0.0.1:8000');
});

test('una ruta del disco se sirve desde storage', function () {
    expect(Archivo::url('fichas-pais/espana.pdf'))
        ->toBe('http://127.0.0.1:8000/storage/fichas-pais/espana.pdf');
});

test('una URL de la biblioteca de medios usa el host de la petición', function () {
    expect(Archivo::url('http://localhost:8000/storage/medios/2026/10/ficha.pdf'))
        ->toBe('http://127.0.0.1:8000/storage/medios/2026/10/ficha.pdf');
});

test('una URL externa se deja tal cual', function () {
    expect(Archivo::url('https://cdn.test/storage/ficha.pdf'))->toBe('https://cdn.test/storage/ficha.pdf')
        ->and(Archivo::url('http://localhost:9999/storage/ficha.pdf'))->toBe('http://localhost:9999/storage/ficha.pdf');
});

test('una URL propia fuera de storage se deja tal cual', function () {
    expect(Archivo::url('http://localhost:8000/socios'))->toBe('http://localhost:8000/socios');
});

test('un valor vacío no tiene URL', function (?string $ruta) {
    expect(Archivo::url($ruta))->toBeNull();
})->with([null, '']);
