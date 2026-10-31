<?php

use App\Support\HtmlSeguro;

test('conserva el formato que produce el editor', function () {
    $html = '<h2>Título</h2><p>Un párrafo con <strong>negrita</strong> y <em>cursiva</em>.</p>'
        .'<ul><li>Uno</li><li>Dos</li></ul><blockquote>Una cita</blockquote><hr>';

    expect(HtmlSeguro::limpiar($html))->toBe($html);
});

test('respeta los acentos y la eñe', function () {
    expect(HtmlSeguro::limpiar('<p>Año, España, ¿qué tal? — «comillas»</p>'))
        ->toBe('<p>Año, España, ¿qué tal? — «comillas»</p>');
});

test('elimina scripts con todo su contenido', function () {
    $limpio = HtmlSeguro::limpiar('<p>Antes</p><script>alert("xss")</script><p>Después</p>');

    expect($limpio)->toBe('<p>Antes</p><p>Después</p>')
        ->and($limpio)->not->toContain('alert');
});

test('elimina estilos, iframes y formularios', function (string $html) {
    expect(HtmlSeguro::limpiar('<p>Texto</p>'.$html))->toBe('<p>Texto</p>');
})->with([
    '<style>body{display:none}</style>',
    '<iframe src="https://malo.test"></iframe>',
    '<form action="/robar"><input name="clave"></form>',
    '<object data="x.swf"></object>',
    '<embed src="x.swf">',
]);

test('quita los atributos peligrosos pero conserva el texto', function () {
    $limpio = HtmlSeguro::limpiar('<p onclick="robar()" style="color:red" class="x">Hola</p>');

    expect($limpio)->toBe('<p>Hola</p>');
});

test('desenvuelve las etiquetas no permitidas sin perder el contenido', function () {
    expect(HtmlSeguro::limpiar('<div><p>Uno</p><span>Dos</span></div>'))
        ->toBe('<p>Uno</p>Dos');
});

test('bloquea los enlaces con javascript o data', function (string $href) {
    $limpio = HtmlSeguro::limpiar('<p><a href="'.$href.'">Pulsa</a></p>');

    expect($limpio)->toBe('<p><a>Pulsa</a></p>')
        ->and($limpio)->not->toContain('javascript')
        ->and($limpio)->not->toContain('data:');
})->with([
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    'data:text/html,<script>alert(1)</script>',
]);

test('admite enlaces internos, externos y de correo', function (string $href) {
    expect(HtmlSeguro::limpiar('<p><a href="'.$href.'">Ir</a></p>'))
        ->toBe('<p><a href="'.$href.'">Ir</a></p>');
})->with([
    '/afiliate',
    '#seccion',
    'https://camara.com.bo',
    'http://camara.com.bo',
    'mailto:info@camara.com.bo',
    'tel:+59122345678',
]);

test('un enlace que abre pestaña nueva recibe rel noopener', function () {
    $limpio = HtmlSeguro::limpiar('<p><a href="https://externo.test" target="_blank">Ir</a></p>');

    expect($limpio)->toContain('rel="noopener noreferrer"')
        ->and($limpio)->toContain('target="_blank"');
});

test('un target inventado se descarta', function () {
    expect(HtmlSeguro::limpiar('<p><a href="/x" target="_top">Ir</a></p>'))
        ->toBe('<p><a href="/x">Ir</a></p>');
});

test('elimina los comentarios HTML', function () {
    expect(HtmlSeguro::limpiar('<p>Uno</p><!-- oculto --><p>Dos</p>'))
        ->toBe('<p>Uno</p><p>Dos</p>');
});

test('un valor vacío o nulo devuelve cadena vacía', function (?string $entrada) {
    expect(HtmlSeguro::limpiar($entrada))->toBe('');
})->with([null, '', '   ']);

test('escapa el HTML que llega como texto plano', function () {
    expect(HtmlSeguro::limpiar('<p>5 &lt; 10 y 10 &gt; 5</p>'))
        ->toBe('<p>5 &lt; 10 y 10 &gt; 5</p>');
});

test('el texto plano separa los párrafos y decodifica las entidades', function () {
    $html = '<p><strong>ALMUERZO DE TRABAJO</strong></p><p>Asistió la Cámara&nbsp;de Comercio &amp; socios.</p><ul><li>Uno</li><li>Dos</li></ul>';

    expect(HtmlSeguro::textoPlano($html))
        ->toBe('ALMUERZO DE TRABAJO Asistió la Cámara de Comercio & socios. Uno Dos');
});

test('el texto plano recorta sin romper los acentos', function () {
    expect(HtmlSeguro::textoPlano('<p>Cámara española</p>', 6))->toBe('Cámara...');
});

test('el texto plano de un valor nulo es cadena vacía', function () {
    expect(HtmlSeguro::textoPlano(null))->toBe('');
});
