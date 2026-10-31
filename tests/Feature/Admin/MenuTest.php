<?php

use App\Models\MenuItem;
use App\Models\Pagina;
use App\Models\User;
use Database\Factories\PaginaSeccionFactory;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->editor = User::factory()->editor()->create();
});

/**
 * @param  array<string, mixed>  $extra
 * @return array<string, mixed>
 */
function datosDeEntrada(array $extra = []): array
{
    return [
        'ubicacion' => MenuItem::PRINCIPAL,
        'titulo' => 'La Cámara',
        'url' => '/la-camara',
        'padre_id' => null,
        'activo' => true,
        'nueva_pestana' => false,
        ...$extra,
    ];
}

test('un usuario sin acceso al panel no gestiona el menú', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('admin.menu.index'))
        ->assertForbidden();
});

test('el panel muestra los dos menús con su jerarquía', function () {
    $padre = MenuItem::create(datosDeEntrada());
    MenuItem::create(datosDeEntrada([
        'titulo' => 'Quiénes somos',
        'padre_id' => $padre->id,
    ]));
    MenuItem::create(datosDeEntrada([
        'ubicacion' => MenuItem::PIE,
        'titulo' => 'Contacto',
        'url' => '/contacto',
    ]));

    $this->actingAs($this->editor)
        ->get(route('admin.menu.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Menu/Index')
            ->has('menus.principal', 1)
            ->where('menus.principal.0.titulo', 'La Cámara')
            ->has('menus.principal.0.hijos', 1)
            ->where('menus.principal.0.hijos.0.titulo', 'Quiénes somos')
            ->has('menus.pie', 1)
            ->has('destinos'));
});

test('las páginas publicadas del constructor se ofrecen como destino', function () {
    $pagina = Pagina::factory()->create(['slug' => 'afiliate', 'titulo' => 'Afíliate']);
    PaginaSeccionFactory::new()->create(['pagina_id' => $pagina->id]);
    $pagina->publicar();

    Pagina::factory()->create(['slug' => 'en-obras', 'titulo' => 'En obras']);

    $respuesta = $this->actingAs($this->editor)
        ->get(route('admin.menu.index'));

    $destinos = collect($respuesta->viewData('page')['props']['destinos'])->pluck('url');

    expect($destinos)->toContain('/afiliate')
        // Una página sin publicar no se ofrece: llevaría a un 404.
        ->and($destinos)->not->toContain('/en-obras');
});

test('una entrada nueva se coloca al final de su nivel', function () {
    MenuItem::create(datosDeEntrada(['titulo' => 'Primera', 'orden' => 0]));

    $this->actingAs($this->editor)
        ->post(route('admin.menu.store'), datosDeEntrada(['titulo' => 'Segunda']))
        ->assertInertiaFlash('toast.type', 'success');

    expect(MenuItem::where('titulo', 'Segunda')->value('orden'))->toBe(1);
});

test('una subentrada cuelga de su padre y se ordena aparte', function () {
    $padre = MenuItem::create(datosDeEntrada(['orden' => 0]));

    $this->actingAs($this->editor)->post(route('admin.menu.store'), datosDeEntrada([
        'titulo' => 'Quiénes somos',
        'padre_id' => $padre->id,
    ]));

    $hijo = MenuItem::where('titulo', 'Quiénes somos')->sole();

    // El primer hijo empieza en 0 aunque el padre ya esté en 0.
    expect($hijo->padre_id)->toBe($padre->id)
        ->and($hijo->orden)->toBe(0);
});

test('una entrada sin dirección es solo un desplegable', function () {
    $this->actingAs($this->editor)
        ->post(route('admin.menu.store'), datosDeEntrada([
            'titulo' => 'España · Bolivia',
            'url' => null,
        ]))
        ->assertSessionHasNoErrors();

    expect(MenuItem::where('titulo', 'España · Bolivia')->value('url'))->toBeNull();
});

test('no se admiten tres niveles', function () {
    $padre = MenuItem::create(datosDeEntrada());
    $hijo = MenuItem::create(datosDeEntrada([
        'titulo' => 'Hijo',
        'padre_id' => $padre->id,
    ]));

    $this->actingAs($this->editor)
        ->post(route('admin.menu.store'), datosDeEntrada([
            'titulo' => 'Nieto',
            'padre_id' => $hijo->id,
        ]))
        ->assertSessionHasErrors('padre_id');
});

test('una entrada no puede depender de sí misma', function () {
    $item = MenuItem::create(datosDeEntrada());

    $this->actingAs($this->editor)
        ->patch(route('admin.menu.update', $item), datosDeEntrada(['padre_id' => $item->id]))
        ->assertSessionHasErrors('padre_id');

    expect($item->fresh()->padre_id)->toBeNull();
});

test('reordenar guarda el orden nuevo', function () {
    $a = MenuItem::create(datosDeEntrada(['titulo' => 'A', 'orden' => 0]));
    $b = MenuItem::create(datosDeEntrada(['titulo' => 'B', 'orden' => 1]));

    $this->actingAs($this->editor)
        ->post(route('admin.menu.reordenar'), ['ids' => [$b->id, $a->id]])
        ->assertInertiaFlash('toast.type', 'success');

    expect($b->fresh()->orden)->toBe(0)
        ->and($a->fresh()->orden)->toBe(1);
});

test('eliminar un padre se lleva sus subentradas', function () {
    $padre = MenuItem::create(datosDeEntrada());
    $hijo = MenuItem::create(datosDeEntrada(['titulo' => 'Hijo', 'padre_id' => $padre->id]));

    $this->actingAs($this->editor)
        ->delete(route('admin.menu.destroy', $padre))
        ->assertInertiaFlash('toast.type', 'success');

    $this->assertDatabaseMissing('menu_items', ['id' => $hijo->id]);
});

test('los cambios se reflejan en el sitio', function () {
    $this->actingAs($this->editor)->post(route('admin.menu.store'), datosDeEntrada([
        'titulo' => 'Afíliate',
        'url' => '/afiliate',
    ]));

    $this->get('/')
        ->assertInertia(fn (Assert $page) => $page
            ->where('menus.principal.0.titulo', 'Afíliate')
            ->where('menus.principal.0.url', '/afiliate'));
});
