<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Oficina;
use Illuminate\Http\JsonResponse;

class OficinaController extends Controller
{
    /**
     * GET /api/oficinas — oficinas activas para la página de contacto.
     *
     * Solo sale lo que se pinta en la tarjeta: nada de autoría ni fechas.
     */
    public function index(): JsonResponse
    {
        $oficinas = Oficina::activas()->ordenadas()->get();

        return response()->json([
            'success' => true,
            'data' => $oficinas->map(fn (Oficina $oficina) => [
                'id' => $oficina->id,
                'nombre' => $oficina->nombre,
                'ciudad' => $oficina->ciudad,
                'direccion' => $oficina->direccion,
                'referencia' => $oficina->referencia,
                'edificio' => $oficina->edificio,
                'piso' => $oficina->piso,
                'oficina' => $oficina->oficina,
                'telefono' => $oficina->telefono,
                'correo' => $oficina->correo_electronico,
                'responsable' => $oficina->responsable_nombre ? [
                    'nombre' => $oficina->responsable_nombre,
                    'cargo' => $oficina->responsable_cargo,
                ] : null,
                'latitud' => $oficina->latitud,
                'longitud' => $oficina->longitud,
                'mapa_url' => $oficina->urlDelMapa(),
            ]),
        ]);
    }
}
