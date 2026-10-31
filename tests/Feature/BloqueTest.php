<?php

use App\Bloques\RegistroDeBloques;
use App\Models\Servicio;

/**
 * Claves declaradas en el registro del cliente.
 *
 * @return array<int, string>
 */
function clavesDelRegistroJs(): array
{
    $fuente = file_get_contents(resource_path('js/blocks/registro.ts'));

    preg_match_all("/^\s{8}clave: '([^']+)',/m", (string) $fuente, $coincidencias);

    return $coincidencias[1];
}

test('los registros de bloques de PHP y del cliente coinciden', function () {
    $php = RegistroDeBloques::claves();
    $js = clavesDelRegistroJs();

    expect($js)->not->toBeEmpty('No se pudo leer el registro de bloques del cliente.');

    sort($php);
    sort($js);

    expect($js)->toBe($php);
});

test('solo los bloques dinámicos declaran proveedor de datos', function () {
    expect(RegistroDeBloques::necesitaDatos('servicios'))->toBeTrue()
        ->and(RegistroDeBloques::necesitaDatos('noticias-recientes'))->toBeTrue()
        ->and(RegistroDeBloques::necesitaDatos('hero'))->toBeFalse()
        ->and(RegistroDeBloques::necesitaDatos('texto'))->toBeFalse();
});

test('un bloque desconocido no existe ni devuelve datos', function () {
    expect(RegistroDeBloques::existe('inventado'))->toBeFalse()
        ->and(RegistroDeBloques::datosDe('inventado', []))->toBeNull();
});

test('el proveedor de servicios respeta el límite y omite los inactivos', function () {
    Servicio::create(['titulo' => 'Visible A', 'contenido' => 'x', 'activo' => true, 'orden' => 1]);
    Servicio::create(['titulo' => 'Visible B', 'contenido' => 'x', 'activo' => true, 'orden' => 2]);
    Servicio::create(['titulo' => 'Oculto', 'contenido' => 'x', 'activo' => false, 'orden' => 3]);

    $todos = RegistroDeBloques::datosDe('servicios', []);
    $limitados = RegistroDeBloques::datosDe('servicios', ['limite' => 1]);

    expect($todos)->toHaveCount(2)
        ->and(collect($todos)->pluck('titulo')->all())->toBe(['Visible A', 'Visible B'])
        ->and($limitados)->toHaveCount(1);
});

test('secciones iguales comparten una sola consulta', function () {
    Servicio::create(['titulo' => 'Uno', 'contenido' => 'x', 'activo' => true]);

    $secciones = [
        ['id' => 1, 'bloque' => 'servicios', 'datos' => ['limite' => 1]],
        ['id' => 2, 'bloque' => 'servicios', 'datos' => ['limite' => 1]],
        ['id' => 3, 'bloque' => 'hero', 'datos' => []],
    ];

    DB::enableQueryLog();
    $datos = RegistroDeBloques::datosDeSecciones($secciones);
    $consultas = count(DB::getQueryLog());
    DB::disableQueryLog();

    expect($datos)->toHaveKeys([1, 2])
        ->and($datos)->not->toHaveKey(3)
        ->and($datos[1])->toBe($datos[2])
        ->and($consultas)->toBe(1);
});

test('configuraciones distintas sí consultan por separado', function () {
    Servicio::create(['titulo' => 'Uno', 'contenido' => 'x', 'activo' => true]);
    Servicio::create(['titulo' => 'Dos', 'contenido' => 'x', 'activo' => true]);

    $secciones = [
        ['id' => 1, 'bloque' => 'servicios', 'datos' => ['limite' => 1]],
        ['id' => 2, 'bloque' => 'servicios', 'datos' => ['limite' => 2]],
    ];

    $datos = RegistroDeBloques::datosDeSecciones($secciones);

    expect($datos[1])->toHaveCount(1)
        ->and($datos[2])->toHaveCount(2);
});

test('los campos richtext declarados en PHP coinciden con los del cliente', function () {
    $fuente = (string) file_get_contents(resource_path('js/blocks/registro.ts'));

    // Cada bloque del registro del cliente empieza con `clave: '...'`; se
    // recorre lo que hay entre una clave y la siguiente buscando campos
    // declarados como richtext.
    $trozos = preg_split("/^\s{8}clave: '/m", $fuente);
    array_shift($trozos);

    $esperado = [];

    foreach ($trozos as $trozo) {
        $clave = substr($trozo, 0, strpos($trozo, "'"));

        preg_match_all("/tipo: 'richtext', clave: '([^']+)'/", $trozo, $campos);

        if ($campos[1] !== []) {
            $esperado[$clave] = $campos[1];
        }
    }

    expect($esperado)->not->toBeEmpty('No se detectó ningún campo richtext en el registro del cliente.');

    foreach ($esperado as $bloque => $campos) {
        expect(RegistroDeBloques::camposRichtext($bloque))
            ->toBe($campos, "El bloque «{$bloque}» declara campos richtext distintos en PHP.");
    }

    // Y al revés: nada sobra en PHP.
    foreach (RegistroDeBloques::claves() as $bloque) {
        if (! isset($esperado[$bloque])) {
            expect(RegistroDeBloques::camposRichtext($bloque))
                ->toBe([], "El bloque «{$bloque}» declara richtext en PHP pero no en el cliente.");
        }
    }
});

test('guardar sanea el HTML de los campos enriquecidos', function () {
    $datos = RegistroDeBloques::sanearDatos('texto', [
        'titulo' => 'Sin tocar <b>esto</b>',
        'contenido' => '<p>Hola</p><script>alert(1)</script>',
    ]);

    expect($datos['contenido'])->toBe('<p>Hola</p>')
        // El título es texto plano: no se toca.
        ->and($datos['titulo'])->toBe('Sin tocar <b>esto</b>');
});

test('los campos de color solo admiten hexadecimales', function () {
    $datos = RegistroDeBloques::sanearDatos('portada-modulo', [
        'titulo' => 'Sin tocar',
        'color_titulo' => '#FFF',
        'color_destacado' => '#ef4444',
        'color_fondo' => '#11182780',
        'color_acento' => 'red; background:url(x)',
        'color_cierre' => ['#fff'],
    ]);

    expect($datos)->toBe([
        'titulo' => 'Sin tocar',
        'color_titulo' => '#FFF',
        'color_destacado' => '#ef4444',
        'color_fondo' => '#11182780',
        'color_acento' => '',
        'color_cierre' => '',
    ]);
});

test('sanear un bloque sin campos enriquecidos no cambia nada', function () {
    $datos = ['titulo' => 'Hola', 'boton_enlace' => '/x'];

    expect(RegistroDeBloques::sanearDatos('hero', $datos))->toBe($datos);
});
