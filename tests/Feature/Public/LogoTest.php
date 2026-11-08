<?php

test('el logotipo oficial con escudo está en el proyecto', function () {
    $ruta = public_path('images/logo-camara.svg');

    expect($ruta)->toBeFile();

    $svg = simplexml_load_file($ruta);

    expect($svg)->not->toBeFalse()
        ->and($svg->getName())->toBe('svg')
        ->and((string) $svg['viewBox'])->toBe('0 0 421.7 98.5');
});
