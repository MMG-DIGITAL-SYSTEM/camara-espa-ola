<?php

namespace App\Bloques\Datos;

use App\Bloques\ProveeDatos;
use App\Models\Actividad;
use App\Support\Archivo;
use App\Support\HtmlSeguro;

class UltimasActividades implements ProveeDatos
{
    /**
     * Mismas reglas que el listado público de Actividades: solo lo publicado
     * y con visibilidad pública. Sin ellas, un borrador o una actividad
     * privada acabarían en la portada.
     *
     * @param  array<string, mixed>  $config
     * @return array<int, array<string, mixed>>
     */
    public function datos(array $config): array
    {
        $limite = (int) ($config['limite'] ?? 3);
        $soloProximas = (bool) ($config['solo_proximas'] ?? true);

        return Actividad::query()
            ->with('categorias:id,nombre')
            ->publicadas()
            ->activas()
            ->when(
                $soloProximas,
                fn ($consulta) => $consulta
                    ->whereNotNull('fecha_evento')
                    ->where('fecha_evento', '>=', now())
                    ->orderBy('fecha_evento'),
                fn ($consulta) => $consulta->ordenadas(),
            )
            ->limit(max($limite, 1))
            ->get()
            ->map(fn (Actividad $actividad) => [
                'id' => $actividad->id,
                'titulo' => $actividad->titulo,
                'imagen' => Archivo::url($actividad->imagen),
                // En la agenda importa cuándo se celebra; en «últimas», cuándo se publicó.
                'fecha' => ($soloProximas ? $actividad->fecha_evento : $actividad->fecha_publicacion)
                    ?->locale('es')->isoFormat('D [de] MMMM [de] YYYY'),
                'categorias' => $actividad->categorias->pluck('nombre')->all(),
                'extracto' => $this->extracto($actividad->descripcion),
                'url' => url('/actividades/'.$actividad->id),
            ])
            ->all();
    }

    /**
     * La descripción sale del editor enriquecido: se pasa a texto plano.
     */
    private function extracto(?string $descripcion): ?string
    {
        $texto = HtmlSeguro::textoPlano($descripcion, 160);

        return $texto === '' ? null : $texto;
    }
}
