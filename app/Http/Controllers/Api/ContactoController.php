<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\EnviarMensajeContactoRequest;
use App\Models\MensajeContacto;
use Illuminate\Http\JsonResponse;

class ContactoController extends Controller
{
    /**
     * POST /api/contacto — guarda el mensaje del formulario público.
     *
     * Los campos se asignan uno a uno: el estado inicial lo pone el modelo y
     * nada de la gestión interna puede llegar desde fuera.
     */
    public function store(EnviarMensajeContactoRequest $request): JsonResponse
    {
        $datos = $request->validated();

        MensajeContacto::create([
            'necesidad' => $datos['necesidad'],
            'nombre' => $datos['nombre'],
            'empresa' => $datos['empresa'],
            'correo_electronico' => $datos['correo'],
            'telefono' => $datos['telefono'],
            'acepta_privacidad' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Gracias por escribirnos. Pronto estaremos en contacto contigo.',
        ], 201);
    }
}
