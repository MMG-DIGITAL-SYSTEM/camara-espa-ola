<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\NotificaAlPanel;
use App\Http\Controllers\Controller;
use App\Models\Servicio;
use App\Support\Archivo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ServicioController extends Controller
{
    use NotificaAlPanel;

    public function index(): Response
    {
        return Inertia::render('Admin/Servicios/Index', [
            'servicios' => Servicio::ordenados()
                ->get()
                ->map(fn (Servicio $servicio) => [
                    'id' => $servicio->id,
                    'titulo' => $servicio->titulo,
                    'contenido' => $servicio->contenido,
                    'icono' => $servicio->icono,
                    'imagen' => $servicio->imagen,
                    'imagen_url' => Archivo::url($servicio->imagen),
                    'enlace' => $servicio->enlace,
                    'enlace_texto' => $servicio->enlace_texto,
                    'orden' => $servicio->orden,
                    'activo' => $servicio->activo,
                ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Servicio::create([
            ...$this->validar($request),
            'orden' => $this->siguienteOrden(),
            'created_by' => $request->user()->id,
            'updated_by' => $request->user()->id,
        ]);

        return $this->exito('Servicio creado.');
    }

    public function update(Request $request, Servicio $servicio): RedirectResponse
    {
        $servicio->update([
            ...$this->validar($request),
            'updated_by' => $request->user()->id,
        ]);

        return $this->exito('Servicio actualizado.');
    }

    public function destroy(Servicio $servicio): RedirectResponse
    {
        $servicio->delete();

        return $this->exito('Servicio eliminado.');
    }

    /**
     * Guarda el orden que dejó el arrastre en el panel.
     */
    public function reordenar(Request $request): RedirectResponse
    {
        $datos = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:servicios,id'],
        ]);

        foreach ($datos['ids'] as $orden => $id) {
            Servicio::whereKey($id)->update(['orden' => $orden]);
        }

        return $this->exito('Orden guardado.');
    }

    /**
     * Posición al final de la lista. El primer elemento empieza en 0.
     */
    private function siguienteOrden(): int
    {
        $ultimo = Servicio::max('orden');

        return $ultimo === null ? 0 : $ultimo + 1;
    }

    /**
     * @return array<string, mixed>
     */
    private function validar(Request $request): array
    {
        return $request->validate([
            'titulo' => ['required', 'string', 'max:255'],
            'contenido' => ['required', 'string', 'max:2000'],
            'icono' => ['nullable', 'string', 'max:60'],
            'imagen' => ['nullable', 'string', 'max:500'],
            // Ruta del propio sitio (/convenios) o dirección completa.
            'enlace' => ['nullable', 'string', 'max:500', 'regex:#^(/|https?://)#i'],
            'enlace_texto' => ['nullable', 'string', 'max:60'],
            'activo' => ['required', 'boolean'],
        ], [
            'enlace.regex' => 'El enlace debe empezar por «/» (una página del sitio) o por http:// o https://.',
        ], [
            'titulo' => 'título',
            'contenido' => 'descripción',
            'icono' => 'icono',
            'enlace_texto' => 'texto del botón',
        ]);
    }
}
