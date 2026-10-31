<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\NotificaAlPanel;
use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use App\Models\Pagina;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MenuController extends Controller
{
    use NotificaAlPanel;

    public function index(): Response
    {
        return Inertia::render('Admin/Menu/Index', [
            'menus' => [
                'principal' => $this->arbolEditable(MenuItem::PRINCIPAL),
                'pie' => $this->arbolEditable(MenuItem::PIE),
            ],
            // Sugerencias para el campo de dirección.
            'destinos' => $this->destinos(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $datos = $this->validar($request);

        $ultimo = MenuItem::where('ubicacion', $datos['ubicacion'])
            ->where('padre_id', $datos['padre_id'] ?? null)
            ->max('orden');

        MenuItem::create([
            ...$datos,
            // Se añade al final de su nivel; el primero empieza en 0.
            'orden' => $ultimo === null ? 0 : $ultimo + 1,
        ]);

        return $this->exito('Entrada añadida al menú.');
    }

    public function update(Request $request, MenuItem $item): RedirectResponse
    {
        // Que no dependa de sí misma ni de una subentrada lo rechaza ya la
        // validación (Rule::notIn y el whereNull del exists).
        $item->update($this->validar($request, $item));

        return $this->exito('Entrada actualizada.');
    }

    public function destroy(MenuItem $item): RedirectResponse
    {
        $hijos = $item->hijos()->count();

        $item->delete();

        return $this->exito(
            $hijos > 0
                ? 'Entrada eliminada junto con sus '.$hijos.' subentradas.'
                : 'Entrada eliminada.',
        );
    }

    /**
     * Guarda el orden de un nivel concreto del menú.
     */
    public function reordenar(Request $request): RedirectResponse
    {
        $datos = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:menu_items,id'],
        ]);

        foreach ($datos['ids'] as $orden => $id) {
            MenuItem::whereKey($id)->update(['orden' => $orden]);
        }

        return $this->exito('Orden del menú guardado.');
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function arbolEditable(string $ubicacion): array
    {
        return MenuItem::deLaUbicacion($ubicacion)
            ->whereNull('padre_id')
            ->with(['hijos' => fn ($consulta) => $consulta->withoutGlobalScopes()])
            ->ordenados()
            ->get()
            ->map(fn (MenuItem $item) => [
                ...$this->aFila($item),
                'hijos' => MenuItem::where('padre_id', $item->id)
                    ->ordenados()
                    ->get()
                    ->map(fn (MenuItem $hijo) => $this->aFila($hijo))
                    ->all(),
            ])
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function aFila(MenuItem $item): array
    {
        return [
            'id' => $item->id,
            'titulo' => $item->titulo,
            'url' => $item->url,
            'ubicacion' => $item->ubicacion,
            'padre_id' => $item->padre_id,
            'orden' => $item->orden,
            'activo' => $item->activo,
            'nueva_pestana' => $item->nueva_pestana,
        ];
    }

    /**
     * Direcciones que ya existen en el sitio, para no tener que recordarlas.
     *
     * @return array<int, array{url: string, titulo: string}>
     */
    private function destinos(): array
    {
        $fijas = [
            ['url' => '/', 'titulo' => 'Portada'],
            ['url' => '/la-camara', 'titulo' => 'La Cámara'],
            ['url' => '/actividades', 'titulo' => 'Actividades'],
            ['url' => '/socios', 'titulo' => 'Socios'],
            ['url' => '/servicios', 'titulo' => 'Servicios'],
            ['url' => '/noticias', 'titulo' => 'Noticias'],
            ['url' => '/fichas-pais', 'titulo' => 'Fichas país'],
            ['url' => '/red-camaras', 'titulo' => 'Red de cámaras'],
        ];

        $delConstructor = Pagina::libres()
            ->publicadas()
            ->orderBy('titulo')
            ->get(['slug', 'titulo'])
            ->map(fn (Pagina $pagina) => [
                'url' => '/'.$pagina->slug,
                'titulo' => $pagina->titulo,
            ])
            ->all();

        // Las páginas del constructor pueden repetir una ruta fija (la portada).
        return collect([...$fijas, ...$delConstructor])
            ->unique('url')
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function validar(Request $request, ?MenuItem $item = null): array
    {
        return $request->validate([
            'ubicacion' => ['required', Rule::in([MenuItem::PRINCIPAL, MenuItem::PIE])],
            'titulo' => ['required', 'string', 'max:120'],
            'url' => ['nullable', 'string', 'max:255'],
            'padre_id' => [
                'nullable',
                Rule::exists('menu_items', 'id')->whereNull('padre_id'),
                // Solo dos niveles: un hijo no puede tener hijos.
                Rule::notIn($item ? [$item->id] : []),
            ],
            'activo' => ['required', 'boolean'],
            'nueva_pestana' => ['required', 'boolean'],
        ], [
            'padre_id.exists' => 'La entrada superior elegida no existe o ya es una subentrada.',
        ], [
            'titulo' => 'título',
            'url' => 'dirección',
            'padre_id' => 'entrada superior',
            'nueva_pestana' => 'abrir en pestaña nueva',
        ]);
    }
}
