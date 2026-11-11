<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\EnviarComentarioRequest;
use App\Models\Actividad;
use App\Models\Noticia;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;

/**
 * Comentarios de los visitantes. Entran pendientes: se ven en el sitio
 * cuando alguien del panel los aprueba.
 */
class ComentarioController extends Controller
{
    public function comentarNoticia(EnviarComentarioRequest $request, string $slug): JsonResponse
    {
        $noticia = Noticia::activas()->where('slug', $slug)->firstOrFail();

        return $this->guardar($request, $noticia);
    }

    public function comentarActividad(EnviarComentarioRequest $request, int $actividad): JsonResponse
    {
        $actividad = Actividad::publicadas()->activas()->findOrFail($actividad);

        return $this->guardar($request, $actividad);
    }

    /**
     * @param  Noticia|Actividad  $contenido
     */
    private function guardar(EnviarComentarioRequest $request, Model $contenido): JsonResponse
    {
        $datos = $request->validated();

        $comentario = $contenido->comentarios()->make([
            'nombre' => $datos['nombre'],
            'correo' => $datos['correo'],
            'web' => $datos['web'] ?? null,
            'contenido_texto' => $datos['comentario'],
        ]);
        $comentario->ip = $request->ip();
        $comentario->save();

        return response()->json([
            'success' => true,
            'message' => 'Gracias por tu comentario. Lo publicaremos en cuanto lo revisemos.',
        ], 201);
    }
}
