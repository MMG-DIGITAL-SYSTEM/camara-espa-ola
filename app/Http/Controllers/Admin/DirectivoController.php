<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\NotificaAlPanel;
use App\Http\Controllers\Controller;
use App\Models\Directivo;
use App\Support\Archivo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DirectivoController extends Controller
{
    use NotificaAlPanel;

    public function index(): Response
    {
        return Inertia::render('Admin/Directivos/Index', [
            'directivos' => Directivo::ordenados()
                ->get()
                ->map(fn (Directivo $directivo) => [
                    'id' => $directivo->id,
                    'nombre' => $directivo->nombre,
                    'cargo' => $directivo->cargo,
                    'empresa' => $directivo->empresa,
                    'imagen' => $directivo->imagen,
                    'imagen_url' => Archivo::url($directivo->imagen),
                    'orden' => $directivo->orden,
                    'activo' => $directivo->activo,
                ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Directivo::create([
            ...$this->validar($request),
            'orden' => $this->siguienteOrden(),
            'created_by' => $request->user()->id,
            'updated_by' => $request->user()->id,
        ]);

        return $this->exito('Persona añadida al directorio.');
    }

    public function update(Request $request, Directivo $directivo): RedirectResponse
    {
        $directivo->update([
            ...$this->validar($request),
            'updated_by' => $request->user()->id,
        ]);

        return $this->exito('Directorio actualizado.');
    }

    public function destroy(Directivo $directivo): RedirectResponse
    {
        $directivo->delete();

        return $this->exito('Persona retirada del directorio.');
    }

    public function reordenar(Request $request): RedirectResponse
    {
        $datos = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:directivos,id'],
        ]);

        foreach ($datos['ids'] as $orden => $id) {
            Directivo::whereKey($id)->update(['orden' => $orden]);
        }

        return $this->exito('Orden guardado.');
    }

    /**
     * Posición al final de la lista. El primer elemento empieza en 0.
     */
    private function siguienteOrden(): int
    {
        $ultimo = Directivo::max('orden');

        return $ultimo === null ? 0 : $ultimo + 1;
    }

    /**
     * @return array<string, mixed>
     */
    private function validar(Request $request): array
    {
        return $request->validate([
            'nombre' => ['required', 'string', 'max:255'],
            'cargo' => ['nullable', 'string', 'max:255'],
            'empresa' => ['nullable', 'string', 'max:255'],
            'imagen' => ['nullable', 'string', 'max:500'],
            'activo' => ['required', 'boolean'],
        ]);
    }
}
