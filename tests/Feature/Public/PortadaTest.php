<?php

use App\Bloques\RegistroDeBloques;
use App\Models\Actividad;
use App\Models\Categoria;
use App\Models\ContenidoInstitucional;
use App\Models\EstadoPublicacion;
use App\Models\Pagina;
use App\Models\Servicio;
use App\Models\Visibilidad;
use Database\Factories\PaginaSeccionFactory;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    foreach (['Publicada', 'Borrador'] as $nombre) {
        EstadoPublicacion::firstOrCreate(['nombre' => $nombre]);
    }

    foreach (['Pública', 'Privada'] as $nombre) {
        Visibilidad::firstOrCreate(['nombre' => $nombre]);
    }
});

/**
 * @param  array<string, mixed>  $extra
 */
function actividadDePortada(string $titulo, array $extra = []): Actividad
{
    return Actividad::create([
        'titulo' => $titulo,
        'descripcion' => '<p>Descripción de '.$titulo.'</p>',
        'fecha_publicacion' => '2026-09-01 10:00:00',
        'fecha_evento' => '2026-10-01 10:00:00',
        'estado_id' => EstadoPublicacion::where('nombre', 'Publicada')->value('id'),
        'visibilidad_id' => Visibilidad::where('nombre', 'Pública')->value('id'),
        ...$extra,
    ]);
}

// ============================================================
// PRESENTACIÓN: sale de contenido_institucional
// ============================================================

test('la presentación muestra el texto institucional elegido', function () {
    ContenidoInstitucional::create([
        'seccion' => 'nosotros',
        'titulo' => 'Nosotros',
        'contenido' => 'La Cámara Española es una asociación civil sin fines de lucro.',
    ]);

    expect(RegistroDeBloques::datosDe('presentacion', ['seccion' => 'nosotros']))
        ->toMatchArray([
            'titulo' => 'Nosotros',
            'contenido' => 'La Cámara Española es una asociación civil sin fines de lucro.',
        ]);
});

test('un contenido institucional inactivo no se muestra', function () {
    ContenidoInstitucional::create([
        'seccion' => 'nosotros',
        'titulo' => 'Nosotros',
        'contenido' => 'Texto oculto',
        'activo' => false,
    ]);

    expect(RegistroDeBloques::datosDe('presentacion', ['seccion' => 'nosotros']))->toBeNull();
});

// ============================================================
// ÚLTIMAS ACTIVIDADES: mismas reglas que el módulo
// ============================================================

test('las últimas actividades solo incluyen las publicadas y públicas', function () {
    actividadDePortada('Visible');
    actividadDePortada('Borrador', [
        'estado_id' => EstadoPublicacion::where('nombre', 'Borrador')->value('id'),
    ]);
    actividadDePortada('Privada', [
        'visibilidad_id' => Visibilidad::where('nombre', 'Privada')->value('id'),
    ]);
    actividadDePortada('Eliminada')->delete();

    $titulos = collect(RegistroDeBloques::datosDe('actividades-proximas', ['solo_proximas' => false]))
        ->pluck('titulo')
        ->all();

    expect($titulos)->toBe(['Visible']);
});

test('las últimas actividades van de la más reciente a la más antigua', function () {
    actividadDePortada('Antigua', ['fecha_publicacion' => '2026-01-01 10:00:00']);
    actividadDePortada('Reciente', ['fecha_publicacion' => '2026-09-01 10:00:00']);
    actividadDePortada('Media', ['fecha_publicacion' => '2026-05-01 10:00:00']);

    $datos = RegistroDeBloques::datosDe('actividades-proximas', ['solo_proximas' => false, 'limite' => 2]);

    expect(collect($datos)->pluck('titulo')->all())->toBe(['Reciente', 'Media'])
        ->and($datos[0]['fecha'])->toBe('1 de septiembre de 2026');
});

test('cada actividad trae categorías, extracto en texto plano y el enlace a su detalle', function () {
    $actividad = actividadDePortada('Misión comercial', [
        'descripcion' => '<p>Una <strong>semana</strong> de encuentros&nbsp;con empresas.</p>',
    ]);
    $actividad->categorias()->attach(Categoria::firstOrCreate(['nombre' => 'Ferias'])->id);

    $datos = RegistroDeBloques::datosDe('actividades-proximas', ['solo_proximas' => false])[0];

    expect($datos['categorias'])->toBe(['Ferias'])
        ->and($datos['extracto'])->toBe('Una semana de encuentros con empresas.')
        ->and($datos['url'])->toBe(url('/actividades/'.$actividad->id));
});

// ============================================================
// PORTADA COMPLETA
// ============================================================

/**
 * Página de inicio con los cinco bloques que trae de fábrica. PaginasSeeder
 * ya no sirve como fixture acá: siembra el contenido real del backup, que
 * trae más bloques y evoluciona con cada actualización de datos.
 */
function paginaInicio(): Pagina
{
    $pagina = Pagina::factory()->create(['slug' => 'inicio']);

    $secciones = [
        ['hero', [
            'antetitulo' => 'Cámara Oficial Española en Bolivia',
            'titulo' => 'Cámara de Comercio',
            'titulo_destacado' => 'Española',
            'subtitulo' => 'en Bolivia',
            'alineacion' => 'centro',
            'boton_texto' => 'Afíliate',
            'boton_enlace' => '/afiliate/formulario',
        ]],
        ['presentacion', [
            'antetitulo' => 'Quiénes somos',
            'titulo' => 'Impulsamos las relaciones económicas entre España y Bolivia',
            'seccion' => 'nosotros',
            'boton_texto' => 'Conoce la Cámara',
            'boton_enlace' => '/la-camara',
        ]],
        ['actividades-proximas', [
            'titulo' => 'Últimas actividades',
            'columnas' => '3',
            'limite' => 3,
            'solo_proximas' => false,
            'enlace_texto' => 'Ver todas',
            'enlace' => '/actividades',
        ]],
        ['servicios', [
            'titulo' => 'Nuestros servicios',
            'columnas' => '3',
            'limite' => 6,
            'enlace_texto' => 'Ver todos',
            'enlace' => '/servicios',
        ]],
        ['texto-imagen', [
            'antetitulo' => 'Nuestros socios',
            'titulo' => 'Juntos en Crecimiento: Potenciando Negocios, Forjando Alianzas',
            'contenido' => '<p>Nuestros socios son el corazón de nuestra comunidad empresarial.</p>',
            'posicion_imagen' => 'izquierda',
            'boton_texto' => 'Conoce nuestros socios',
            'boton_enlace' => '/socios',
        ]],
    ];

    foreach ($secciones as $orden => [$bloque, $datos]) {
        PaginaSeccionFactory::new()->bloque($bloque, $datos)->create([
            'pagina_id' => $pagina->id,
            'orden' => $orden,
        ]);
    }

    $pagina->publicar();

    return $pagina;
}

test('la portada resume los módulos con datos reales', function () {
    paginaInicio();

    ContenidoInstitucional::create([
        'seccion' => 'nosotros',
        'titulo' => 'Nosotros',
        'contenido' => 'La Cámara Española es una asociación civil sin fines de lucro.',
    ]);
    actividadDePortada('Desayuno empresarial');
    Servicio::create(['titulo' => 'Asesoría legal', 'contenido' => 'x', 'activo' => true]);

    $portada = Pagina::where('slug', 'inicio')->firstOrFail();
    $secciones = $portada->versionPublicada->seccionesVisibles();
    $idDe = fn (string $bloque): int => collect($secciones)->firstWhere('bloque', $bloque)['id'];

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Public/Pagina')
            ->where('secciones.0.bloque', 'hero')
            ->where('secciones.0.datos.alineacion', 'centro')
            ->where('secciones.0.datos.titulo_destacado', 'Española')
            ->where('secciones.0.datos.boton_enlace', '/afiliate/formulario')
            ->where('secciones.1.bloque', 'presentacion')
            ->where('secciones.2.bloque', 'actividades-proximas')
            ->where('secciones.2.datos.enlace', '/actividades')
            ->where('secciones.3.bloque', 'servicios')
            ->where('secciones.3.datos.enlace', '/servicios')
            ->where('secciones.4.bloque', 'texto-imagen')
            ->where('secciones.4.datos.antetitulo', 'Nuestros socios')
            ->where('secciones.4.datos.boton_enlace', '/socios')
            ->where("datos.{$idDe('presentacion')}.contenido", 'La Cámara Española es una asociación civil sin fines de lucro.')
            ->where("datos.{$idDe('actividades-proximas')}.0.titulo", 'Desayuno empresarial')
            ->where("datos.{$idDe('servicios')}.0.titulo", 'Asesoría legal'));
});

test('la portada no se rompe si los módulos están vacíos', function () {
    paginaInicio();

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Public/Pagina')
            ->has('secciones', 5));
});
