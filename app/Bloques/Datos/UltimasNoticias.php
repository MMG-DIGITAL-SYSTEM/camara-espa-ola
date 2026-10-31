<?php

namespace App\Bloques\Datos;

use App\Bloques\ProveeDatos;
use App\Models\Noticia;
use App\Support\Archivo;

class UltimasNoticias implements ProveeDatos
{
    /**
     * @param  array<string, mixed>  $config
     * @return array<int, array<string, mixed>>
     */
    public function datos(array $config): array
    {
        $limite = (int) ($config['limite'] ?? 3);
        $soloDestacadas = (bool) ($config['solo_destacadas'] ?? false);

        return Noticia::activas()
            ->when($soloDestacadas, fn ($consulta) => $consulta->destacadas())
            ->ordenadas()
            ->limit(max($limite, 1))
            ->get()
            ->map(fn (Noticia $noticia) => [
                'id' => $noticia->id,
                'titulo' => $noticia->titulo,
                'slug' => $noticia->slug,
                'extracto' => $noticia->extracto,
                'imagen' => Archivo::url($noticia->imagen),
                'fecha' => $noticia->fecha_publicacion?->locale('es')->isoFormat('D [de] MMMM [de] YYYY'),
                'url' => $noticia->slug ? route('noticias.show', $noticia->slug) : route('noticias'),
            ])
            ->all();
    }
}
