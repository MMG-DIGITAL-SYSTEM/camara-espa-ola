<?php

// app/Http/Controllers/Api/CamaraController.php

namespace App\Http\Controllers\Api;

use App\Concerns\DecoraConBloques;
use App\Http\Controllers\Controller;
use App\Models\ContenidoInstitucional;
use App\Models\Directivo;
use App\Support\Archivo;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CamaraController extends Controller
{
    use DecoraConBloques;

    public function index(Request $request)
    {
        // Obtener todas las secciones activas ordenadas
        $secciones = ContenidoInstitucional::activos()
            ->ordenados()
            ->get()
            ->keyBy('seccion');

        // Obtener directivos activos ordenados
        $directivos = Directivo::activos()
            ->ordenados()
            ->get();

        // Estructurar datos para la vista
        $data = [
            'nuestra_organizacion' => $this->getSeccionData(
                $secciones,
                'nuestra_organizacion'
            ),

            'nosotros' => $this->getSeccionData(
                $secciones,
                'nosotros'
            ),

            'mision' => $this->getSeccionData(
                $secciones,
                'mision'
            ),

            'vision' => $this->getSeccionData(
                $secciones,
                'vision'
            ),

            'estatutos' => $this->getSeccionData(
                $secciones,
                'estatutos'
            ),

            'directorio' => $directivos->map(function ($directivo) {
                return [
                    'id' => $directivo->id,
                    'nombre' => $directivo->nombre,
                    'cargo' => $directivo->cargo,
                    'empresa' => $directivo->empresa,
                    'imagen' => $directivo->imagen
                        ? asset('storage/'.$directivo->imagen)
                        : null,
                ];
            }),
        ];

        return Inertia::render('Public/Camara', [
            'data' => $data,
            ...$this->bloquesDelModulo($request, 'la-camara'),
        ]);
    }

    private function getSeccionData($secciones, $key)
    {
        $seccion = $secciones->get($key);

        if (! $seccion) {
            return [
                'titulo' => '',
                'contenido' => '',
                'imagen' => null,
                'pdf_url' => null,
            ];
        }

        return [
            'id' => $seccion->id,
            'titulo' => $seccion->titulo,
            'contenido' => $seccion->contenido,

            // Vienen de la biblioteca de medios (URL completa) o del backup
            // (ruta del disco): Archivo::url resuelve las dos.
            'imagen' => Archivo::url($seccion->imagen),
            'pdf_url' => Archivo::url($seccion->pdf),

            'orden' => $seccion->orden,
        ];
    }
}
