<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\NotificaAlPanel;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\GuardarContenidoInstitucionalRequest;
use App\Models\ContenidoInstitucional;
use App\Support\Archivo;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Textos fijos de la página «La Cámara»: organización, nosotros, misión,
 * visión y estatutos. Las secciones las define la página, así que aquí solo
 * se editan; no se crean ni se borran.
 */
class ContenidoInstitucionalController extends Controller
{
    use NotificaAlPanel;

    /** Nombre legible de cada sección, en el orden de la página. */
    private const SECCIONES = [
        'nuestra_organizacion' => 'Nuestra organización',
        'nosotros' => 'Nosotros',
        'mision' => 'Misión',
        'vision' => 'Visión',
        'estatutos' => 'Estatutos',
    ];

    /** Secciones cuyo PDF se muestra en la página. */
    private const CON_PDF = ['estatutos'];

    public function index(): Response
    {
        return Inertia::render('Admin/ContenidoInstitucional/Index', [
            'secciones' => ContenidoInstitucional::ordenados()
                ->get()
                ->map(fn (ContenidoInstitucional $seccion) => [
                    'id' => $seccion->id,
                    'seccion' => $seccion->seccion,
                    'nombre' => self::SECCIONES[$seccion->seccion] ?? $seccion->seccion,
                    'titulo' => $seccion->titulo,
                    'contenido' => $seccion->contenido,
                    'imagen' => $seccion->imagen,
                    'imagen_url' => Archivo::url($seccion->imagen),
                    'pdf' => $seccion->pdf,
                    'pdf_url' => Archivo::url($seccion->pdf),
                    'admite_pdf' => in_array($seccion->seccion, self::CON_PDF, true),
                    'activo' => $seccion->activo,
                ]),
        ]);
    }

    public function update(GuardarContenidoInstitucionalRequest $request, ContenidoInstitucional $contenido): RedirectResponse
    {
        $contenido->update([
            ...$request->validated(),
            'updated_by' => $request->user()->id,
        ]);

        return $this->exito('Sección actualizada.');
    }
}
