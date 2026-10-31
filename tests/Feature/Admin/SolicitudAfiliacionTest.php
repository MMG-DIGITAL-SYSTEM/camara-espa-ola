<?php

use App\Enums\EstadoSolicitudAfiliacion;
use App\Models\Socio;
use App\Models\SolicitudAfiliacion;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->editor = User::factory()->editor()->create();
});

// ============================================================
// ACCESO Y LISTADO
// ============================================================

test('un usuario sin acceso al panel no entra a las solicitudes', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('admin.solicitudes.index'))
        ->assertForbidden();
});

test('el listado trae las solicitudes y cuántas siguen pendientes', function () {
    SolicitudAfiliacion::factory()->count(2)->create();
    SolicitudAfiliacion::factory()->enEstado(EstadoSolicitudAfiliacion::Rechazada)->create();

    $this->actingAs($this->editor)
        ->get(route('admin.solicitudes.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Solicitudes/Index')
            ->has('solicitudes.data', 3)
            ->where('pendientes', 2)
            ->has('estados', 5));
});

test('el listado se filtra por estado', function () {
    SolicitudAfiliacion::factory()->create();
    SolicitudAfiliacion::factory()->enEstado(EstadoSolicitudAfiliacion::EnRevision)->create();

    $this->actingAs($this->editor)
        ->get(route('admin.solicitudes.index', ['estado' => 'en_revision']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('solicitudes.data', 1)
            ->where('solicitudes.data.0.estado', 'en_revision'));
});

test('una solicitud enviada desde el formulario público aparece en el panel', function () {
    $this->postJson('/api/solicitudes-afiliacion', [
        'nombre_razon_social' => 'Olivares del Sur S.R.L.',
        'representante_legal' => 'Ana Pérez',
        'escritura_constitucion' => '123/2015',
        'fecha' => '2015-03-20',
        'nit' => '1020304050',
        'direccion' => 'Av. Arce N° 123',
        'ciudad' => 'La Paz',
        'telefono' => '+591 70000000',
        'casilla' => '4567',
        'correo_electronico' => 'contacto@olivares.test',
        'pagina_web' => 'https://olivares.test',
        'representante_camara' => 'Ana Pérez',
        'cargo' => 'Gerente General',
        'servicios_productos' => 'Importación de aceite de oliva.',
    ])->assertCreated();

    $this->actingAs($this->editor)
        ->get(route('admin.solicitudes.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('solicitudes.data.0.empresa', 'Olivares del Sur S.R.L.')
            ->where('solicitudes.data.0.estado', 'pendiente'));
});

test('el detalle devuelve todos los datos del formulario', function () {
    $solicitud = SolicitudAfiliacion::factory()->create(['nit' => '998877']);

    $this->actingAs($this->editor)
        ->getJson(route('admin.solicitudes.show', $solicitud))
        ->assertOk()
        ->assertJsonPath('nit', '998877')
        ->assertJsonPath('estado', 'pendiente')
        ->assertJsonPath('socio', null);
});

// ============================================================
// REVISIÓN
// ============================================================

test('cambiar el estado guarda la nota y quién revisó', function () {
    $solicitud = SolicitudAfiliacion::factory()->create();

    $this->actingAs($this->editor)
        ->patch(route('admin.solicitudes.update', $solicitud), [
            'estado' => 'requiere_cambios',
            'comentarios' => 'Falta el NIT.',
        ])
        ->assertRedirect();

    $solicitud->refresh();

    expect($solicitud->estado)->toBe(EstadoSolicitudAfiliacion::RequiereCambios)
        ->and($solicitud->comentarios)->toBe('Falta el NIT.')
        ->and($solicitud->revisado_por)->toBe($this->editor->id)
        ->and($solicitud->fecha_revision)->not->toBeNull();
});

test('no se puede aprobar cambiando el estado a mano', function () {
    $solicitud = SolicitudAfiliacion::factory()->create();

    $this->actingAs($this->editor)
        ->patch(route('admin.solicitudes.update', $solicitud), ['estado' => 'aprobada'])
        ->assertSessionHasErrors('estado');

    expect($solicitud->fresh()->estado)->toBe(EstadoSolicitudAfiliacion::Pendiente)
        ->and(Socio::count())->toBe(0);
});

test('una solicitud aprobada ya no cambia de estado', function () {
    $solicitud = SolicitudAfiliacion::factory()->create();
    $this->actingAs($this->editor)->post(route('admin.solicitudes.aprobar', $solicitud));

    $this->actingAs($this->editor)
        ->patch(route('admin.solicitudes.update', $solicitud), ['estado' => 'rechazada']);

    expect($solicitud->fresh()->estado)->toBe(EstadoSolicitudAfiliacion::Aprobada);
});

// ============================================================
// APROBACIÓN
// ============================================================

test('aprobar crea el socio activo con los datos de la solicitud', function () {
    $solicitud = SolicitudAfiliacion::factory()->create([
        'nombre_razon_social' => 'Aceites del Sur S.R.L.',
        'nit' => '1020304050',
        'direccion' => 'Av. Arce N° 123',
        'ciudad' => 'La Paz',
        'telefono' => '+591 70000000',
        'correo_electronico' => 'contacto@aceites.test',
        'pagina_web' => 'https://aceites.test',
        'representante_camara' => 'Ana Pérez',
        'cargo' => 'Gerente General',
        'servicios_productos' => 'Importación de aceite de oliva.',
    ]);

    $this->actingAs($this->editor)
        ->post(route('admin.solicitudes.aprobar', $solicitud), ['comentarios' => 'Todo en orden.'])
        ->assertRedirect();

    $socio = Socio::with('estado', 'todosLosContactos')->sole();
    $solicitud->refresh();

    expect($socio->nombre)->toBe('Aceites del Sur S.R.L.')
        ->and($socio->slug)->toBe('aceites-del-sur-srl')
        ->and($socio->nit)->toBe('1020304050')
        ->and($socio->direccion)->toBe('Av. Arce N° 123, La Paz')
        ->and($socio->sitio_web)->toBe('https://aceites.test')
        ->and($socio->descripcion)->toBe('Importación de aceite de oliva.')
        ->and($socio->estaActivo())->toBeTrue()
        ->and($socio->fecha_afiliacion->isToday())->toBeTrue()
        ->and($socio->todosLosContactos)->toHaveCount(1)
        ->and($socio->todosLosContactos->first()->nombre)->toBe('Ana Pérez')
        ->and($socio->todosLosContactos->first()->cargo)->toBe('Gerente General')
        ->and($solicitud->estado)->toBe(EstadoSolicitudAfiliacion::Aprobada)
        ->and($solicitud->socio_id)->toBe($socio->id)
        ->and($solicitud->comentarios)->toBe('Todo en orden.')
        ->and($solicitud->revisado_por)->toBe($this->editor->id);
});

test('aprobar dos veces no duplica el socio', function () {
    $solicitud = SolicitudAfiliacion::factory()->create();

    $this->actingAs($this->editor)->post(route('admin.solicitudes.aprobar', $solicitud));
    $this->actingAs($this->editor)->post(route('admin.solicitudes.aprobar', $solicitud));

    expect(Socio::count())->toBe(1);
});

test('el socio aprobado recibe una dirección libre si el nombre ya existe', function () {
    $primera = SolicitudAfiliacion::factory()->create(['nombre_razon_social' => 'Olivares S.A.']);
    $segunda = SolicitudAfiliacion::factory()->create(['nombre_razon_social' => 'Olivares S.A.']);

    $this->actingAs($this->editor)->post(route('admin.solicitudes.aprobar', $primera));
    $this->actingAs($this->editor)->post(route('admin.solicitudes.aprobar', $segunda));

    expect(Socio::orderBy('id')->pluck('slug')->all())->toBe(['olivares-sa', 'olivares-sa-2']);
});

test('una página web inválida no llega al socio', function () {
    $solicitud = SolicitudAfiliacion::factory()->create(['pagina_web' => 'www.sin-esquema']);

    $this->actingAs($this->editor)->post(route('admin.solicitudes.aprobar', $solicitud));

    expect(Socio::sole()->sitio_web)->toBeNull();
});

test('eliminar una solicitud aprobada conserva su socio', function () {
    $solicitud = SolicitudAfiliacion::factory()->create();
    $this->actingAs($this->editor)->post(route('admin.solicitudes.aprobar', $solicitud));

    $this->actingAs($this->editor)
        ->delete(route('admin.solicitudes.destroy', $solicitud))
        ->assertRedirect();

    expect(SolicitudAfiliacion::count())->toBe(0)
        ->and(Socio::count())->toBe(1);
});
