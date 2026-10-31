<?php

use App\Bloques\RegistroDeBloques;
use App\Models\Directivo;
use App\Models\Servicio;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->editor = User::factory()->editor()->create();
});

// ============================================================
// SERVICIOS
// ============================================================

test('un usuario sin acceso al panel no gestiona servicios', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('admin.servicios.index'))
        ->assertForbidden();
});

test('crear un servicio lo coloca al final de la lista', function () {
    Servicio::create(['titulo' => 'Primero', 'contenido' => 'x', 'activo' => true, 'orden' => 0]);

    $this->actingAs($this->editor)
        ->post(route('admin.servicios.store'), [
            'titulo' => 'Segundo',
            'contenido' => 'Descripción del servicio.',
            'icono' => 'handshake',
            'activo' => true,
        ])
        ->assertInertiaFlash('toast.type', 'success');

    expect(Servicio::where('titulo', 'Segundo')->value('orden'))->toBe(1);
});

test('el listado llega ordenado', function () {
    Servicio::create(['titulo' => 'B', 'contenido' => 'x', 'activo' => true, 'orden' => 1]);
    Servicio::create(['titulo' => 'A', 'contenido' => 'x', 'activo' => true, 'orden' => 0]);

    $this->actingAs($this->editor)
        ->get(route('admin.servicios.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Servicios/Index')
            ->where('servicios.0.titulo', 'A')
            ->where('servicios.1.titulo', 'B'));
});

test('reordenar guarda el orden nuevo', function () {
    $a = Servicio::create(['titulo' => 'A', 'contenido' => 'x', 'activo' => true, 'orden' => 0]);
    $b = Servicio::create(['titulo' => 'B', 'contenido' => 'x', 'activo' => true, 'orden' => 1]);

    $this->actingAs($this->editor)
        ->post(route('admin.servicios.reordenar'), ['ids' => [$b->id, $a->id]])
        ->assertInertiaFlash('toast.type', 'success');

    expect($b->fresh()->orden)->toBe(0)
        ->and($a->fresh()->orden)->toBe(1);
});

test('reordenar con un id inventado se rechaza', function () {
    $servicio = Servicio::create(['titulo' => 'A', 'contenido' => 'x', 'activo' => true]);

    $this->actingAs($this->editor)
        ->post(route('admin.servicios.reordenar'), ['ids' => [$servicio->id, 99999]])
        ->assertSessionHasErrors('ids.1');
});

test('un servicio oculto no llega al bloque del sitio', function () {
    Servicio::create(['titulo' => 'Visible', 'contenido' => 'x', 'activo' => true]);
    Servicio::create(['titulo' => 'Oculto', 'contenido' => 'x', 'activo' => false]);

    $datos = RegistroDeBloques::datosDe('servicios', []);

    expect($datos)->toHaveCount(1)
        ->and($datos[0]['titulo'])->toBe('Visible');
});

test('eliminar un servicio lo retira del sitio', function () {
    $servicio = Servicio::create(['titulo' => 'A', 'contenido' => 'x', 'activo' => true]);

    $this->actingAs($this->editor)
        ->delete(route('admin.servicios.destroy', $servicio))
        ->assertInertiaFlash('toast.type', 'success');

    $this->assertSoftDeleted($servicio);
    expect(RegistroDeBloques::datosDe('servicios', []))->toBeEmpty();
});

// ============================================================
// DIRECTIVOS
// ============================================================

test('añadir una persona al directorio la coloca al final', function () {
    Directivo::create(['nombre' => 'Primera', 'activo' => true, 'orden' => 0]);

    $this->actingAs($this->editor)
        ->post(route('admin.directivos.store'), [
            'nombre' => 'Fernando García',
            'cargo' => 'Presidente',
            'empresa' => 'Acme',
            'activo' => true,
        ])
        ->assertInertiaFlash('toast.type', 'success');

    expect(Directivo::where('nombre', 'Fernando García')->value('orden'))->toBe(1);
});

test('el directorio se reordena', function () {
    $a = Directivo::create(['nombre' => 'A', 'activo' => true, 'orden' => 0]);
    $b = Directivo::create(['nombre' => 'B', 'activo' => true, 'orden' => 1]);

    $this->actingAs($this->editor)
        ->post(route('admin.directivos.reordenar'), ['ids' => [$b->id, $a->id]]);

    expect($b->fresh()->orden)->toBe(0);

    // El bloque del sitio respeta ese orden.
    $datos = RegistroDeBloques::datosDe('directorio', []);
    expect($datos[0]['nombre'])->toBe('B');
});

test('una persona oculta no sale en el directorio del sitio', function () {
    Directivo::create(['nombre' => 'Visible', 'activo' => true]);
    Directivo::create(['nombre' => 'Oculta', 'activo' => false]);

    $datos = RegistroDeBloques::datosDe('directorio', []);

    expect($datos)->toHaveCount(1)
        ->and($datos[0]['nombre'])->toBe('Visible');
});

test('el nombre es obligatorio', function () {
    $this->actingAs($this->editor)
        ->post(route('admin.directivos.store'), ['cargo' => 'Presidente', 'activo' => true])
        ->assertSessionHasErrors('nombre');
});
