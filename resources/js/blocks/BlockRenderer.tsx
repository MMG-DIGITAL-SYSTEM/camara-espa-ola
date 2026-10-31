import { bloque } from './registro';
import type { Seccion } from './tipos';

/**
 * Datos resueltos en el servidor para los bloques dinámicos, indexados por
 * id de sección.
 */
export type DatosDeSecciones = Record<string, unknown>;

/**
 * Pinta una sección buscando su bloque en el registro.
 *
 * Si la clave no existe (un bloque retirado del código pero aún presente en
 * una página publicada), no se rompe la página: se omite en producción y se
 * avisa en desarrollo.
 */
export function RenderizarSeccion({
    seccion,
    contenido,
}: {
    seccion: Seccion;
    contenido?: unknown;
}) {
    const definicion = bloque(seccion.bloque);

    if (!definicion) {
        if (import.meta.env.DEV) {
            return (
                <div className="border-y border-amber-200 bg-amber-50 px-4 py-6 text-center text-sm text-amber-800">
                    Bloque desconocido: <code>{seccion.bloque}</code>
                </div>
            );
        }

        return null;
    }

    const Componente = definicion.componente;

    return (
        <Componente
            datos={seccion.datos}
            estilos={seccion.estilos}
            contenido={contenido}
        />
    );
}

/**
 * Pinta una página entera a partir de sus secciones.
 */
export function RenderizarSecciones({
    secciones,
    datos = {},
}: {
    secciones: Seccion[];
    datos?: DatosDeSecciones;
}) {
    return (
        <>
            {secciones.map((seccion) => (
                <RenderizarSeccion
                    key={seccion.id}
                    seccion={seccion}
                    contenido={datos[String(seccion.id)]}
                />
            ))}
        </>
    );
}
