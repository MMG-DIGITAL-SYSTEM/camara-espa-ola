<?php

namespace App\Concerns;

use App\Enums\EstadoOferta;
use App\Enums\JornadaLaboral;
use App\Enums\ModalidadTrabajo;
use App\Models\OfertaEmpleo;

/**
 * Forma en que viajan las ofertas al front, compartida por el panel y el
 * portal de empresas para que ambos pinten la misma tabla y el mismo formulario.
 */
trait PresentaOfertasEmpleo
{
    /**
     * @return array<string, mixed>
     */
    protected function filaDeOferta(OfertaEmpleo $oferta): array
    {
        return [
            'id' => $oferta->id,
            'titulo' => $oferta->titulo,
            'empresa' => $oferta->socio?->nombre,
            'ubicacion' => $oferta->ubicacion,
            'modalidad' => $oferta->modalidad->etiqueta(),
            'jornada' => $oferta->jornada->etiqueta(),
            'estado' => $oferta->estado->value,
            'estado_etiqueta' => $oferta->estado->etiqueta(),
            'vencida' => $oferta->estado === EstadoOferta::Publicada && $oferta->estaVencida(),
            'fecha_cierre' => $oferta->fecha_cierre?->locale('es')->isoFormat('D MMM YYYY'),
            'actualizada' => $oferta->updated_at?->locale('es')->diffForHumans(),
            'url' => $oferta->estaVisible() ? route('bolsa-trabajo.show', $oferta) : null,
        ];
    }

    /**
     * Datos completos para el formulario de edición.
     *
     * @return array<string, mixed>
     */
    protected function formularioDeOferta(OfertaEmpleo $oferta): array
    {
        return [
            'id' => $oferta->id,
            'socio_id' => $oferta->socio_id,
            'titulo' => $oferta->titulo,
            'descripcion' => $oferta->descripcion,
            'area' => $oferta->area,
            'ubicacion' => $oferta->ubicacion,
            'modalidad' => $oferta->modalidad->value,
            'jornada' => $oferta->jornada->value,
            'salario' => $oferta->salario,
            'vacantes' => $oferta->vacantes,
            'correo_postulacion' => $oferta->correo_postulacion,
            'enlace_postulacion' => $oferta->enlace_postulacion,
            'fecha_cierre' => $oferta->fecha_cierre?->format('Y-m-d'),
            'estado' => $oferta->estado->value,
        ];
    }

    /**
     * @return array<string, array<int, array{valor: string, etiqueta: string}>>
     */
    protected function opcionesDeOferta(): array
    {
        return [
            'estados' => EstadoOferta::opciones(),
            'modalidades' => ModalidadTrabajo::opciones(),
            'jornadas' => JornadaLaboral::opciones(),
        ];
    }
}
