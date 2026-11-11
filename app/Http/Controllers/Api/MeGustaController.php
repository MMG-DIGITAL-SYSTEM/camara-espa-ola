<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Actividad;
use App\Models\Noticia;
use App\Support\Visitante;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * «Me gusta» de los visitantes a noticias y actividades publicadas.
 *
 * POST lo marca y DELETE lo quita: repetir la misma petición no cambia nada,
 * así que un doble clic no cuenta dos veces. Cada navegador cuenta una vez.
 */
class MeGustaController extends Controller
{
    public function marcarNoticia(Request $request, string $slug): JsonResponse
    {
        return $this->marcar($request, $this->noticia($slug));
    }

    public function quitarNoticia(Request $request, string $slug): JsonResponse
    {
        return $this->quitar($request, $this->noticia($slug));
    }

    public function marcarActividad(Request $request, int $actividad): JsonResponse
    {
        return $this->marcar($request, $this->actividad($actividad));
    }

    public function quitarActividad(Request $request, int $actividad): JsonResponse
    {
        return $this->quitar($request, $this->actividad($actividad));
    }

    private function noticia(string $slug): Noticia
    {
        return Noticia::activas()->where('slug', $slug)->firstOrFail();
    }

    private function actividad(int $id): Actividad
    {
        return Actividad::publicadas()->activas()->findOrFail($id);
    }

    /**
     * @param  Noticia|Actividad  $contenido
     */
    private function marcar(Request $request, Model $contenido): JsonResponse
    {
        [$huella, $cookie] = Visitante::identificar($request);

        // createOrFirst se apoya en el índice único: dos clics simultáneos
        // no crean dos filas.
        $contenido->meGusta()->createOrFirst(['visitante' => $huella]);

        $respuesta = $this->estado($contenido, true);

        return $cookie ? $respuesta->withCookie($cookie) : $respuesta;
    }

    /**
     * @param  Noticia|Actividad  $contenido
     */
    private function quitar(Request $request, Model $contenido): JsonResponse
    {
        $huella = Visitante::huella($request);

        if ($huella !== null) {
            $contenido->meGusta()->where('visitante', $huella)->delete();
        }

        return $this->estado($contenido, false);
    }

    /**
     * @param  Noticia|Actividad  $contenido
     */
    private function estado(Model $contenido, bool $leGusta): JsonResponse
    {
        return response()->json([
            'le_gusta' => $leGusta,
            'total' => $contenido->meGusta()->count(),
        ]);
    }
}
