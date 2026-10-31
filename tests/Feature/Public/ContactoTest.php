<?php

use App\Models\MensajeContacto;
use App\Models\Oficina;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

/**
 * @param  array<string, mixed>  $extra
 * @return array<string, mixed>
 */
function datosDeContacto(array $extra = []): array
{
    return [
        'necesidad' => 'Necesito información para afiliar a mi empresa.',
        'nombre' => 'Ana Pérez',
        'empresa' => 'Aceites del Sur S.R.L.',
        'correo' => 'ana@aceites.test',
        'telefono' => '+591 70000000',
        'acepta_privacidad' => true,
        ...$extra,
    ];
}

/**
 * @param  array<string, mixed>  $extra
 */
function oficinaDePrueba(array $extra = []): Oficina
{
    return Oficina::create([
        'nombre' => 'Oficina La Paz',
        'ciudad' => 'La Paz',
        'direccion' => 'Av. Arce',
        ...$extra,
    ]);
}

// ============================================================
// PÁGINA
// ============================================================

test('la página de contacto usa su vista propia', function () {
    $this->get('/contacto')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Public/Contacto'));
});

// ============================================================
// FORMULARIO
// ============================================================

test('un mensaje válido se guarda como nuevo y con la empresa', function () {
    $this->postJson('/api/contacto', datosDeContacto())
        ->assertCreated()
        ->assertJsonPath('success', true);

    $mensaje = MensajeContacto::firstOrFail();

    expect($mensaje->nombre)->toBe('Ana Pérez')
        ->and($mensaje->empresa)->toBe('Aceites del Sur S.R.L.')
        ->and($mensaje->correo_electronico)->toBe('ana@aceites.test')
        ->and($mensaje->telefono)->toBe('+591 70000000')
        ->and($mensaje->acepta_privacidad)->toBeTrue()
        ->and($mensaje->fresh()->estado)->toBe('nuevo');
});

test('sin aceptar la política de privacidad no se envía', function (mixed $valor) {
    $this->postJson('/api/contacto', datosDeContacto(['acepta_privacidad' => $valor]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('acepta_privacidad');

    expect(MensajeContacto::count())->toBe(0);
})->with([
    'falso' => false,
    'ausente' => null,
    'texto cualquiera' => 'no',
]);

test('los campos obligatorios se validan', function (string $campo) {
    $this->postJson('/api/contacto', datosDeContacto([$campo => '']))
        ->assertUnprocessable()
        ->assertJsonValidationErrors($campo);
})->with(['necesidad', 'nombre', 'empresa', 'correo', 'telefono']);

test('un email inválido se rechaza', function () {
    $this->postJson('/api/contacto', datosDeContacto(['correo' => 'no-es-un-correo']))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('correo');
});

test('se aceptan teléfonos en distintos formatos', function (string $telefono) {
    $this->postJson('/api/contacto', datosDeContacto(['telefono' => $telefono]))
        ->assertCreated();
})->with([
    'móvil boliviano' => '70000000',
    'fijo con prefijo' => '(591 2) 2773520',
    'español con guiones' => '+34 912-345-678',
]);

test('un teléfono sin sentido se rechaza', function (string $telefono) {
    $this->postJson('/api/contacto', datosDeContacto(['telefono' => $telefono]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('telefono');
})->with([
    'muy corto' => '12345',
    'con letras' => 'llamame-ya',
    'demasiados dígitos' => '1234567890123456',
]);

test('la necesidad tiene un largo máximo', function () {
    $this->postJson('/api/contacto', datosDeContacto(['necesidad' => str_repeat('a', 2001)]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('necesidad');
});

test('el formulario no puede fijar los campos de gestión interna', function () {
    $responsable = User::factory()->create();

    $this->postJson('/api/contacto', datosDeContacto([
        'estado' => 'cerrado',
        'comentarios' => 'Ya atendido',
        'atendido_por' => $responsable->id,
        'fecha_atencion' => '2026-01-01 10:00:00',
    ]))->assertCreated();

    $mensaje = MensajeContacto::firstOrFail()->fresh();

    expect($mensaje->estado)->toBe('nuevo')
        ->and($mensaje->comentarios)->toBeNull()
        ->and($mensaje->atendido_por)->toBeNull()
        ->and($mensaje->fecha_atencion)->toBeNull();
});

test('el HTML de los campos se descarta', function () {
    $this->postJson('/api/contacto', datosDeContacto([
        'necesidad' => '<script>alert(1)</script>Quiero <b>información</b> de afiliación',
        'nombre' => '<i>Ana</i> Pérez',
    ]))->assertCreated();

    $mensaje = MensajeContacto::firstOrFail();

    expect($mensaje->necesidad)->toBe('alert(1)Quiero información de afiliación')
        ->and($mensaje->nombre)->toBe('Ana Pérez');
});

test('los envíos seguidos desde la misma IP se limitan', function () {
    foreach (range(1, 3) as $intento) {
        $this->postJson('/api/contacto', datosDeContacto())->assertCreated();
    }

    $this->postJson('/api/contacto', datosDeContacto())->assertTooManyRequests();

    expect(MensajeContacto::count())->toBe(3);
});

// ============================================================
// OFICINAS
// ============================================================

test('solo se listan las oficinas activas, por orden', function () {
    oficinaDePrueba(['nombre' => 'Oficina Santa Cruz', 'ciudad' => 'Santa Cruz', 'orden' => 2]);
    oficinaDePrueba(['orden' => 1]);
    oficinaDePrueba(['nombre' => 'Oficina Cerrada', 'ciudad' => 'Tarija', 'activo' => false]);

    $this->getJson('/api/oficinas')
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.ciudad', 'La Paz')
        ->assertJsonPath('data.1.ciudad', 'Santa Cruz');
});

test('cada oficina trae sus datos públicos y su responsable', function () {
    oficinaDePrueba([
        'edificio' => 'Hotel Real Plaza',
        'piso' => '4',
        'oficina' => '402',
        'telefono' => '(591 2) 2773520',
        'correo_electronico' => 'lapaz@camara.test',
        'responsable_nombre' => 'María Gómez',
        'responsable_cargo' => 'Gerente',
        'created_by' => User::factory()->create()->id,
    ]);

    $this->getJson('/api/oficinas')
        ->assertJsonPath('data.0.edificio', 'Hotel Real Plaza')
        ->assertJsonPath('data.0.correo', 'lapaz@camara.test')
        ->assertJsonPath('data.0.responsable.nombre', 'María Gómez')
        ->assertJsonPath('data.0.responsable.cargo', 'Gerente')
        ->assertJsonMissingPath('data.0.created_by')
        ->assertJsonMissingPath('data.0.activo');
});

test('una oficina sin responsable lo devuelve vacío', function () {
    oficinaDePrueba();

    $this->getJson('/api/oficinas')->assertJsonPath('data.0.responsable', null);
});

test('se respeta la URL de incrustar pegada desde Google Maps', function () {
    $embed = 'https://www.google.com/maps/embed?pb=!1m18!1m12';

    oficinaDePrueba(['mapa_url' => $embed, 'latitud' => -16.5, 'longitud' => -68.1]);

    $this->getJson('/api/oficinas')->assertJsonPath('data.0.mapa_url', $embed);
});

test('sin URL de incrustar el mapa se genera con las coordenadas de la oficina', function () {
    oficinaDePrueba(['latitud' => -16.50772, 'longitud' => -68.12713]);

    $mapa = $this->getJson('/api/oficinas')->json('data.0.mapa_url');

    expect($mapa)->toStartWith('https://maps.google.com/maps?')
        ->toContain('q=-16.50772%2C-68.12713')
        ->toContain('output=embed');
});

test('una URL que no es de Google no llega al iframe', function () {
    oficinaDePrueba([
        'mapa_url' => 'https://sitio-malicioso.test/maps/embed?x=1',
        'latitud' => -17.78,
        'longitud' => -63.18,
    ]);

    $mapa = $this->getJson('/api/oficinas')->json('data.0.mapa_url');

    expect($mapa)->toStartWith('https://maps.google.com/maps?')
        ->not->toContain('sitio-malicioso');
});

test('sin coordenadas el mapa se ubica por la dirección', function () {
    oficinaDePrueba();

    expect($this->getJson('/api/oficinas')->json('data.0.mapa_url'))
        ->toContain('q=Av.+Arce%2C+La+Paz');
});
