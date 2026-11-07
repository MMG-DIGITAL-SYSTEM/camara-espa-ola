<?php

namespace App\Support;

use App\Models\Actividad;
use App\Models\CategoriaAfiliado;
use App\Models\ContenidoInstitucional;
use App\Models\Convenio;
use App\Models\Noticia;
use App\Models\Oficina;
use App\Models\Servicio;
use App\Models\Socio;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class AsistenteCamara
{
    /**
     * @return array{respuesta: string, enlaces: list<array{url: string, texto: string}>}
     */
    public function responder(string $mensaje): array
    {
        $consulta = Str::ascii(mb_strtolower(trim($mensaje)));
        $respuestas = [];
        $enlaces = [];

        if ($this->coincide($consulta, ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches'])) {
            $respuestas[] = '¡Hola! Puedo orientarte con información pública actual sobre afiliación, servicios, convenios, oficinas, actividades, noticias y empresas asociadas.';
        }

        $consultaAfiliacion = $this->coincide($consulta, ['afiliar', 'afiliacion', 'asociarme', 'ser socio', 'inscribirme', 'requisitos']);

        if ($consultaAfiliacion) {
            $respuestas[] = 'Para solicitar la afiliación se pide: nombre o razón social, representante legal, escritura de constitución, dirección y ciudad, teléfono, casilla, correo, página web, representante ante la Cámara y su cargo, y los servicios o productos de la empresa. La fecha de constitución, el NIT y el fax son opcionales. El sitio no publica un costo oficial de afiliación. La Cámara revisará la solicitud y se pondrá en contacto contigo; enviarla no significa que la afiliación ya esté aprobada.';
            $enlaces[] = $this->enlace('afiliacion.formulario', 'Solicitar afiliación');
        }

        if ($this->coincide($consulta, ['servicio', 'beneficio', 'apoyo', 'ayuda', 'reunion', 'reuniones', 'newsletter', 'base de datos', 'que ofrecen', 'que ofrece', 'que hacen'])) {
            $servicios = Servicio::query()
                ->activos()
                ->ordenados()
                ->limit(20)
                ->get(['titulo', 'contenido']);

            if ($servicios->isNotEmpty()) {
                $respuestas[] = "Estos son los servicios publicados para empresas asociadas:\n".$servicios
                    ->map(fn (Servicio $servicio): string => '• '.$servicio->titulo.': '.HtmlSeguro::textoPlano($servicio->contenido))
                    ->implode("\n");
            } else {
                $respuestas[] = 'No hay servicios publicados en este momento. Puedes consultar a la Cámara desde la página de contacto.';
            }

            $enlaces[] = $this->enlace('servicios', 'Ver servicios');
        }

        if ($this->coincide($consulta, ['convenio', 'descuento', 'promocion'])) {
            $convenios = Convenio::query()
                ->activos()
                ->ordenados()
                ->limit(20)
                ->get(['nombre', 'descripcion']);

            if ($convenios->isNotEmpty()) {
                $respuestas[] = "Convenios y promociones publicados:\n".$convenios
                    ->map(fn (Convenio $convenio): string => '• '.$convenio->nombre.': '.HtmlSeguro::textoPlano($convenio->descripcion))
                    ->implode("\n");
            } else {
                $respuestas[] = 'No hay convenios publicados en este momento.';
            }

            $enlaces[] = $this->enlace('convenios', 'Ver convenios');
        }

        if ($this->coincide($consulta, ['oficina', 'direccion', 'ubicacion', 'telefono', 'correo', 'contacto', 'donde estan', 'donde queda'])) {
            $oficinas = Oficina::query()
                ->activas()
                ->ordenadas()
                ->limit(20)
                ->get(['nombre', 'ciudad', 'direccion', 'referencia', 'edificio', 'piso', 'oficina', 'telefono', 'correo_electronico']);

            if ($oficinas->isNotEmpty()) {
                $respuestas[] = "Información de las oficinas:\n".$oficinas
                    ->map(function (Oficina $oficina): string {
                        $detalles = array_filter([
                            $oficina->direccion,
                            $oficina->referencia,
                            $oficina->edificio,
                            $oficina->piso ? 'Piso '.$oficina->piso : null,
                            $oficina->oficina ? 'Oficina '.$oficina->oficina : null,
                            $oficina->telefono ? 'Teléfono: '.$oficina->telefono : null,
                            $oficina->correo_electronico ? 'Correo: '.$oficina->correo_electronico : null,
                        ]);

                        return '• '.$oficina->nombre.' ('.$oficina->ciudad.'): '.implode('; ', $detalles);
                    })
                    ->implode("\n");
            } else {
                $respuestas[] = 'No hay datos de oficinas publicados en este momento.';
            }

            $enlaces[] = $this->enlace('contacto', 'Ir a contacto');
        }

        if ($this->coincide($consulta, ['actividad', 'evento', 'feria', 'agenda'])) {
            $actividades = Actividad::query()
                ->publicadas()
                ->activas()
                ->ordenadas()
                ->limit(5)
                ->get(['id', 'titulo', 'descripcion', 'fecha_evento', 'fecha_publicacion']);

            if ($actividades->isNotEmpty()) {
                $respuestas[] = "Actividades públicas recientes:\n".$actividades
                    ->map(fn (Actividad $actividad): string => '• '.$actividad->titulo
                        .$this->fecha($actividad->fecha_evento ?? $actividad->fecha_publicacion)
                        .': '.Str::limit(HtmlSeguro::textoPlano($actividad->descripcion), 300))
                    ->implode("\n");
            } else {
                $respuestas[] = 'No hay actividades públicas publicadas en este momento.';
            }

            $enlaces[] = $this->enlace('actividades', 'Ver actividades');
        }

        if ($this->coincide($consulta, ['noticia', 'novedad', 'publicacion'])) {
            $noticias = Noticia::query()
                ->activas()
                ->ordenadas()
                ->limit(5)
                ->get(['titulo', 'extracto', 'descripcion', 'fecha_publicacion']);

            if ($noticias->isNotEmpty()) {
                $respuestas[] = "Noticias públicas recientes:\n".$noticias
                    ->map(fn (Noticia $noticia): string => '• '.$noticia->titulo
                        .$this->fecha($noticia->fecha_publicacion)
                        .': '.Str::limit(HtmlSeguro::textoPlano($noticia->extracto ?: $noticia->descripcion), 300))
                    ->implode("\n");
            } else {
                $respuestas[] = 'No hay noticias públicas publicadas en este momento.';
            }

            $enlaces[] = $this->enlace('noticias', 'Ver noticias');
        }

        if (! $consultaAfiliacion && $this->coincide($consulta, ['socio', 'asociado', 'afiliad', 'empresa', 'directorio', 'rubro', 'sector', 'categoria'])) {
            $totalSocios = Socio::query()->activos()->count();
            $cantidadSocios = $totalSocios === 1 ? 'empresa asociada activa' : 'empresas asociadas activas';
            $respuestas[] = 'El directorio tiene '.$totalSocios.' '.$cantidadSocios.'.';

            $terminos = $this->terminosEspecificos($consulta);

            if ($terminos !== []) {
                $socios = Socio::query()
                    ->with('categoria')
                    ->activos()
                    ->where(function ($consultaSocios) use ($terminos): void {
                        foreach ($terminos as $termino) {
                            $coincidencia = '%'.$termino.'%';
                            $consultaSocios
                                ->orWhere('nombre', 'ilike', $coincidencia)
                                ->orWhere('descripcion', 'ilike', $coincidencia)
                                ->orWhereHas('categoria', fn ($consultaCategoria) => $consultaCategoria
                                    ->where('nombre', 'ilike', $coincidencia));
                        }
                    })
                    ->limit(5)
                    ->get(['id', 'nombre', 'descripcion', 'categoria_id']);

                if ($socios->isNotEmpty()) {
                    $respuestas[] = "Empresas asociadas que coinciden con la consulta:\n".$socios
                        ->map(fn (Socio $socio): string => '• '.$socio->nombre
                            .($socio->categoria ? ' ('.$socio->categoria->nombre.')' : '')
                            .($socio->descripcion ? ': '.Str::limit(HtmlSeguro::textoPlano($socio->descripcion), 220) : ''))
                        ->implode("\n");
                } else {
                    $respuestas[] = 'No encuentro una empresa que coincida en el directorio público. Esto no confirma que no esté afiliada; consulta a la Cámara para verificarlo.';
                }
            }

            if ($this->coincide($consulta, ['rubro', 'sector', 'categoria'])) {
                $categorias = CategoriaAfiliado::query()
                    ->withCount(['socios as total' => fn ($consultaSocios) => $consultaSocios->activos()])
                    ->orderBy('nombre')
                    ->get(['id', 'nombre'])
                    ->filter(fn (CategoriaAfiliado $categoria): bool => $categoria->total > 0);

                if ($categorias->isNotEmpty()) {
                    $respuestas[] = "Empresas por rubro:\n".$categorias
                        ->map(fn (CategoriaAfiliado $categoria): string => '• '.$categoria->nombre.': '.$categoria->total)
                        ->implode("\n");
                }
            }

            $enlaces[] = $this->enlace('socios', 'Ver empresas asociadas');
        }

        if ($this->coincide($consulta, ['camara', 'camacoes', 'quienes son', 'que es', 'mision', 'objetivo', 'inversion', 'comercio', 'relacion economica'])) {
            $contenidos = ContenidoInstitucional::query()
                ->activos()
                ->ordenados()
                ->limit(10)
                ->get(['titulo', 'contenido']);

            if ($contenidos->isNotEmpty()) {
                $respuestas[] = "Información institucional publicada:\n".$contenidos
                    ->map(fn (ContenidoInstitucional $contenido): string => '• '.$contenido->titulo.': '.Str::limit(HtmlSeguro::textoPlano($contenido->contenido), 500))
                    ->implode("\n");

                $totalSocios = Socio::query()->activos()->count();
                $cifraInstitucional = null;

                foreach ($contenidos as $contenido) {
                    if (preg_match('/(\d+)\s+empresas asociadas/u', Str::ascii(HtmlSeguro::textoPlano($contenido->contenido)), $coincidencias)) {
                        $cifraInstitucional = (int) $coincidencias[1];
                        break;
                    }
                }

                if ($cifraInstitucional !== null && $cifraInstitucional > $totalSocios) {
                    $respuestas[] = 'Nota: el contenido institucional también menciona más de '.$cifraInstitucional.' empresas asociadas, mientras que el directorio público actual muestra '.$totalSocios.' empresas asociadas activas. Son cifras con distinto alcance o el texto institucional podría estar desactualizado; confirma el dato con la Cámara.';
                    $enlaces[] = $this->enlace('socios', 'Consultar directorio');
                }
            } else {
                $respuestas[] = 'La Cámara Oficial Española en Bolivia conecta oportunidades de negocio y trabaja para fortalecer las relaciones económicas y empresariales entre España y Bolivia.';
            }

            $enlaces[] = $this->enlace('camara', 'Conocer la Cámara');
        }

        if ($this->coincide($consulta, ['trabajo', 'empleo', 'oferta laboral', 'vacante'])) {
            $respuestas[] = 'Las ofertas laborales publicadas por empresas asociadas se consultan en la bolsa de trabajo.';
            $enlaces[] = $this->enlace('bolsa-trabajo', 'Ver bolsa de trabajo');
        }

        if ($respuestas === []) {
            $respuestas[] = 'No encuentro información pública suficiente para responder esa consulta. Prueba preguntando por afiliación, servicios, oficinas, convenios, socios, actividades o noticias; también puedes contactar directamente a la Cámara.';
            $enlaces[] = $this->enlace('contacto', 'Ir a contacto');
        }

        return [
            'respuesta' => implode("\n\n", $respuestas),
            'enlaces' => collect($enlaces)->unique('url')->values()->all(),
        ];
    }

    /**
     * @param  list<string>  $palabras
     */
    private function coincide(string $mensaje, array $palabras): bool
    {
        foreach ($palabras as $palabra) {
            if (str_contains($mensaje, $palabra)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @return list<string>
     */
    private function terminosEspecificos(string $consulta): array
    {
        $excluir = [
            'afiliada', 'afiliadas', 'afiliado', 'afiliados', 'asociada', 'asociadas', 'asociado',
            'asociados', 'camara', 'cantidad', 'categoria', 'categorias', 'con', 'cuales',
            'cuantas', 'cuantos', 'del', 'directorio', 'empresa', 'empresas', 'esta', 'estan',
            'hay', 'informacion', 'las', 'los', 'numero', 'para', 'por', 'que', 'quiero',
            'rubro', 'saber', 'sector', 'socio', 'socios', 'tiene', 'tienen', 'una', 'uno',
        ];

        $terminos = preg_split('/[^\p{L}\p{N}]+/u', $consulta, -1, PREG_SPLIT_NO_EMPTY) ?: [];

        return array_values(array_unique(array_filter(
            $terminos,
            fn (string $termino): bool => mb_strlen($termino) >= 3 && ! in_array($termino, $excluir, true),
        )));
    }

    /**
     * @return array{url: string, texto: string}
     */
    private function enlace(string $ruta, string $texto): array
    {
        return ['url' => route($ruta, absolute: false), 'texto' => $texto];
    }

    private function fecha(mixed $fecha): string
    {
        return $fecha ? ' ('.Carbon::parse($fecha)->format('d/m/Y').')' : '';
    }
}
