<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\EnviarSolicitudAfiliacionRequest;
use App\Models\SolicitudAfiliacion;
use Illuminate\Http\JsonResponse;

class SolicitudAfiliacionController extends Controller
{
    /**
     * POST /api/solicitudes-afiliacion — registra una solicitud pendiente.
     *
     * Solo se crea la solicitud: ni socio, ni cuenta, ni nada que dé por
     * afiliada a la empresa. El estado inicial lo pone el modelo.
     */
    public function store(EnviarSolicitudAfiliacionRequest $request): JsonResponse
    {
        SolicitudAfiliacion::create($request->safe()->only([
            'nombre_razon_social',
            'representante_legal',
            'escritura_constitucion',
            'fecha',
            'nit',
            'direccion',
            'ciudad',
            'telefono',
            'fax',
            'casilla',
            'correo_electronico',
            'pagina_web',
            'representante_camara',
            'cargo',
            'servicios_productos',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Su solicitud de afiliación fue enviada correctamente. La Cámara la revisará y se pondrá en contacto con usted.',
        ], 201);
    }
}
