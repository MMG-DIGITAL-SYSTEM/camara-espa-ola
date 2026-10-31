<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Convenio;
use App\Support\Archivo;
use Illuminate\Http\JsonResponse;

class ConvenioController extends Controller
{
    /**
     * GET /api/convenios — convenios activos, en el orden del panel.
     *
     * Imagen y PDF salen ya como URL pública; los borrados no aparecen porque
     * el modelo usa borrado lógico.
     */
    public function index(): JsonResponse
    {
        $convenios = Convenio::activos()->ordenados()->get();

        return response()->json([
            'success' => true,
            'data' => $convenios->map(fn (Convenio $convenio) => [
                'id' => $convenio->id,
                'nombre' => $convenio->nombre,
                'descripcion' => $convenio->descripcion,
                'imagen' => Archivo::url($convenio->imagen),
                'correo_contacto' => $convenio->correo_electronico,
                'pdf_url' => Archivo::url($convenio->pdf),
            ]),
        ]);
    }
}
