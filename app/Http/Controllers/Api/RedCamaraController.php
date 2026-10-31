<?php

// app/Http/Controllers/Api/RedCamaraController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RedCamara;
use App\Support\Archivo;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RedCamaraController extends Controller
{
    /**
     * GET /red-camaras (página pública) o /api/red-camaras (API)
     */
    public function index(Request $request)
    {
        $camaras = RedCamara::activos()
            ->ordenados()
            ->get();

        $data = $camaras->map(function ($camara) {
            return [
                'id' => $camara->id,
                'nombre' => $camara->nombre,
                'pais' => $camara->pais,
                'ciudad' => $camara->ciudad,
                'pagina_web' => $camara->pagina_web,
                'logo' => Archivo::url($camara->logo),
                'orden' => $camara->orden,
                'activo' => $camara->activo,
            ];
        });

        // Si es petición API, devolver JSON
        if ($request->is('api/*')) {
            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        }

        // Si es petición web, renderizar Inertia
        return Inertia::render('Public/RedCamaras', [
            'data' => $data->toArray(),
        ]);
    }

    /**
     * GET /api/red-camaras/{id}
     * Obtener una cámara específica
     */
    public function show($id)
    {
        $camara = RedCamara::activos()->find($id);

        if (! $camara) {
            return response()->json([
                'success' => false,
                'message' => 'Cámara no encontrada',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $camara->id,
                'nombre' => $camara->nombre,
                'pais' => $camara->pais,
                'ciudad' => $camara->ciudad,
                'direccion' => $camara->direccion,
                'telefono' => $camara->telefono,
                'correo' => $camara->correo,
                'pagina_web' => $camara->pagina_web,
                'logo' => Archivo::url($camara->logo),
                'orden' => $camara->orden,
                'activo' => $camara->activo,
            ],
        ]);
    }
}
