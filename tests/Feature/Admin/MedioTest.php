<?php

use App\Models\Medio;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    Storage::fake('public');
    $this->editor = User::factory()->editor()->create();
});

test('un usuario sin acceso al panel no entra a la biblioteca', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('admin.medios.index'))
        ->assertForbidden();
});

test('subir una imagen la guarda con sus dimensiones', function () {
    $this->actingAs($this->editor)
        ->post(route('admin.medios.store'), [
            'archivos' => [UploadedFile::fake()->image('Logo Cámara.png', 800, 600)],
        ])
        ->assertInertiaFlash('toast.type', 'success');

    $medio = Medio::sole();

    expect($medio->nombre_original)->toBe('Logo Cámara.png')
        ->and($medio->ancho)->toBe(800)
        ->and($medio->alto)->toBe(600)
        ->and($medio->esImagen())->toBeTrue()
        ->and($medio->created_by)->toBe($this->editor->id);

    Storage::disk('public')->assertExists($medio->ruta);
});

test('el disco publico puede usar almacenamiento persistente externo al despliegue', function () {
    $rutaPersistente = sys_get_temp_dir().'/camara-public-'.bin2hex(random_bytes(8));

    config([
        'filesystems.disks.public.root' => $rutaPersistente,
        'filesystems.links' => [public_path('storage') => $rutaPersistente],
    ]);
    Storage::forgetDisk('public');

    try {
        $this->actingAs($this->editor)
            ->post(route('admin.medios.store'), [
                'archivos' => [UploadedFile::fake()->image('persistente.png')],
            ])
            ->assertInertiaFlash('toast.type', 'success');

        $medio = Medio::sole();
        $archivoPersistente = $rutaPersistente.'/'.$medio->ruta;

        expect(file_exists($archivoPersistente))->toBeTrue()
            ->and(config('filesystems.links')[public_path('storage')])->toBe($rutaPersistente);
    } finally {
        Storage::forgetDisk('public');
        File::deleteDirectory($rutaPersistente);
    }
});

test('el nombre del archivo se normaliza pero se conserva el original', function () {
    $this->actingAs($this->editor)
        ->post(route('admin.medios.store'), [
            'archivos' => [UploadedFile::fake()->image('Foto de la Cámara (2026).jpg')],
        ]);

    $medio = Medio::sole();

    expect($medio->ruta)->toStartWith('medios/'.now()->format('Y/m'))
        ->and($medio->ruta)->toMatch('/foto-de-la-camara-2026-[a-zA-Z0-9]{6}\.jpg$/')
        ->and($medio->nombre_original)->toBe('Foto de la Cámara (2026).jpg');
});

test('se pueden subir varios archivos de una vez', function () {
    $this->actingAs($this->editor)
        ->post(route('admin.medios.store'), [
            'archivos' => [
                UploadedFile::fake()->image('uno.png'),
                UploadedFile::fake()->image('dos.png'),
                UploadedFile::fake()->create('tres.pdf', 100, 'application/pdf'),
            ],
        ]);

    expect(Medio::count())->toBe(3)
        ->and(Medio::where('mime', 'application/pdf')->sole()->esImagen())->toBeFalse();
});

test('un tipo de archivo no admitido se rechaza', function () {
    $this->actingAs($this->editor)
        ->post(route('admin.medios.store'), [
            'archivos' => [UploadedFile::fake()->create('malicioso.php', 10)],
        ])
        ->assertSessionHasErrors('archivos.0');

    expect(Medio::count())->toBe(0);
});

test('un archivo demasiado grande se rechaza', function () {
    $this->actingAs($this->editor)
        ->post(route('admin.medios.store'), [
            // El límite son 8 MB.
            'archivos' => [UploadedFile::fake()->create('enorme.pdf', 9000, 'application/pdf')],
        ])
        ->assertSessionHasErrors('archivos.0');

    expect(Medio::count())->toBe(0);
});

test('el listado se filtra por nombre y por tipo', function () {
    $this->actingAs($this->editor)->post(route('admin.medios.store'), [
        'archivos' => [
            UploadedFile::fake()->image('cartel-feria.png'),
            UploadedFile::fake()->create('memoria.pdf', 50, 'application/pdf'),
        ],
    ]);

    $this->actingAs($this->editor)
        ->get(route('admin.medios.index', ['buscar' => 'cartel']))
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Medios/Index')
            ->has('medios.data', 1)
            ->where('medios.data.0.nombre', 'cartel-feria.png'));

    $this->actingAs($this->editor)
        ->get(route('admin.medios.index', ['tipo' => 'documentos']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('medios.data', 1)
            ->where('medios.data.0.nombre', 'memoria.pdf'));

    $this->actingAs($this->editor)
        ->get(route('admin.medios.index', ['tipo' => 'imagenes']))
        ->assertInertia(fn (Assert $page) => $page->has('medios.data', 1));
});

test('el selector del editor devuelve el listado en JSON', function () {
    $this->actingAs($this->editor)->post(route('admin.medios.store'), [
        'archivos' => [UploadedFile::fake()->image('logo.png', 400, 200)],
    ]);

    $respuesta = $this->actingAs($this->editor)
        ->getJson(route('admin.medios.listar'))
        ->assertOk();

    expect($respuesta->json('data.0.nombre'))->toBe('logo.png')
        ->and($respuesta->json('data.0.es_imagen'))->toBeTrue()
        ->and($respuesta->json('data.0.url'))->toContain('logo');
});

test('se puede guardar el texto alternativo', function () {
    $medio = Medio::create([
        'disco' => 'public',
        'ruta' => 'medios/2026/09/x.png',
        'nombre_original' => 'x.png',
        'mime' => 'image/png',
        'tamano' => 1000,
    ]);

    $this->actingAs($this->editor)
        ->patch(route('admin.medios.update', $medio), ['alt' => 'Sede de la Cámara'])
        ->assertInertiaFlash('toast.type', 'success');

    expect($medio->fresh()->alt)->toBe('Sede de la Cámara');
});

test('eliminar un medio borra también el archivo del disco', function () {
    $this->actingAs($this->editor)->post(route('admin.medios.store'), [
        'archivos' => [UploadedFile::fake()->image('borrame.png')],
    ]);

    $medio = Medio::sole();
    $ruta = $medio->ruta;

    Storage::disk('public')->assertExists($ruta);

    $this->actingAs($this->editor)
        ->delete(route('admin.medios.destroy', $medio))
        ->assertInertiaFlash('toast.type', 'success');

    Storage::disk('public')->assertMissing($ruta);
    expect(Medio::count())->toBe(0);
});
