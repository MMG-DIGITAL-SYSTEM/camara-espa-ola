import { ChevronDown, ChevronUp, Copy, EyeOff, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { RenderizarSeccion } from '@/blocks/BlockRenderer';
import { ContextoLienzo } from '@/blocks/componentes/lienzo';
import type { AccionesLienzo } from '@/blocks/componentes/lienzo';
import { ContextoEditor } from '@/components/public/reveal';
import { cn } from '@/lib/utils';
import { elementosDe, etiquetaDe } from '@/pages/Admin/Paginas/estado';
import type { SeccionEditor } from '@/pages/Admin/Paginas/estado';
import { ContenidoDelModulo, esMarcadorDeListado } from './contenido-del-modulo';

export type Dispositivo = 'escritorio' | 'tablet' | 'movil';

const ANCHOS: Record<Dispositivo, number | null> = {
    escritorio: null,
    tablet: 834,
    movil: 400,
};

/** Acciones sobre las piezas, ya resueltas para una sección concreta. */
export type AccionesDeElementos = {
    seleccion: string | null;
    onSeleccionar: (seccion: string, clave: string) => void;
    onMover: (seccion: string, desde: number, hasta: number) => void;
    onDuplicar: (seccion: string, clave: string) => void;
    onEliminar: (seccion: string, clave: string) => void;
};

function BarraDeSeccion({
    seccion,
    primera,
    ultima,
    onSubir,
    onBajar,
    onDuplicar,
    onOcultar,
    onEliminar,
}: {
    seccion: SeccionEditor;
    primera: boolean;
    ultima: boolean;
    onSubir: () => void;
    onBajar: () => void;
    onDuplicar: () => void;
    onOcultar: () => void;
    onEliminar: () => void;
}) {
    const acciones = [
        {
            icono: ChevronUp,
            etiqueta: 'Subir',
            accion: onSubir,
            inactivo: primera,
        },
        {
            icono: ChevronDown,
            etiqueta: 'Bajar',
            accion: onBajar,
            inactivo: ultima,
        },
        {
            icono: Copy,
            etiqueta: 'Duplicar',
            accion: onDuplicar,
            inactivo: false,
        },
        {
            icono: EyeOff,
            etiqueta: 'Ocultar',
            accion: onOcultar,
            inactivo: false,
        },
        {
            icono: Trash2,
            etiqueta: 'Eliminar',
            accion: onEliminar,
            inactivo: false,
        },
    ];

    return (
        <div className="degradado-marca absolute top-0 right-0 left-0 z-20 flex items-center justify-between gap-2 px-2 py-1 text-white shadow-md">
            <span className="truncate pl-1 text-xs font-medium">
                {etiquetaDe(seccion)}
            </span>
            <div className="flex shrink-0 items-center gap-0.5">
                {acciones.map(
                    ({ icono: Icono, etiqueta, accion, inactivo }) => (
                        <button
                            key={etiqueta}
                            type="button"
                            title={etiqueta}
                            aria-label={`${etiqueta} sección`}
                            disabled={inactivo}
                            onClick={(evento) => {
                                evento.stopPropagation();
                                accion();
                            }}
                            className="flex size-6 items-center justify-center rounded transition-colors hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-transparent"
                        >
                            <Icono className="size-3.5" />
                        </button>
                    ),
                )}
            </div>
        </div>
    );
}

/**
 * Una sección dentro del lienzo de edición.
 *
 * Va en su propio componente para poder memorizar las acciones que se pasan
 * por contexto a las piezas: si el objeto cambiara en cada render, cambiaría
 * también para todos los elementos de la sección.
 */
function SeccionEnVistaPrevia({
    seccion,
    indice,
    activa,
    datos,
    elementos,
    urlModulo,
    children,
}: {
    seccion: SeccionEditor;
    indice: number;
    activa: boolean;
    datos: Record<string, unknown>;
    elementos: AccionesDeElementos;
    urlModulo: string | null;
    children?: React.ReactNode;
}) {
    const piezas = elementosDe(seccion);
    const { clave } = seccion;

    const acciones = useMemo<AccionesLienzo>(
        () => ({
            seleccion: activa ? elementos.seleccion : null,
            onSeleccionar: (claveElemento) =>
                elementos.onSeleccionar(clave, claveElemento),
            onMover: (claveElemento, salto) => {
                const desde = piezas.findIndex(
                    (pieza) => pieza.clave === claveElemento,
                );

                elementos.onMover(clave, desde, desde + salto);
            },
            onDuplicar: (claveElemento) =>
                elementos.onDuplicar(clave, claveElemento),
            onEliminar: (claveElemento) =>
                elementos.onEliminar(clave, claveElemento),
        }),
        [activa, clave, elementos, piezas],
    );

    return (
        <div
            className={cn(
                'relative cursor-pointer outline-offset-[-2px] transition-[outline-color]',
                activa
                    ? 'outline outline-2 outline-marca'
                    : 'outline outline-2 outline-transparent hover:outline-marca/30',
                !seccion.es_visible && 'opacity-45',
            )}
        >
            {children}

            {/* Los enlaces internos no deben navegar mientras se edita. */}
            <div className="pointer-events-none">
                {urlModulo && esMarcadorDeListado(seccion) ? (
                    <ContenidoDelModulo url={urlModulo} />
                ) : (
                    <ContextoLienzo.Provider value={acciones}>
                        <RenderizarSeccion
                            seccion={{ ...seccion, id: indice, orden: indice }}
                            contenido={datos[seccion.bloque]}
                        />
                    </ContextoLienzo.Provider>
                )}
            </div>
        </div>
    );
}

/**
 * Vista previa con los componentes reales del sitio público.
 *
 * No se usa un iframe: comunicar selección y estado a través de él añadiría
 * una capa de mensajes por cada clic. A cambio, el contenido se aísla en su
 * propio contenedor para que el CSS del panel no se cuele.
 */
export function VistaPrevia({
    secciones,
    seleccion,
    seleccionElemento,
    dispositivo,
    datos,
    onSeleccionar,
    onSubir,
    onBajar,
    onDuplicar,
    onOcultar,
    onEliminar,
    onSeleccionarElemento,
    onMoverElemento,
    onDuplicarElemento,
    onEliminarElemento,
    urlModulo = null,
}: {
    /** Dirección pública si la página es de un módulo, para su contenido. */
    urlModulo?: string | null;
    secciones: SeccionEditor[];
    seleccion: string | null;
    seleccionElemento: string | null;
    dispositivo: Dispositivo;
    datos: Record<string, unknown>;
    onSeleccionar: (clave: string) => void;
    onSubir: (clave: string) => void;
    onBajar: (clave: string) => void;
    onDuplicar: (clave: string) => void;
    onOcultar: (clave: string) => void;
    onEliminar: (clave: string) => void;
    onSeleccionarElemento: (seccion: string, clave: string) => void;
    onMoverElemento: (seccion: string, desde: number, hasta: number) => void;
    onDuplicarElemento: (seccion: string, clave: string) => void;
    onEliminarElemento: (seccion: string, clave: string) => void;
}) {
    const ancho = ANCHOS[dispositivo];

    const elementos = useMemo<AccionesDeElementos>(
        () => ({
            seleccion: seleccionElemento,
            onSeleccionar: onSeleccionarElemento,
            onMover: onMoverElemento,
            onDuplicar: onDuplicarElemento,
            onEliminar: onEliminarElemento,
        }),
        [
            seleccionElemento,
            onSeleccionarElemento,
            onMoverElemento,
            onDuplicarElemento,
            onEliminarElemento,
        ],
    );

    return (
        <div className="lienzo-editor flex h-full justify-center overflow-y-auto p-4 md:p-6">
            <div
                className="h-fit w-full overflow-hidden rounded-xl bg-white shadow-2xl ring-1 shadow-black/20 ring-black/5 transition-[max-width] duration-300"
                style={ancho ? { maxWidth: `${ancho}px` } : undefined}
            >
                {secciones.length === 0 ? (
                    <p className="px-6 py-24 text-center text-sm text-gray-500">
                        Añade una sección para empezar a construir la página.
                    </p>
                ) : (
                    /* Las animaciones de entrada se desactivan aquí dentro. */
                    <ContextoEditor.Provider value={true}>
                        {secciones.map((seccion, indice) => {
                            const activa = seleccion === seccion.clave;

                            return (
                                <div
                                    key={seccion.clave}
                                    onClick={() => onSeleccionar(seccion.clave)}
                                >
                                    <SeccionEnVistaPrevia
                                        seccion={seccion}
                                        indice={indice}
                                        activa={activa}
                                        datos={datos}
                                        elementos={elementos}
                                        urlModulo={urlModulo}
                                    >
                                        {activa && !seleccionElemento && (
                                            <BarraDeSeccion
                                                seccion={seccion}
                                                primera={indice === 0}
                                                ultima={
                                                    indice ===
                                                    secciones.length - 1
                                                }
                                                onSubir={() =>
                                                    onSubir(seccion.clave)
                                                }
                                                onBajar={() =>
                                                    onBajar(seccion.clave)
                                                }
                                                onDuplicar={() =>
                                                    onDuplicar(seccion.clave)
                                                }
                                                onOcultar={() =>
                                                    onOcultar(seccion.clave)
                                                }
                                                onEliminar={() =>
                                                    onEliminar(seccion.clave)
                                                }
                                            />
                                        )}
                                    </SeccionEnVistaPrevia>
                                </div>
                            );
                        })}
                    </ContextoEditor.Provider>
                )}
            </div>
        </div>
    );
}
