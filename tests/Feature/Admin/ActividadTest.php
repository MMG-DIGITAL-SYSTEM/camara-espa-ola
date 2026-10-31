<?php

use App\Models\Actividad;
use App\Models\Categoria;
use App\Models\EstadoPublicacion;
use App\Models\Pagina;
use App\Models\User;
use App\Models\Visibilidad;
use Database\Factories\PaginaSeccionFactory;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->editor = User::factory()->editor()->create();

    foreach (['Publicada', 'Borrador', 'Archivada'] as $nombre) {
        EstadoPublicacion::firstOrCreate(['nombre' => $nombre]);
    }

    foreach (['Pública', 'Privada'] as $nombre) {
        Visibilidad::firstOrCreate(['nombre' => $nombre]);
    }
});

function estadoDeActividad(string $nombre): int
{
    return EstadoPublicacion::where('nombre', $nombre)->value('id');
}

function visibilidadDeActividad(string $nombre): int
{
    return Visibilidad::where('nombre', $nombre)->value('id');
}

/**
 * @param  array<string, mixed>  $extra
 * @return array<string, mixed>
 */
function datosDeActividad(array $extra = []): array
{
    return [
        'titulo' => 'Misión comercial a Madrid',
        'descripcion' => '<p>Una semana de encuentros con empresas españolas.</p>',
        'imagen' => 'medios/2026/09/mision.jpg',
        'fecha_publicacion' => '2026-09-01T09:00',
        'fecha_evento' => '2026-10-15T18:30',
        'estado_id' => estadoDeActividad('Publicada'),
        'visibilidad_id' => visibilidadDeActividad('Pública'),
        'autor_visible' => 'Cámara',
        'categorias' => [],
        'secciones' => [],
        'archivos' => [],
        ...$extra,
    ];
}

// ============================================================
// ACCESO Y LISTADO
// ============================================================

test('un usuario sin acceso al panel no entra a actividades', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('admin.actividades.index'))
        ->assertForbidden();
});

test('el listado llega con el estado y el conteo de cada actividad', function () {
    $this->actingAs($this->editor)
        ->post(route('admin.actividades.store'), datosDeActividad([
            'secciones' => [
                ['titulo' => 'Programa', 'contenido' => '<p>Día a día</p>'],
            ],
            'archivos' => [
                ['nombre' => 'Programa', 'archivo_url' => 'docs/p.pdf', 'tipo' => 'pdf'],
            ],
        ]));

    $this->actingAs($this->editor)
        ->get(route('admin.actividades.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Actividades/Index')
            ->where('actividades.data.0.titulo', 'Misión comercial a Madrid')
            ->where('actividades.data.0.estado', 'Publicada')
            ->where('actividades.data.0.secciones', 1)
            ->where('actividades.data.0.archivos', 1));
});

test('el buscador filtra por título', function () {
    $this->actingAs($this->editor)->post(route('admin.actividades.store'), datosDeActividad());
    $this->actingAs($this->editor)->post(route('admin.actividades.store'), datosDeActividad([
        'titulo' => 'Desayuno empresarial',
    ]));

    $this->actingAs($this->editor)
        ->get(route('admin.actividades.index', ['buscar' => 'Desayuno']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('actividades.data', 1)
            ->where('actividades.data.0.titulo', 'Desayuno empresarial'));
});

// ============================================================
// CREAR, EDITAR Y BORRAR
// ============================================================

test('crear una actividad guarda también su autoría', function () {
    $this->actingAs($this->editor)
        ->post(route('admin.actividades.store'), datosDeActividad())
        ->assertInertiaFlash('toast.type', 'success');

    $actividad = Actividad::firstOrFail();

    expect($actividad->titulo)->toBe('Misión comercial a Madrid')
        ->and($actividad->publicado_por)->toBe($this->editor->id)
        ->and($actividad->updated_by)->toBe($this->editor->id)
        ->and($actividad->fecha_evento->format('Y-m-d H:i'))->toBe('2026-10-15 18:30');
});

test('las secciones y los archivos se guardan en orden', function () {
    $this->actingAs($this->editor)->post(route('admin.actividades.store'), datosDeActividad([
        'secciones' => [
            ['titulo' => 'Programa', 'contenido' => '<p>Uno</p>'],
            ['titulo' => 'Ponentes', 'contenido' => '<p>Dos</p>'],
        ],
        'archivos' => [
            ['nombre' => 'Programa en PDF', 'archivo_url' => 'docs/programa.pdf', 'tipo' => 'pdf'],
        ],
    ]));

    $actividad = Actividad::with(['secciones', 'archivos'])->firstOrFail();

    expect($actividad->secciones)->toHaveCount(2)
        ->and($actividad->secciones[0]->titulo)->toBe('Programa')
        ->and($actividad->secciones[0]->orden)->toBe(0)
        ->and($actividad->secciones[1]->orden)->toBe(1)
        ->and($actividad->archivos)->toHaveCount(1)
        ->and($actividad->archivos[0]->tipo)->toBe('pdf');
});

test('editar reemplaza las secciones anteriores en lugar de acumularlas', function () {
    $this->actingAs($this->editor)->post(route('admin.actividades.store'), datosDeActividad([
        'secciones' => [
            ['titulo' => 'Vieja', 'contenido' => '<p>Se va</p>'],
        ],
    ]));

    $actividad = Actividad::firstOrFail();

    $this->actingAs($this->editor)->patch(
        route('admin.actividades.update', $actividad),
        datosDeActividad([
            'secciones' => [
                ['titulo' => 'Nueva', 'contenido' => '<p>Se queda</p>'],
            ],
        ]),
    );

    $secciones = $actividad->fresh()->secciones;

    expect($secciones)->toHaveCount(1)
        ->and($secciones[0]->titulo)->toBe('Nueva');
});

test('el formulario de edición trae el detalle completo', function () {
    $this->actingAs($this->editor)->post(route('admin.actividades.store'), datosDeActividad([
        'secciones' => [['titulo' => 'Programa', 'contenido' => '<p>Uno</p>']],
    ]));

    $actividad = Actividad::firstOrFail();

    $this->actingAs($this->editor)
        ->getJson(route('admin.actividades.show', $actividad))
        ->assertOk()
        ->assertJsonPath('titulo', 'Misión comercial a Madrid')
        ->assertJsonPath('secciones.0.titulo', 'Programa')
        // La imagen vuelve en crudo: el formulario la reenvía tal cual.
        ->assertJsonPath('imagen', 'medios/2026/09/mision.jpg');
});

test('eliminar una actividad la retira del sitio', function () {
    $this->actingAs($this->editor)->post(route('admin.actividades.store'), datosDeActividad());

    $actividad = Actividad::firstOrFail();

    $this->actingAs($this->editor)
        ->delete(route('admin.actividades.destroy', $actividad))
        ->assertInertiaFlash('toast.type', 'success');

    expect(Actividad::count())->toBe(0)
        ->and(Actividad::withTrashed()->count())->toBe(1);
});

test('las categorías se sincronizan, no se duplican', function () {
    $ferias = Categoria::firstOrCreate(['nombre' => 'Ferias']);
    $formacion = Categoria::firstOrCreate(['nombre' => 'Formación']);

    $this->actingAs($this->editor)->post(route('admin.actividades.store'), datosDeActividad([
        'categorias' => [$ferias->id, $formacion->id],
    ]));

    $actividad = Actividad::firstOrFail();

    $this->actingAs($this->editor)->patch(
        route('admin.actividades.update', $actividad),
        datosDeActividad(['categorias' => [$formacion->id]]),
    );

    expect($actividad->fresh()->categorias->pluck('nombre')->all())->toBe(['Formación']);
});

// ============================================================
// VALIDACIÓN Y SANEAMIENTO
// ============================================================

test('la fecha del evento es obligatoria', function () {
    $this->actingAs($this->editor)
        ->post(route('admin.actividades.store'), datosDeActividad(['fecha_evento' => '']))
        ->assertSessionHasErrors('fecha_evento');
});

test('una sección sin título no pasa', function () {
    $this->actingAs($this->editor)
        ->post(route('admin.actividades.store'), datosDeActividad([
            'secciones' => [['titulo' => '', 'contenido' => '<p>Algo</p>']],
        ]))
        ->assertSessionHasErrors('secciones.0.titulo');
});

test('el HTML de la descripción y de cada sección se sanea', function () {
    $this->actingAs($this->editor)->post(route('admin.actividades.store'), datosDeActividad([
        'descripcion' => '<p>Hola</p><script>alert(1)</script>',
        'secciones' => [
            ['titulo' => 'Programa', 'contenido' => '<p>Bien</p><script>alert(2)</script>'],
        ],
    ]));

    $actividad = Actividad::with('secciones')->firstOrFail();

    expect($actividad->descripcion)->toBe('<p>Hola</p>')
        ->and($actividad->secciones[0]->contenido)->toBe('<p>Bien</p>');
});

test('sin autor se publica a nombre de la Cámara', function () {
    $this->actingAs($this->editor)->post(
        route('admin.actividades.store'),
        datosDeActividad(['autor_visible' => '']),
    );

    expect(Actividad::firstOrFail()->autor_visible)->toBe('Cámara');
});

// ============================================================
// EFECTO EN EL SITIO PÚBLICO
// ============================================================

test('una actividad publicada y pública aparece en el sitio', function () {
    $this->actingAs($this->editor)->post(route('admin.actividades.store'), datosDeActividad());

    $this->get('/actividades')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Public/Actividades')
            ->has('data.data', 1)
            ->where('data.data.0.titulo', 'Misión comercial a Madrid'));
});

test('una actividad en borrador no aparece en el sitio', function () {
    $this->actingAs($this->editor)->post(route('admin.actividades.store'), datosDeActividad([
        'estado_id' => estadoDeActividad('Borrador'),
    ]));

    $this->get('/actividades')
        ->assertInertia(fn (Assert $page) => $page->has('data.data', 0));
});

test('una actividad privada tampoco aparece', function () {
    $this->actingAs($this->editor)->post(route('admin.actividades.store'), datosDeActividad([
        'visibilidad_id' => visibilidadDeActividad('Privada'),
    ]));

    $this->get('/actividades')
        ->assertInertia(fn (Assert $page) => $page->has('data.data', 0));
});

test('el detalle muestra las secciones y los archivos creados en el panel', function () {
    $this->actingAs($this->editor)->post(route('admin.actividades.store'), datosDeActividad([
        'secciones' => [['titulo' => 'Programa', 'contenido' => '<p>Uno</p>']],
        'archivos' => [
            ['nombre' => 'Programa', 'archivo_url' => 'docs/programa.pdf', 'tipo' => 'pdf'],
        ],
    ]));

    $actividad = Actividad::firstOrFail();

    $this->get('/actividades/'.$actividad->id)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Public/Actividades/Show')
            ->where('data.secciones.0.titulo', 'Programa')
            ->where('data.archivos.0.nombre', 'Programa'));
});

test('una dirección externa no se prefija con storage', function () {
    $this->actingAs($this->editor)->post(route('admin.actividades.store'), datosDeActividad([
        'imagen' => 'https://ejemplo.test/foto.jpg',
    ]));

    $this->get('/actividades')
        ->assertInertia(fn (Assert $page) => $page
            ->where('data.data.0.imagen', 'https://ejemplo.test/foto.jpg'));
});

test('la página de actividades recibe las secciones editables del módulo', function () {
    $pagina = Pagina::factory()->deModulo('actividades')->create([
        'slug' => 'modulo-actividades',
    ]);

    PaginaSeccionFactory::new()
        ->bloque('encabezado', ['titulo' => 'Nuestra agenda'])
        ->create(['pagina_id' => $pagina->id]);

    $pagina->publicar();

    $this->get('/actividades')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('seccionesArriba', 1)
            ->where('seccionesArriba.0.datos.titulo', 'Nuestra agenda'));
});
