import { usePage } from '@inertiajs/react';
import { RenderizarSecciones } from '@/blocks/BlockRenderer';
import type { DatosDeSecciones } from '@/blocks/BlockRenderer';
import type { Seccion } from '@/blocks/tipos';

type PropsDeModulo = {
    seccionesArriba?: Seccion[];
    seccionesAbajo?: Seccion[];
    datosBloques?: DatosDeSecciones;
    soloContenido?: boolean;
};

/**
 * Pinta las secciones editables de una página de módulo.
 *
 * Lee de las props de la página en lugar de recibirlas: así añadirlo a una
 * vista existente es una línea, sin enhebrar props por componentes de
 * cientos de líneas.
 *
 * `arriba` es lo que va antes del listado propio de la vista y `abajo` lo que
 * va después; el reparto lo decide el separador llamado «listado» dentro del
 * editor.
 */
export function SeccionesDelModulo({ lugar }: { lugar: 'arriba' | 'abajo' }) {
    const props = usePage().props as PropsDeModulo;

    const secciones =
        lugar === 'arriba' ? props.seccionesArriba : props.seccionesAbajo;

    // Dentro del editor estas secciones ya las pinta él, con lo que se edita.
    if (props.soloContenido || !secciones?.length) {
        return null;
    }

    return (
        <RenderizarSecciones
            secciones={secciones}
            datos={props.datosBloques ?? {}}
        />
    );
}
