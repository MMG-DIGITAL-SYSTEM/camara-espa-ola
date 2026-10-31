<?php

namespace App\Http\Controllers;

use App\Bloques\RegistroDeBloques;
use App\Models\Pagina;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaginaController extends Controller
{
    /**
     * Portada del sitio.
     *
     * Se sirve desde el constructor como cualquier otra página. Si todavía no
     * existe o no está publicada se cae a una portada mínima: una web nunca
     * debe responder 404 en su raíz.
     */
    public function portada(Request $request): Response
    {
        $pagina = Pagina::where('slug', 'inicio')->first();

        if ($pagina?->estaPublicada() || ($pagina && $this->puedeVerBorrador($request))) {
            return $this->show($request, 'inicio');
        }

        return Inertia::render('Public/Home');
    }

    /**
     * Muestra una página construida con bloques.
     *
     * El público lee siempre la versión publicada. Quien tiene acceso al panel
     * puede además previsualizar el borrador, que es lo que hace útil el botón
     * «Ver» del editor antes de publicar.
     */
    public function show(Request $request, string $slug): Response
    {
        $pagina = Pagina::where('slug', $slug)->firstOrFail();

        $puedePrevisualizar = $this->puedeVerBorrador($request);
        $enBorrador = ! $pagina->estaPublicada() || $request->boolean('borrador');

        if ($enBorrador) {
            abort_unless($puedePrevisualizar, 404);

            $secciones = array_values(array_filter(
                $pagina->snapshotDelBorrador(),
                fn (array $seccion): bool => $seccion['es_visible'],
            ));
        } else {
            $secciones = $pagina->versionPublicada->seccionesVisibles();
        }

        return Inertia::render('Public/Pagina', [
            'pagina' => [
                'titulo' => $pagina->titulo,
                'slug' => $pagina->slug,
                'seo_titulo' => $pagina->seo_titulo,
                'seo_descripcion' => $pagina->seo_descripcion,
            ],
            'secciones' => $secciones,
            'datos' => RegistroDeBloques::datosDeSecciones($secciones),
            'vistaPrevia' => $enBorrador,
        ]);
    }

    private function puedeVerBorrador(Request $request): bool
    {
        return $request->user()?->accedeAlPanel() ?? false;
    }
}
