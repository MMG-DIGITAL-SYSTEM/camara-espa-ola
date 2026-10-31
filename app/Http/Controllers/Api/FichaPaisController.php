<?php

// app/Http/Controllers/Api/FichaPaisController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FichaPais;
use App\Support\Archivo;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FichaPaisController extends Controller
{
    /**
     * GET /fichas-pais (página pública) o /api/fichas-pais (API)
     */
    public function index(Request $request)
    {
        $fichas = FichaPais::activos()
            ->ordenados()
            ->get();

        // Si es petición API (con prefijo api/), devolver JSON
        if ($request->is('api/*')) {
            return response()->json([
                'success' => true,
                'data' => $fichas->map(function ($ficha) {
                    return $this->formatFicha($ficha);
                }),
            ]);
        }

        // Si es petición web, renderizar Inertia
        return Inertia::render('Public/FichasPais', [
            'data' => $fichas->map(function ($ficha) {
                return [
                    'id' => $ficha->id,
                    'pais' => $ficha->pais,
                    'titulo' => $ficha->titulo,
                    'descripcion' => $ficha->descripcion,
                    'pdf_url' => Archivo::url($ficha->pdf_url),
                    'orden' => $ficha->orden,
                    'activo' => $ficha->activo,
                    'fecha_publicacion' => $ficha->fecha_publicacion?->format('d/m/Y'),
                ];
            })->toArray(),
        ]);
    }

    /**
     * GET /fichas-pais/{pais} o /api/fichas-pais/{pais}
     */
    public function show($pais, Request $request)
    {
        $ficha = FichaPais::activos()
            ->porPais($pais)
            ->first();

        if (! $ficha) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ficha no encontrada para el país: '.$pais,
                ], 404);
            }
            abort(404, 'Ficha no encontrada');
        }

        // Si es petición API, devolver JSON
        if ($request->is('api/*')) {
            return response()->json([
                'success' => true,
                'data' => $this->formatFicha($ficha),
            ]);
        }

        // Si es petición web, renderizar Inertia
        return Inertia::render('Public/FichasPais/Show', [
            'data' => [
                'id' => $ficha->id,
                'pais' => $ficha->pais,
                'titulo' => $ficha->titulo,
                'descripcion' => $ficha->descripcion,
                'pdf_url' => Archivo::url($ficha->pdf_url),
                'orden' => $ficha->orden,
                'activo' => $ficha->activo,
                'fecha_publicacion' => $ficha->fecha_publicacion?->format('d/m/Y'),
            ],
        ]);
    }

    /**
     * GET /api/fichas-pais/{pais}/pdf
     * Obtener SOLO el PDF de una ficha
     */
    public function pdf($pais)
    {
        $ficha = FichaPais::activos()
            ->porPais($pais)
            ->first();

        if (! $ficha) {
            return response()->json([
                'success' => false,
                'message' => 'Ficha no encontrada para el país: '.$pais,
            ], 404);
        }

        if (! $ficha->pdf_url) {
            return response()->json([
                'success' => false,
                'message' => 'El PDF no está disponible para este país',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'pais' => $ficha->pais,
                'pdf_url' => Archivo::url($ficha->pdf_url),
            ],
        ]);
    }

    // MÉTODOS PRIVADOS

    private function formatFicha($ficha)
    {
        return [
            'id' => $ficha->id,
            'pais' => $ficha->pais,
            'titulo' => $ficha->titulo,
            'descripcion' => $ficha->descripcion,
            'pdf_url' => Archivo::url($ficha->pdf_url),
            'orden' => $ficha->orden,
            'activo' => $ficha->activo,
            'fecha_publicacion' => $ficha->fecha_publicacion?->format('d/m/Y'),
            'created_at' => $ficha->created_at?->format('d/m/Y H:i'),
            'updated_at' => $ficha->updated_at?->format('d/m/Y H:i'),
        ];
    }
}
