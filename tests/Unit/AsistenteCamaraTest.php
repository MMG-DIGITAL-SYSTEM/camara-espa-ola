<?php

use App\Support\AsistenteCamara;
use Tests\TestCase;

uses(TestCase::class);

test('responde cómo solicitar afiliación con información confirmada', function () {
    $respuesta = (new AsistenteCamara)->responder('¿Cómo puedo afiliar mi empresa?');

    expect($respuesta['respuesta'])
        ->toContain('Para solicitar la afiliación')
        ->toContain('no significa que la afiliación ya esté aprobada')
        ->and($respuesta['enlaces'][0]['url'])->toBe('/afiliate/formulario');
});

test('el mensaje de bienvenida presenta los temas que puede responder', function () {
    $asistente = new AsistenteCamara;

    expect($asistente->responder('Hola')['respuesta'])
        ->toContain('información pública actual')
        ->and($asistente->responder('Hola')['enlaces'])->toBe([]);
});

test('no inventa respuesta para una consulta fuera del contenido público', function () {
    $respuesta = (new AsistenteCamara)->responder('¿Cuál será el precio de la acción?');

    expect($respuesta['respuesta'])->toContain('No encuentro información pública suficiente')
        ->and($respuesta['enlaces'][0]['url'])->toBe('/contacto');
});

test('el endpoint público responde con la respuesta y enlace de afiliación', function () {
    $this->postJson(route('api.asistente.store'), ['mensaje' => '¿Cómo puedo afiliarme?'])
        ->assertSuccessful()
        ->assertJsonPath('enlaces.0.url', '/afiliate/formulario');
});

test('el endpoint rechaza consultas vacías', function () {
    $this->postJson(route('api.asistente.store'), ['mensaje' => ''])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('mensaje');
});
