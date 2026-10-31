<?php

use App\Bloques\RegistroDeBloques;
use App\Bloques\RegistroDeElementos;

/**
 * Claves declaradas en el catálogo de elementos del cliente.
 *
 * @return array<int, string>
 */
function clavesDeElementosJs(): array
{
    $fuente = file_get_contents(resource_path('js/blocks/elementos.ts'));

    preg_match_all("/^\s{8}clave: '([^']+)',/m", (string) $fuente, $coincidencias);

    return $coincidencias[1];
}

test('los catálogos de elementos de PHP y del cliente coinciden', function () {
    $php = RegistroDeElementos::claves();
    $js = clavesDeElementosJs();

    expect($js)->not->toBeEmpty('No se pudo leer el catálogo de elementos del cliente.');

    sort($php);
    sort($js);

    expect($js)->toBe($php);
});

test('los campos richtext de los elementos coinciden en PHP y en el cliente', function () {
    $fuente = (string) file_get_contents(resource_path('js/blocks/elementos.ts'));

    $trozos = preg_split("/^\s{8}clave: '/m", $fuente);
    array_shift($trozos);

    $esperado = [];

    foreach ($trozos as $trozo) {
        $clave = substr($trozo, 0, (int) strpos($trozo, "'"));

        preg_match_all("/tipo: 'richtext', clave: '([^']+)'/", $trozo, $campos);

        if ($campos[1] !== []) {
            $esperado[$clave] = $campos[1];
        }
    }

    expect($esperado)->not->toBeEmpty('No se detectó ningún campo richtext entre los elementos.');

    foreach (RegistroDeElementos::claves() as $elemento) {
        expect(RegistroDeElementos::camposRichtext($elemento))
            ->toBe($esperado[$elemento] ?? [], "El elemento «{$elemento}» declara campos richtext distintos en PHP.");
    }
});

test('el lienzo es el único bloque que admite elementos', function () {
    expect(RegistroDeBloques::admiteElementos('lienzo'))->toBeTrue()
        ->and(RegistroDeBloques::admiteElementos('hero'))->toBeFalse()
        ->and(RegistroDeBloques::existe('lienzo'))->toBeTrue();
});

test('sanear un lienzo limpia el HTML de cada pieza', function () {
    $datos = RegistroDeBloques::sanearDatos('lienzo', [
        'elementos' => [
            [
                'clave' => 'e1',
                'elemento' => 'parrafo',
                'ancho' => 'mitad',
                'datos' => ['contenido' => '<p>Hola</p><script>alert(1)</script>'],
            ],
        ],
    ]);

    expect($datos['elementos'][0]['datos']['contenido'])->toBe('<p>Hola</p>')
        ->and($datos['elementos'][0]['ancho'])->toBe('mitad');
});

test('un elemento que no existe en el catálogo se descarta', function () {
    $datos = RegistroDeBloques::sanearDatos('lienzo', [
        'elementos' => [
            ['clave' => 'e1', 'elemento' => 'inventado', 'datos' => []],
            ['clave' => 'e2', 'elemento' => 'titulo', 'datos' => ['texto' => 'Sigo aquí']],
        ],
    ]);

    expect($datos['elementos'])->toHaveCount(1)
        ->and($datos['elementos'][0]['datos']['texto'])->toBe('Sigo aquí');
});

test('un ancho fuera de la rejilla vuelve al valor por defecto', function (mixed $ancho) {
    $datos = RegistroDeBloques::sanearDatos('lienzo', [
        'elementos' => [
            ['clave' => 'e1', 'elemento' => 'titulo', 'ancho' => $ancho, 'datos' => []],
        ],
    ]);

    expect($datos['elementos'][0]['ancho'])->toBe(RegistroDeElementos::ANCHO_POR_DEFECTO);
})->with([
    'inventado',
    'col-span-7',
    ['', 'vacío'],
]);

test('un lienzo sin lista de elementos se guarda vacío en lugar de fallar', function () {
    expect(RegistroDeBloques::sanearDatos('lienzo', [])['elementos'])->toBe([])
        ->and(RegistroDeBloques::sanearDatos('lienzo', ['elementos' => 'texto suelto'])['elementos'])->toBe([]);
});

test('el texto plano de una pieza no se escapa', function () {
    $datos = RegistroDeBloques::sanearDatos('lienzo', [
        'elementos' => [
            [
                'clave' => 'e1',
                'elemento' => 'tarjeta',
                'ancho' => 'tercio',
                'datos' => ['titulo' => 'Costes < 10%', 'icono' => 'award'],
            ],
        ],
    ]);

    expect($datos['elementos'][0]['datos']['titulo'])->toBe('Costes < 10%');
});
