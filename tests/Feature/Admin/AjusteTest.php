<?php

use App\Http\Controllers\Admin\AjusteController;
use App\Models\Ajuste;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

test('los ajustes están reservados al administrador', function () {
    $this->actingAs(User::factory()->editor()->create())
        ->get(route('admin.ajustes.edit'))
        ->assertForbidden();
});

test('el formulario llega agrupado y con los valores actuales', function () {
    Ajuste::guardar(['sitio_nombre' => 'Cámara Española']);

    $this->actingAs($this->admin)
        ->get(route('admin.ajustes.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Ajustes/Index')
            ->where('campos.0.clave', 'sitio_nombre')
            ->where('campos.0.valor', 'Cámara Española')
            ->where('campos.0.grupo', 'Identidad'));
});

test('guardar actualiza solo las claves conocidas', function () {
    $this->actingAs($this->admin)
        ->patch(route('admin.ajustes.update'), [
            'sitio_nombre' => 'Cámara Oficial Española',
            'contacto_correo' => 'info@camara.com.bo',
            // Una clave inventada no debe colarse.
            'clave_pirata' => 'valor',
        ])
        ->assertInertiaFlash('toast.type', 'success');

    expect(Ajuste::valor('sitio_nombre'))->toBe('Cámara Oficial Española')
        ->and(Ajuste::valor('contacto_correo'))->toBe('info@camara.com.bo')
        ->and(Ajuste::where('clave', 'clave_pirata')->exists())->toBeFalse();
});

test('un correo o una dirección mal formados se rechazan', function (string $clave, string $valor) {
    $this->actingAs($this->admin)
        ->patch(route('admin.ajustes.update'), [$clave => $valor])
        ->assertSessionHasErrors($clave);
})->with([
    ['contacto_correo', 'esto-no-es-un-correo'],
    ['red_facebook', 'facebook.com/camara'],
]);

test('los ajustes llegan al sitio público', function () {
    Ajuste::guardar([
        'oficina_sc_direccion' => 'Av. 4to anillo, Equipetrol.',
        'red_linkedin' => 'https://linkedin.com/company/camara',
    ]);

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('ajustes.oficina_sc_direccion', 'Av. 4to anillo, Equipetrol.')
            ->where('ajustes.red_linkedin', 'https://linkedin.com/company/camara'));
});

test('guardar invalida la caché de los ajustes', function () {
    Ajuste::guardar(['sitio_nombre' => 'Antes']);
    expect(Ajuste::valor('sitio_nombre'))->toBe('Antes');

    $this->actingAs($this->admin)->patch(route('admin.ajustes.update'), [
        'sitio_nombre' => 'Después',
    ]);

    expect(Ajuste::valor('sitio_nombre'))->toBe('Después');
});

test('las claves de PHP y las del cliente coinciden', function () {
    $fuente = (string) file_get_contents(resource_path('js/types/ajustes.ts'));

    // Cada miembro de la unión va en su línea; la última lleva punto y coma.
    preg_match_all("/^\s*\|\s*'([a-z_]+)';?\s*$/m", $fuente, $coincidencias);

    $js = $coincidencias[1];
    $php = AjusteController::claves();

    sort($js);
    sort($php);

    expect($js)->toBe($php);
});
