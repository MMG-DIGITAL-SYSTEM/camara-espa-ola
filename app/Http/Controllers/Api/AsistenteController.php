<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\AsistenteCamara;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AsistenteController extends Controller
{
    public function store(Request $request, AsistenteCamara $asistente): JsonResponse
    {
        $datos = $request->validate([
            'mensaje' => ['required', 'string', 'max:500'],
        ]);

        return response()->json($asistente->responder($datos['mensaje']));
    }
}
