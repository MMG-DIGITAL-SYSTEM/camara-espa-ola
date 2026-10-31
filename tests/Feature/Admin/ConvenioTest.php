<?php

use App\Models\Convenio;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
    $this->editor = User::factory()->editor()->create();
});

/**
 * @param  array<string, mixed>  $extra
 * @return array<string, mixed>
 */
function datosDeConvenio(array $extra = []): array
{
    return [
        'nombre' => 'UNIR - Universidad del Internet',
        'descripcion' => 'UNIR ofrece descuentos del 10% en todos sus cursos para los empleados de las empresas socias de la Cámara.',
        'correo_electronico' => 'contacto@unir.test',
        'imagen' => UploadedFile::fake()->image('unir.jpg', 800, 600),
        'pdf' => UploadedFile::fake()->create('convenio-unir.pdf', 200, 'application/pdf'),
        ...$extra,
    ];
}

// ============================================================
// ACCESO
// ============================================================

test('un usuario sin acceso al panel no puede crear convenios', function () {
    $this->actingAs(User::factory()->create())
        ->post(route('admin.convenios.store'), datosDeConvenio())
        ->assertForbidden();

    expect(Convenio::count())->toBe(0);
});

// ============================================================
// CREAR, EDITAR Y BORRAR
// ============================================================

test('crear un convenio guarda imagen y PDF en storage y solo sus rutas en la base', function () {
    $this->actingAs($this->editor)
        ->post(route('admin.convenios.store'), datosDeConvenio())
        ->assertInertiaFlash('toast.type', 'success');

    $convenio = Convenio::firstOrFail();

    expect($convenio->imagen)->toStartWith('convenios/unir-')->toEndWith('.jpg')
        ->and($convenio->pdf)->toStartWith('convenios/convenio-unir-')->toEndWith('.pdf')
        ->and($convenio->correo_electronico)->toBe('contacto@unir.test')
        ->and($convenio->activo)->toBeTrue()
        ->and($convenio->orden)->toBe(0)
        ->and($convenio->created_by)->toBe($this->editor->id);

    Storage::disk('public')->assertExists([$convenio->imagen, $convenio->pdf]);
});

test('imagen, PDF y correo son opcionales', function () {
    $this->actingAs($this->editor)
        ->post(route('admin.convenios.store'), datosDeConvenio([
            'imagen' => null,
            'pdf' => null,
            'correo_electronico' => '',
        ]))
        ->assertSessionHasNoErrors();

    $convenio = Convenio::firstOrFail();

    expect($convenio->imagen)->toBeNull()
        ->and($convenio->pdf)->toBeNull()
        ->and($convenio->correo_electronico)->toBeNull();
});

test('los convenios nuevos se colocan al final', function () {
    $this->actingAs($this->editor)->post(route('admin.convenios.store'), datosDeConvenio());
    $this->actingAs($this->editor)->post(route('admin.convenios.store'), datosDeConvenio(['nombre' => 'Otro']));

    expect(Convenio::orderBy('id')->pluck('orden')->all())->toBe([0, 1]);
});

test('reemplazar la imagen y el PDF borra los archivos anteriores', function () {
    $this->actingAs($this->editor)->post(route('admin.convenios.store'), datosDeConvenio());
    $convenio = Convenio::firstOrFail();
    [$imagenVieja, $pdfViejo] = [$convenio->imagen, $convenio->pdf];

    $this->actingAs($this->editor)->post(route('admin.convenios.update', $convenio), [
        ...datosDeConvenio([
            'imagen' => UploadedFile::fake()->image('unir-2026.png'),
            'pdf' => UploadedFile::fake()->create('nuevo.pdf', 100, 'application/pdf'),
        ]),
        '_method' => 'PATCH',
    ])->assertSessionHasNoErrors();

    $convenio->refresh();

    expect($convenio->imagen)->not->toBe($imagenVieja)->toEndWith('.png')
        ->and($convenio->pdf)->not->toBe($pdfViejo);

    Storage::disk('public')->assertMissing([$imagenVieja, $pdfViejo]);
    Storage::disk('public')->assertExists([$convenio->imagen, $convenio->pdf]);
});

test('editar sin archivos nuevos conserva los que ya tenía', function () {
    $this->actingAs($this->editor)->post(route('admin.convenios.store'), datosDeConvenio());
    $convenio = Convenio::firstOrFail();

    $this->actingAs($this->editor)->patch(route('admin.convenios.update', $convenio), [
        'nombre' => 'UNIR',
        'descripcion' => 'Nueva descripción',
        'correo_electronico' => 'otro@unir.test',
        'orden' => 5,
        'activo' => false,
    ])->assertSessionHasNoErrors();

    $actualizado = $convenio->fresh();

    expect($actualizado->nombre)->toBe('UNIR')
        ->and($actualizado->imagen)->toBe($convenio->imagen)
        ->and($actualizado->pdf)->toBe($convenio->pdf)
        ->and($actualizado->orden)->toBe(5)
        ->and($actualizado->activo)->toBeFalse();
});

test('eliminar es un borrado lógico que conserva los archivos', function () {
    $this->actingAs($this->editor)->post(route('admin.convenios.store'), datosDeConvenio());
    $convenio = Convenio::firstOrFail();

    $this->actingAs($this->editor)
        ->delete(route('admin.convenios.destroy', $convenio))
        ->assertInertiaFlash('toast.type', 'success');

    expect(Convenio::count())->toBe(0)
        ->and(Convenio::withTrashed()->count())->toBe(1);

    Storage::disk('public')->assertExists([$convenio->imagen, $convenio->pdf]);
});

// ============================================================
// VALIDACIÓN
// ============================================================

test('nombre y descripción son obligatorios', function (string $campo) {
    $this->actingAs($this->editor)
        ->post(route('admin.convenios.store'), datosDeConvenio([$campo => '']))
        ->assertSessionHasErrors($campo);
})->with(['nombre', 'descripcion']);

test('un correo inválido se rechaza', function () {
    $this->actingAs($this->editor)
        ->post(route('admin.convenios.store'), datosDeConvenio(['correo_electronico' => 'no-es-correo']))
        ->assertSessionHasErrors('correo_electronico');
});

test('la imagen solo admite JPG, PNG o WebP de hasta 4 MB', function (UploadedFile $archivo) {
    $this->actingAs($this->editor)
        ->post(route('admin.convenios.store'), datosDeConvenio(['imagen' => $archivo]))
        ->assertSessionHasErrors('imagen');
})->with([
    'un PDF' => fn () => UploadedFile::fake()->create('imagen.pdf', 50, 'application/pdf'),
    'un SVG' => fn () => UploadedFile::fake()->create('logo.svg', 5, 'image/svg+xml'),
    'demasiado pesada' => fn () => UploadedFile::fake()->image('enorme.jpg')->size(5000),
]);

test('el detalle solo admite un PDF real de hasta 10 MB', function (UploadedFile $archivo) {
    $this->actingAs($this->editor)
        ->post(route('admin.convenios.store'), datosDeConvenio(['pdf' => $archivo]))
        ->assertSessionHasErrors('pdf');
})->with([
    'una imagen' => fn () => UploadedFile::fake()->image('detalle.jpg'),
    'texto renombrado a .pdf' => fn () => UploadedFile::fake()->create('falso.pdf', 10, 'text/plain'),
    'demasiado pesado' => fn () => UploadedFile::fake()->create('enorme.pdf', 11000, 'application/pdf'),
]);

test('el orden no puede ser negativo', function () {
    $this->actingAs($this->editor)
        ->post(route('admin.convenios.store'), datosDeConvenio(['orden' => -1]))
        ->assertSessionHasErrors('orden');
});
