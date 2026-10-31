<?php

// app/Http/Controllers/Api/ServicioController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Servicio;
use App\Support\Archivo;
use Illuminate\Http\JsonResponse;

class ServicioController extends Controller
{
    /**
     * GET /api/servicios
     * Listado de servicios
     */
    public function index(): JsonResponse
    {
        $servicios = Servicio::activos()
            ->ordenados()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $servicios->map(fn (Servicio $servicio) => $this->datos($servicio)),
        ]);
    }

    /**
     * GET /api/servicios/{id}
     * Detalle de un servicio
     */
    public function show($id): JsonResponse
    {
        $servicio = Servicio::activos()->find($id);

        if (! $servicio) {
            return response()->json([
                'success' => false,
                'message' => 'Servicio no encontrado',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $this->datos($servicio),
        ]);
    }

    /**
     * La imagen puede ser una ruta de `storage` o una URL de la biblioteca de
     * medios: Archivo::url resuelve las dos.
     *
     * @return array<string, mixed>
     */
    private function datos(Servicio $servicio): array
    {
        return [
            'id' => $servicio->id,
            'titulo' => $servicio->titulo,
            'contenido' => $servicio->contenido,
            'icono' => $servicio->icono,
            'imagen' => Archivo::url($servicio->imagen),
            'enlace' => $servicio->enlace,
            'enlace_texto' => $servicio->enlace ? ($servicio->enlace_texto ?: 'Ver más') : null,
            'orden' => $servicio->orden,
        ];
    }
}
