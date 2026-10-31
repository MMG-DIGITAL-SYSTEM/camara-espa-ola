import { ChevronDown, ChevronUp, Copy, Trash2 } from 'lucide-react';
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { elemento as definicionDeElemento } from '../elementos';
import { EnvoltorioSeccion } from '../seccion';
import type {
    AnchoElemento,
    ElementoLienzo,
    EstilosSeccion,
    PropsBloque,
} from '../tipos';

/**
 * Bloque contenedor: una franja vacía donde el editor coloca los elementos
 * que quiera, en la rejilla que quiera.
 *
 * Es lo que separa este constructor de un catálogo de plantillas cerrado. El
 * resto de bloques siguen existiendo porque resuelven de un clic composiciones
 * habituales; el lienzo está para todo lo demás.
 */

/**
 * Acciones que el editor inyecta para poder seleccionar cada pieza dentro del
 * bloque. En el sitio público vale `null` y no se pinta ningún adorno.
 */
export type AccionesLienzo = {
    seleccion: string | null;
    onSeleccionar: (clave: string) => void;
    onMover: (clave: string, salto: number) => void;
    onDuplicar: (clave: string) => void;
    onEliminar: (clave: string) => void;
};

export const ContextoLienzo = createContext<AccionesLienzo | null>(null);

const COLUMNAS: Record<AnchoElemento, string> = {
    completo: 'md:col-span-12',
    'dos-tercios': 'md:col-span-8',
    mitad: 'md:col-span-6',
    tercio: 'md:col-span-4',
    cuarto: 'md:col-span-3',
};

const SEPARACIONES: Record<string, string> = {
    compacta: 'gap-3',
    normal: 'gap-6',
    amplia: 'gap-10',
};

/**
 * Barra flotante del elemento seleccionado.
 */
function BarraDeElemento({
    primero,
    ultimo,
    nombre,
    onMover,
    onDuplicar,
    onEliminar,
}: {
    primero: boolean;
    ultimo: boolean;
    nombre: string;
    onMover: (salto: number) => void;
    onDuplicar: () => void;
    onEliminar: () => void;
}) {
    const acciones = [
        {
            icono: ChevronUp,
            etiqueta: 'Subir',
            accion: () => onMover(-1),
            inactivo: primero,
        },
        {
            icono: ChevronDown,
            etiqueta: 'Bajar',
            accion: () => onMover(1),
            inactivo: ultimo,
        },
        {
            icono: Copy,
            etiqueta: 'Duplicar',
            accion: onDuplicar,
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
        <div className="absolute -top-3 right-2 z-30 flex items-center gap-0.5 rounded-md bg-gray-900 px-1 py-0.5 text-white shadow-lg">
            <span className="max-w-24 truncate px-1.5 text-[11px] font-medium">
                {nombre}
            </span>
            {acciones.map(({ icono: Icono, etiqueta, accion, inactivo }) => (
                <button
                    key={etiqueta}
                    type="button"
                    title={etiqueta}
                    aria-label={`${etiqueta} elemento`}
                    disabled={inactivo}
                    onClick={(evento) => {
                        evento.stopPropagation();
                        accion();
                    }}
                    className="flex size-5 items-center justify-center rounded transition-colors hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-transparent"
                >
                    <Icono className="size-3" />
                </button>
            ))}
        </div>
    );
}

/**
 * Envuelve una pieza para hacerla seleccionable dentro del editor.
 *
 * La vista previa deja todo el contenido sin eventos de puntero para que los
 * enlaces no naveguen mientras se edita; aquí se reactivan solo en el marco, y
 * el contenido de dentro vuelve a quedar inerte. Así el clic siempre cae en el
 * marco, nunca en el enlace que haya debajo.
 */
function MarcoElemento({
    pieza,
    primero,
    ultimo,
    children,
}: {
    pieza: ElementoLienzo;
    primero: boolean;
    ultimo: boolean;
    children: ReactNode;
}) {
    const acciones = useContext(ContextoLienzo);

    if (!acciones) {
        return <>{children}</>;
    }

    const activo = acciones.seleccion === pieza.clave;
    const nombre =
        definicionDeElemento(pieza.elemento)?.nombre ?? pieza.elemento;

    return (
        <div
            onClick={(evento) => {
                evento.stopPropagation();
                acciones.onSeleccionar(pieza.clave);
            }}
            className={cn(
                'pointer-events-auto relative cursor-pointer rounded-sm outline-offset-2 transition-[outline-color]',
                activo
                    ? 'outline outline-2 outline-marca'
                    : 'outline outline-2 outline-transparent hover:outline-marca/40',
            )}
        >
            {activo && (
                <BarraDeElemento
                    primero={primero}
                    ultimo={ultimo}
                    nombre={nombre}
                    onMover={(salto) => acciones.onMover(pieza.clave, salto)}
                    onDuplicar={() => acciones.onDuplicar(pieza.clave)}
                    onEliminar={() => acciones.onEliminar(pieza.clave)}
                />
            )}

            <div className="pointer-events-none">{children}</div>
        </div>
    );
}

/**
 * Pinta una pieza buscándola en el catálogo de elementos.
 */
function PiezaDelLienzo({
    pieza,
    estilos,
}: {
    pieza: ElementoLienzo;
    estilos?: EstilosSeccion;
}) {
    const definicion = definicionDeElemento(pieza.elemento);

    if (!definicion) {
        if (import.meta.env.DEV) {
            return (
                <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    Elemento desconocido: <code>{pieza.elemento}</code>
                </p>
            );
        }

        return null;
    }

    const Componente = definicion.componente;

    return <Componente datos={pieza.datos} estilos={estilos} />;
}

type DatosLienzo = {
    elementos?: ElementoLienzo[];
    separacion?: string;
};

export function BloqueLienzo({ datos, estilos }: PropsBloque<DatosLienzo>) {
    const acciones = useContext(ContextoLienzo);
    const elementos = Array.isArray(datos.elementos) ? datos.elementos : [];

    if (elementos.length === 0) {
        // Fuera del editor, un lienzo vacío simplemente no ocupa sitio.
        if (!acciones) {
            return null;
        }

        return (
            <EnvoltorioSeccion estilos={estilos}>
                <p className="rounded-xl border border-dashed border-gray-300 px-6 py-12 text-center text-sm text-gray-500">
                    Lienzo vacío. Añade elementos desde el panel de la derecha.
                </p>
            </EnvoltorioSeccion>
        );
    }

    return (
        <EnvoltorioSeccion estilos={estilos}>
            <div
                className={cn(
                    'grid grid-cols-1 md:grid-cols-12',
                    SEPARACIONES[String(datos.separacion ?? 'normal')] ??
                        'gap-6',
                )}
            >
                {elementos.map((pieza, indice) => (
                    <div
                        key={pieza.clave}
                        className={COLUMNAS[pieza.ancho] ?? COLUMNAS.completo}
                    >
                        <MarcoElemento
                            pieza={pieza}
                            primero={indice === 0}
                            ultimo={indice === elementos.length - 1}
                        >
                            <PiezaDelLienzo pieza={pieza} estilos={estilos} />
                        </MarcoElemento>
                    </div>
                ))}
            </div>
        </EnvoltorioSeccion>
    );
}
