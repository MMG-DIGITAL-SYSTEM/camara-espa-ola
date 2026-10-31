<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\NotificaAlPanel;
use App\Http\Controllers\Controller;
use App\Models\Pagina;
use App\Models\PaginaVersion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PaginaVersionController extends Controller
{
    use NotificaAlPanel;

    /**
     * Historial de la página, para el panel lateral del editor.
     */
    public function index(Pagina $pagina): JsonResponse
    {
        $versiones = $pagina->versiones()
            ->with('autor:id,name')
            ->limit(30)
            ->get()
            ->map(fn (PaginaVersion $version) => [
                'id' => $version->id,
                'etiqueta' => $version->etiqueta,
                'autor' => $version->autor?->name ?? 'Sistema',
                'secciones' => count($version->snapshot ?? []),
                'cuando' => $version->created_at?->locale('es')->diffForHumans(),
                'fecha' => $version->created_at?->locale('es')->isoFormat('D MMM YYYY, HH:mm'),
                'es_la_publicada' => $version->id === $pagina->version_publicada_id,
            ]);

        return response()->json(['versiones' => $versiones]);
    }

    public function publicar(Request $request, Pagina $pagina): RedirectResponse
    {
        $datos = $request->validate(
            ['etiqueta' => ['nullable', 'string', 'max:120']],
            [],
            ['etiqueta' => 'nota'],
        );

        $pagina->publicar($request->user(), $datos['etiqueta'] ?? null);

        return $this->exito('Página publicada.');
    }

    /**
     * Devuelve el borrador al contenido de una versión anterior.
     */
    public function revertir(Pagina $pagina, PaginaVersion $version): RedirectResponse
    {
        $pagina->revertirA($version);

        return $this->exito('Borrador restaurado. Revísalo y publica cuando quieras.');
    }
}
