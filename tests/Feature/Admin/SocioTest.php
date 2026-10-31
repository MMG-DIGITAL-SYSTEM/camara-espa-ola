<?php

use App\Models\CategoriaAfiliado;
use App\Models\ContactoAfiliado;
use App\Models\EstadoComercial;
use App\Models\Socio;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->editor = User::factory()->editor()->create();
});

function estadoDeSocio(string $nombre): int
{
    return EstadoComercial::where('nombre', $nombre)->value('id');
}

/**
 * @param  array<string, mixed>  $extra
 * @return array<string, mixed>
 */
function datosDeSocio(array $extra = []): array
{
    return [
        'nombre' => 'Aceites del Sur S.A.',
        'slug' => '',
        'nit' => '1020304050',
        'descripcion' => 'Importadores de aceite de oliva.',
        'imagen' => 'medios/2026/09/aceites.png',
        'sitio_web' => 'https://aceites.test',
        'telefono1' => '2-2123456',
        'telefono2' => '70000000',
        'correo_electronico' => 'info@aceites.test',
        'direccion' => 'Av. Arce 123, La Paz',
        'categoria_id' => null,
        'categoria_nueva' => '',
        'estado_id' => estadoDeSocio('Activo'),
        'fecha_afiliacion' => '2026-01-15',
        'destacado' => false,
        'orden' => 0,
        'contactos' => [],
        ...$extra,
    ];
}

// ============================================================
// ACCESO Y LISTADO
// ============================================================

test('un usuario sin acceso al panel no entra a socios', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('admin.socios.index'))
        ->assertForbidden();
});

test('el listado llega con el estado y el número de contactos', function () {
    $this->actingAs($this->editor)->post(route('admin.socios.store'), datosDeSocio([
        'contactos' => [['nombre' => 'Ana Pérez', 'cargo' => 'Gerente']],
    ]));

    $this->actingAs($this->editor)
        ->get(route('admin.socios.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Socios/Index')
            ->where('socios.data.0.nombre', 'Aceites del Sur S.A.')
            ->where('socios.data.0.estado', 'Activo')
            ->where('socios.data.0.contactos', 1)
            ->has('catalogos.estados', 2));
});

test('el buscador filtra por nombre o NIT', function () {
    $this->actingAs($this->editor)->post(route('admin.socios.store'), datosDeSocio());
    $this->actingAs($this->editor)->post(route('admin.socios.store'), datosDeSocio([
        'nombre' => 'Vinos Ibéricos',
        'nit' => '999888',
    ]));

    $this->actingAs($this->editor)
        ->get(route('admin.socios.index', ['buscar' => '999888']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('socios.data', 1)
            ->where('socios.data.0.nombre', 'Vinos Ibéricos'));
});

// ============================================================
// CREAR, EDITAR Y BORRAR
// ============================================================

test('crear un socio genera la dirección y guarda la autoría', function () {
    $this->actingAs($this->editor)
        ->post(route('admin.socios.store'), datosDeSocio())
        ->assertInertiaFlash('toast.type', 'success');

    $socio = Socio::firstOrFail();

    expect($socio->slug)->toBe('aceites-del-sur-sa')
        ->and($socio->created_by)->toBe($this->editor->id)
        ->and($socio->updated_by)->toBe($this->editor->id)
        ->and($socio->fecha_afiliacion->format('Y-m-d'))->toBe('2026-01-15');
});

test('un rubro escrito a mano se crea y se asigna', function () {
    $this->actingAs($this->editor)->post(route('admin.socios.store'), datosDeSocio([
        'categoria_nueva' => 'Alimentación',
    ]));

    $categoria = CategoriaAfiliado::where('nombre', 'Alimentación')->firstOrFail();

    expect(Socio::firstOrFail()->categoria_id)->toBe($categoria->id);
});

test('un rubro escrito a mano que ya existe no se duplica', function () {
    $existente = CategoriaAfiliado::create(['nombre' => 'Alimentación']);

    $this->actingAs($this->editor)->post(route('admin.socios.store'), datosDeSocio([
        'categoria_nueva' => 'Alimentación',
    ]));

    expect(CategoriaAfiliado::where('nombre', 'Alimentación')->count())->toBe(1)
        ->and(Socio::firstOrFail()->categoria_id)->toBe($existente->id);
});

test('los contactos se guardan en orden', function () {
    $this->actingAs($this->editor)->post(route('admin.socios.store'), datosDeSocio([
        'contactos' => [
            ['nombre' => 'Ana Pérez', 'cargo' => 'Gerente', 'correo_electronico' => 'ana@aceites.test'],
            ['nombre' => 'Luis Rojas', 'cargo' => 'Ventas'],
        ],
    ]));

    $contactos = Socio::firstOrFail()->contactos;

    expect($contactos)->toHaveCount(2)
        ->and($contactos[0]->nombre)->toBe('Ana Pérez')
        ->and($contactos[0]->orden)->toBe(0)
        ->and($contactos[1]->orden)->toBe(1);
});

test('editar reemplaza los contactos sin dejar copias borradas', function () {
    $this->actingAs($this->editor)->post(route('admin.socios.store'), datosDeSocio([
        'contactos' => [['nombre' => 'Viejo']],
    ]));

    $socio = Socio::firstOrFail();

    $this->actingAs($this->editor)->patch(
        route('admin.socios.update', $socio),
        datosDeSocio([
            'slug' => $socio->slug,
            'contactos' => [['nombre' => 'Nuevo']],
        ]),
    );

    expect($socio->fresh()->contactos->pluck('nombre')->all())->toBe(['Nuevo'])
        ->and(ContactoAfiliado::withTrashed()->count())->toBe(1);
});

test('editar conserva su propia dirección sin chocar consigo mismo', function () {
    $this->actingAs($this->editor)->post(route('admin.socios.store'), datosDeSocio());

    $socio = Socio::firstOrFail();

    $this->actingAs($this->editor)
        ->patch(route('admin.socios.update', $socio), datosDeSocio([
            'slug' => $socio->slug,
            'nit' => '111',
        ]))
        ->assertSessionHasNoErrors();

    expect($socio->fresh()->nit)->toBe('111');
});

test('el formulario de edición trae el detalle completo', function () {
    $this->actingAs($this->editor)->post(route('admin.socios.store'), datosDeSocio([
        'contactos' => [['nombre' => 'Ana Pérez', 'cargo' => 'Gerente']],
    ]));

    $socio = Socio::firstOrFail();

    $this->actingAs($this->editor)
        ->getJson(route('admin.socios.show', $socio))
        ->assertOk()
        ->assertJsonPath('nombre', 'Aceites del Sur S.A.')
        ->assertJsonPath('fecha_afiliacion', '2026-01-15')
        ->assertJsonPath('contactos.0.cargo', 'Gerente')
        // La imagen vuelve en crudo: el formulario la reenvía tal cual.
        ->assertJsonPath('imagen', 'medios/2026/09/aceites.png');
});

test('eliminar un socio lo retira del sitio', function () {
    $this->actingAs($this->editor)->post(route('admin.socios.store'), datosDeSocio());

    $socio = Socio::firstOrFail();

    $this->actingAs($this->editor)
        ->delete(route('admin.socios.destroy', $socio))
        ->assertInertiaFlash('toast.type', 'success');

    expect(Socio::count())->toBe(0)
        ->and(Socio::withTrashed()->count())->toBe(1);
});

// ============================================================
// VALIDACIÓN
// ============================================================

test('el nombre es obligatorio', function () {
    $this->actingAs($this->editor)
        ->post(route('admin.socios.store'), datosDeSocio(['nombre' => '']))
        ->assertSessionHasErrors('nombre');
});

test('dos socios no pueden compartir dirección', function () {
    $this->actingAs($this->editor)->post(route('admin.socios.store'), datosDeSocio());

    $this->actingAs($this->editor)
        ->post(route('admin.socios.store'), datosDeSocio())
        ->assertSessionHasErrors('slug');
});

test('un contacto sin nombre o con correo inválido no pasa', function () {
    $this->actingAs($this->editor)
        ->post(route('admin.socios.store'), datosDeSocio([
            'contactos' => [['nombre' => '', 'correo_electronico' => 'no-es-correo']],
        ]))
        ->assertSessionHasErrors(['contactos.0.nombre', 'contactos.0.correo_electronico']);
});

// ============================================================
// EFECTO EN EL SITIO PÚBLICO
// ============================================================

test('un socio activo aparece en el sitio con sus contactos', function () {
    $this->actingAs($this->editor)->post(route('admin.socios.store'), datosDeSocio([
        'contactos' => [['nombre' => 'Ana Pérez', 'cargo' => 'Gerente']],
    ]));

    $this->getJson('/api/socios')
        ->assertOk()
        ->assertJsonPath('data.0.nombre', 'Aceites del Sur S.A.')
        ->assertJsonPath('data.0.contactos.0.nombre', 'Ana Pérez');

    $this->getJson('/api/socios/aceites-del-sur-sa')
        ->assertOk()
        ->assertJsonPath('data.nit', '1020304050');
});

test('un socio inactivo no aparece en el sitio', function () {
    $this->actingAs($this->editor)->post(route('admin.socios.store'), datosDeSocio([
        'estado_id' => estadoDeSocio('Inactivo'),
    ]));

    $this->getJson('/api/socios')->assertJsonCount(0, 'data');
    $this->getJson('/api/socios/aceites-del-sur-sa')->assertNotFound();
});
