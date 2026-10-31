<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\NotificaAlPanel;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\GuardarConvenioRequest;
use App\Models\Convenio;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Administración de convenios. Todavía sin vista propia en el panel: las
 * rutas quedan listas para cuando se construya.
 */
class ConvenioController extends Controller
{
    use NotificaAlPanel;

    /** Carpeta del disco `public` donde viven imágenes y PDF. */
    private const CARPETA = 'convenios';

    public function store(GuardarConvenioRequest $request): RedirectResponse
    {
        $datos = $request->validated();

        Convenio::create([
            ...$this->campos($datos),
            'imagen' => $this->guardarArchivo($request->file('imagen')),
            'pdf' => $this->guardarArchivo($request->file('pdf')),
            'orden' => $datos['orden'] ?? $this->siguienteOrden(),
            'created_by' => $request->user()->id,
            'updated_by' => $request->user()->id,
        ]);

        return $this->exito('Convenio creado.');
    }

    public function update(GuardarConvenioRequest $request, Convenio $convenio): RedirectResponse
    {
        $datos = $request->validated();
        $reemplazados = [];

        $cambios = [
            ...$this->campos($datos),
            'updated_by' => $request->user()->id,
        ];

        if (array_key_exists('orden', $datos) && $datos['orden'] !== null) {
            $cambios['orden'] = $datos['orden'];
        }

        foreach (['imagen', 'pdf'] as $campo) {
            if ($request->hasFile($campo)) {
                $reemplazados[] = $convenio->{$campo};
                $cambios[$campo] = $this->guardarArchivo($request->file($campo));
            }
        }

        $convenio->update($cambios);

        // El archivo anterior se borra solo cuando el nuevo ya quedó guardado.
        Storage::disk('public')->delete(array_filter($reemplazados));

        return $this->exito('Convenio actualizado.');
    }

    /**
     * Borrado lógico: los archivos se conservan por si se restaura.
     */
    public function destroy(Convenio $convenio): RedirectResponse
    {
        $convenio->delete();

        return $this->exito('Convenio eliminado.');
    }

    /**
     * @param  array<string, mixed>  $datos
     * @return array<string, mixed>
     */
    private function campos(array $datos): array
    {
        return [
            'nombre' => $datos['nombre'],
            'descripcion' => $datos['descripcion'],
            'correo_electronico' => $datos['correo_electronico'] ?? null,
            'activo' => $datos['activo'] ?? true,
        ];
    }

    private function guardarArchivo(?UploadedFile $archivo): ?string
    {
        if (! $archivo) {
            return null;
        }

        $nombre = Str::slug(pathinfo($archivo->getClientOriginalName(), PATHINFO_FILENAME));

        return $archivo->storeAs(
            self::CARPETA,
            sprintf('%s-%s.%s', $nombre ?: 'convenio', Str::random(6), $archivo->extension()),
            'public',
        );
    }

    /**
     * Posición al final de la lista. El primero empieza en 0.
     */
    private function siguienteOrden(): int
    {
        $ultimo = Convenio::max('orden');

        return $ultimo === null ? 0 : $ultimo + 1;
    }
}
