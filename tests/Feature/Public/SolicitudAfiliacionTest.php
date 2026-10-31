<?php

use App\Enums\EstadoSolicitudAfiliacion;
use App\Models\Socio;
use App\Models\SolicitudAfiliacion;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

/**
 * @param  array<string, mixed>  $extra
 * @return array<string, mixed>
 */
function datosDeAfiliacion(array $extra = []): array
{
    return [
        'nombre_razon_social' => 'Aceites del Sur S.R.L.',
        'representante_legal' => 'Ana Pérez y Luis Rojas',
        'escritura_constitucion' => '123/2015',
        'fecha' => '2015-03-20',
        'nit' => '1020304050',
        'direccion' => 'Av. Arce N° 123',
        'ciudad' => 'La Paz',
        'telefono' => '+591 70000000',
        'fax' => '',
        'casilla' => '4567',
        'correo_electronico' => 'contacto@aceites.test',
        'pagina_web' => 'https://aceites.test',
        'representante_camara' => 'Ana Pérez',
        'cargo' => 'Gerente General',
        'servicios_productos' => 'Importación y distribución de aceite de oliva.',
        ...$extra,
    ];
}

// ============================================================
// PÁGINA
// ============================================================

test('la página del formulario usa su vista propia', function () {
    $this->get('/afiliate/formulario')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Public/FormularioAfiliacion'));
});

test('la antigua dirección /afiliate lleva al formulario', function () {
    $this->get('/afiliate')->assertRedirect('/afiliate/formulario')->assertStatus(301);
});

test('ninguna página del constructor puede ocupar /afiliate', function () {
    $this->actingAs(User::factory()->editor()->create())
        ->post(route('admin.paginas.store'), ['titulo' => 'Afíliate', 'slug' => 'afiliate'])
        ->assertSessionHasErrors('slug');
});

// ============================================================
// ENVÍO
// ============================================================

test('una solicitud válida se guarda como pendiente con todos sus datos', function () {
    $this->postJson('/api/solicitudes-afiliacion', datosDeAfiliacion())
        ->assertCreated()
        ->assertJsonPath('success', true);

    $solicitud = SolicitudAfiliacion::firstOrFail()->fresh();

    expect($solicitud->nombre_razon_social)->toBe('Aceites del Sur S.R.L.')
        ->and($solicitud->representante_legal)->toBe('Ana Pérez y Luis Rojas')
        ->and($solicitud->escritura_constitucion)->toBe('123/2015')
        ->and($solicitud->fecha->format('Y-m-d'))->toBe('2015-03-20')
        ->and($solicitud->nit)->toBe('1020304050')
        ->and($solicitud->ciudad)->toBe('La Paz')
        ->and($solicitud->casilla)->toBe('4567')
        ->and($solicitud->fax)->toBeNull()
        ->and($solicitud->cargo)->toBe('Gerente General')
        ->and($solicitud->estado)->toBe(EstadoSolicitudAfiliacion::Pendiente);
});

test('enviar una solicitud no crea ningún socio ni usuario', function () {
    $usuarios = User::count();

    $this->postJson('/api/solicitudes-afiliacion', datosDeAfiliacion())->assertCreated();

    expect(Socio::count())->toBe(0)
        ->and(User::count())->toBe($usuarios)
        ->and(SolicitudAfiliacion::firstOrFail()->socio_id)->toBeNull();
});

test('el formulario no puede fijar los campos de revisión', function () {
    $revisor = User::factory()->create();

    $this->postJson('/api/solicitudes-afiliacion', datosDeAfiliacion([
        'estado' => 'aprobada',
        'comentarios' => 'Aprobada',
        'revisado_por' => $revisor->id,
        'fecha_revision' => '2026-01-01 10:00:00',
    ]))->assertCreated();

    $solicitud = SolicitudAfiliacion::firstOrFail()->fresh();

    expect($solicitud->estado)->toBe(EstadoSolicitudAfiliacion::Pendiente)
        ->and($solicitud->comentarios)->toBeNull()
        ->and($solicitud->revisado_por)->toBeNull()
        ->and($solicitud->fecha_revision)->toBeNull();
});

// ============================================================
// VALIDACIÓN
// ============================================================

test('los campos obligatorios del formulario se validan', function (string $campo) {
    $this->postJson('/api/solicitudes-afiliacion', datosDeAfiliacion([$campo => '']))
        ->assertUnprocessable()
        ->assertJsonValidationErrors($campo);
})->with([
    'nombre_razon_social',
    'representante_legal',
    'escritura_constitucion',
    'direccion',
    'ciudad',
    'telefono',
    'casilla',
    'correo_electronico',
    'pagina_web',
    'representante_camara',
    'cargo',
    'servicios_productos',
]);

test('NIT, fax y fecha son opcionales', function () {
    $this->postJson('/api/solicitudes-afiliacion', datosDeAfiliacion([
        'nit' => '',
        'fax' => '',
        'fecha' => '',
    ]))->assertCreated();
});

test('un correo inválido se rechaza', function () {
    $this->postJson('/api/solicitudes-afiliacion', datosDeAfiliacion(['correo_electronico' => 'no-es-correo']))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('correo_electronico');
});

test('la web se acepta sin https y se guarda completa', function () {
    $this->postJson('/api/solicitudes-afiliacion', datosDeAfiliacion(['pagina_web' => 'www.aceites.test']))
        ->assertCreated();

    expect(SolicitudAfiliacion::firstOrFail()->pagina_web)->toBe('https://www.aceites.test');
});

test('una web sin sentido se rechaza', function () {
    $this->postJson('/api/solicitudes-afiliacion', datosDeAfiliacion(['pagina_web' => 'no es una web']))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('pagina_web');
});

test('la fecha de constitución no puede ser futura ni inválida', function (string $fecha) {
    $this->postJson('/api/solicitudes-afiliacion', datosDeAfiliacion(['fecha' => $fecha]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('fecha');
})->with([
    'futura' => now()->addDay()->format('Y-m-d'),
    'inválida' => '2026-02-31',
    'otro formato' => '20/03/2015',
]);

test('teléfono y fax aceptan formatos internacionales y rechazan lo que no lo es', function () {
    $this->postJson('/api/solicitudes-afiliacion', datosDeAfiliacion([
        'telefono' => '(591 2) 2773520',
        'fax' => '+34 912-345-678',
    ]))->assertCreated();

    $this->postJson('/api/solicitudes-afiliacion', datosDeAfiliacion(['telefono' => '12345', 'fax' => 'fax']))
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['telefono', 'fax']);
});

test('los textos respetan el tamaño de sus columnas', function () {
    $this->postJson('/api/solicitudes-afiliacion', datosDeAfiliacion([
        'nit' => str_repeat('1', 31),
        'servicios_productos' => str_repeat('a', 5001),
    ]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['nit', 'servicios_productos']);
});

test('el HTML de los campos se descarta', function () {
    $this->postJson('/api/solicitudes-afiliacion', datosDeAfiliacion([
        'nombre_razon_social' => '<b>Aceites</b> del Sur',
        'servicios_productos' => '<script>alert(1)</script>Aceite de oliva',
    ]))->assertCreated();

    $solicitud = SolicitudAfiliacion::firstOrFail();

    expect($solicitud->nombre_razon_social)->toBe('Aceites del Sur')
        ->and($solicitud->servicios_productos)->toBe('alert(1)Aceite de oliva');
});

test('los envíos seguidos desde la misma IP se limitan', function () {
    foreach (range(1, 3) as $intento) {
        $this->postJson('/api/solicitudes-afiliacion', datosDeAfiliacion())->assertCreated();
    }

    $this->postJson('/api/solicitudes-afiliacion', datosDeAfiliacion())->assertTooManyRequests();

    expect(SolicitudAfiliacion::count())->toBe(3);
});
