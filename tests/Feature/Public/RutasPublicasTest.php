<?php

use App\Models\CategoriaAfiliado;
use App\Models\ContenidoInstitucional;
use App\Models\EstadoComercial;
use App\Models\Socio;

test('las rutas públicas responden', function (string $ruta) {
    $this->get($ruta)->assertOk();
})->with([
    'inicio' => '/',
    'la cámara' => '/la-camara',
    'socios' => '/socios',
    'servicios' => '/servicios',
    'noticias' => '/noticias',
    'fichas país' => '/fichas-pais',
    'red de cámaras' => '/red-camaras',
]);

test('la cámara envía la imagen subida de nuestra organización', function () {
    ContenidoInstitucional::create([
        'seccion' => 'nuestra_organizacion',
        'titulo' => 'Nuestra Organización',
        'contenido' => 'Texto institucional',
        'imagen' => 'medios/2026/11/organizacion.jpg',
    ]);

    $this->get('/la-camara')
        ->assertOk()
        ->assertInertia(fn ($pagina) => $pagina
            ->component('Public/Camara')
            ->where('data.nuestra_organizacion.imagen', asset('storage/medios/2026/11/organizacion.jpg'))
        );
});

test('la api pública responde', function (string $ruta) {
    $this->getJson($ruta)->assertOk();
})->with([
    'socios' => '/api/socios',
    'categorías de socios' => '/api/socios/categorias',
    'carrusel de socios' => '/api/socios/carrusel',
    'servicios' => '/api/servicios',
    'noticias' => '/api/noticias',
    'red de cámaras' => '/api/red-camaras',
]);

test('/inicio redirige a la portada', function () {
    $this->get('/inicio')->assertRedirect('/');
});

test('el listado de socios solo muestra los que están activos', function () {
    $activo = EstadoComercial::firstOrCreate(['nombre' => 'Activo']);
    $inactivo = EstadoComercial::firstOrCreate(['nombre' => 'Inactivo']);
    $categoria = CategoriaAfiliado::create(['nombre' => 'Servicios']);

    $visible = Socio::create([
        'nombre' => 'Empresa Visible',
        'slug' => 'empresa-visible',
        'estado_id' => $activo->id,
        'categoria_id' => $categoria->id,
    ]);

    Socio::create([
        'nombre' => 'Empresa Oculta',
        'slug' => 'empresa-oculta',
        'estado_id' => $inactivo->id,
        'categoria_id' => $categoria->id,
    ]);

    $respuesta = $this->getJson('/api/socios')->assertOk();

    $nombres = collect($respuesta->json('data'))->pluck('nombre');

    expect($nombres)->toContain('Empresa Visible')
        ->and($nombres)->not->toContain('Empresa Oculta');

    $this->getJson("/api/socios/{$visible->slug}")
        ->assertOk()
        ->assertJsonPath('data.nombre', 'Empresa Visible');
});

test('un socio inactivo no es accesible por su slug', function () {
    $inactivo = EstadoComercial::firstOrCreate(['nombre' => 'Inactivo']);

    $socio = Socio::create([
        'nombre' => 'Empresa Oculta',
        'slug' => 'empresa-oculta',
        'estado_id' => $inactivo->id,
    ]);

    $this->getJson("/api/socios/{$socio->slug}")->assertNotFound();
});

// ============================================================
// DIRECTORIO: BÚSQUEDA, SECTOR Y ORDEN
// ============================================================

/**
 * @param  array<string, mixed>  $extra
 */
function socioActivo(string $nombre, array $extra = []): Socio
{
    return Socio::create([
        'nombre' => $nombre,
        'slug' => str($nombre)->slug()->toString(),
        'estado_id' => EstadoComercial::firstOrCreate(['nombre' => 'Activo'])->id,
        ...$extra,
    ]);
}

test('el directorio busca por nombre o por descripción', function () {
    socioActivo('Aceites del Sur');
    socioActivo('Bufete Rojas', ['descripcion' => 'Asesoría en comercio exterior']);
    socioActivo('Vinos Ibéricos');

    $this->getJson('/api/socios?buscar=aceites')
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.nombre', 'Aceites del Sur');

    $this->getJson('/api/socios?buscar=COMERCIO')
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.nombre', 'Bufete Rojas')
        ->assertJsonPath('meta.total', 1);
});

test('el directorio combina la búsqueda con el sector', function () {
    $legal = CategoriaAfiliado::create(['nombre' => 'Legal']);
    $vinos = CategoriaAfiliado::create(['nombre' => 'Vinos']);

    socioActivo('Rojas Abogados', ['categoria_id' => $legal->id]);
    socioActivo('Rojas Bodegas', ['categoria_id' => $vinos->id]);

    $this->getJson("/api/socios?buscar=rojas&categoria={$vinos->id}")
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.nombre', 'Rojas Bodegas');
});

test('el directorio se puede ordenar', function (string $orden, array $esperado) {
    socioActivo('Beta', ['fecha_afiliacion' => '2010-01-01']);
    socioActivo('Alfa', ['fecha_afiliacion' => '2020-01-01']);
    socioActivo('Gamma', ['fecha_afiliacion' => '2015-01-01']);

    $nombres = collect($this->getJson("/api/socios?orden={$orden}")->json('data'))->pluck('nombre')->all();

    expect($nombres)->toBe($esperado);
})->with([
    'nombre' => ['nombre', ['Alfa', 'Beta', 'Gamma']],
    'nombre descendente' => ['nombre_desc', ['Gamma', 'Beta', 'Alfa']],
    'más recientes' => ['recientes', ['Alfa', 'Gamma', 'Beta']],
    'más antiguos' => ['antiguos', ['Beta', 'Gamma', 'Alfa']],
]);

test('un orden desconocido usa el orden recomendado', function () {
    socioActivo('Zeta', ['orden' => 0]);
    socioActivo('Alfa', ['orden' => 5]);

    $this->getJson('/api/socios?orden=cualquiera')
        ->assertOk()
        ->assertJsonPath('data.0.nombre', 'Zeta');
});

test('los sectores traen cuántos socios activos tiene cada uno', function () {
    $legal = CategoriaAfiliado::create(['nombre' => 'Legal']);
    $inactivo = EstadoComercial::firstOrCreate(['nombre' => 'Inactivo']);

    socioActivo('Rojas Abogados', ['categoria_id' => $legal->id]);
    Socio::create([
        'nombre' => 'Oculto Abogados',
        'slug' => 'oculto-abogados',
        'estado_id' => $inactivo->id,
        'categoria_id' => $legal->id,
    ]);

    $this->getJson('/api/socios/categorias')
        ->assertOk()
        ->assertJsonPath('data.0.nombre', 'Legal')
        ->assertJsonPath('data.0.total', 1);
});

test('el listado indica si un socio es destacado', function () {
    socioActivo('Aceites del Sur', ['destacado' => true]);

    $this->getJson('/api/socios')->assertJsonPath('data.0.destacado', true);
});
