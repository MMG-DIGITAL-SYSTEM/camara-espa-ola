import {
    DndContext,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    ChevronDown,
    ChevronRight,
    Eye,
    EyeOff,
    GripVertical,
    Plus,
} from 'lucide-react';
import { useState } from 'react';
import { elemento as definicionDeElemento } from '@/blocks/elementos';
import { bloque } from '@/blocks/registro';
import type { ElementoLienzo } from '@/blocks/tipos';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    elementosDe,
    etiquetaDe,
    etiquetaDeElemento,
} from '@/pages/Admin/Paginas/estado';
import type { SeccionEditor } from '@/pages/Admin/Paginas/estado';
import { FILA_ACTIVA, TONO_CATEGORIA } from './tonos';

/**
 * Fila de una pieza del lienzo, anidada bajo su sección.
 */
function FilaElemento({
    pieza,
    activa,
    onSeleccionar,
}: {
    pieza: ElementoLienzo;
    activa: boolean;
    onSeleccionar: () => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: pieza.clave });

    const Icono = definicionDeElemento(pieza.elemento)?.icono;

    return (
        <li
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            className={cn(
                'flex items-center gap-1 rounded-md border px-1.5 py-1 transition-colors',
                activa ? FILA_ACTIVA : 'border-transparent hover:bg-muted',
                isDragging && 'z-10 opacity-80 shadow-md',
            )}
        >
            <button
                type="button"
                {...attributes}
                {...listeners}
                aria-label={`Reordenar ${etiquetaDeElemento(pieza)}`}
                className="flex size-5 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground/50 hover:text-foreground active:cursor-grabbing"
            >
                <GripVertical className="size-3" />
            </button>

            <button
                type="button"
                onClick={onSeleccionar}
                className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
            >
                {Icono && (
                    <Icono
                        className={cn(
                            'size-3 shrink-0',
                            activa ? 'text-marca' : 'text-muted-foreground/70',
                        )}
                    />
                )}
                <span
                    className={cn(
                        'truncate text-xs',
                        activa
                            ? 'font-medium text-marca'
                            : 'text-muted-foreground',
                    )}
                >
                    {etiquetaDeElemento(pieza)}
                </span>
            </button>
        </li>
    );
}

function Fila({
    seccion,
    activa,
    elementos,
    desplegada,
    seleccionElemento,
    onDesplegar,
    onSeleccionar,
    onAlternarVisible,
    onSeleccionarElemento,
    onAnadirElemento,
}: {
    seccion: SeccionEditor;
    activa: boolean;
    elementos: ElementoLienzo[];
    desplegada: boolean;
    seleccionElemento: string | null;
    onDesplegar: () => void;
    onSeleccionar: () => void;
    onAlternarVisible: () => void;
    onSeleccionarElemento: (clave: string) => void;
    onAnadirElemento: () => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: seccion.clave });

    const definicion = bloque(seccion.bloque);
    const Icono = definicion?.icono;
    const contenedora = definicion?.admiteElementos === true;

    return (
        <li
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            className={cn(isDragging && 'z-10 opacity-80')}
        >
            <div
                className={cn(
                    'group flex items-center gap-1 rounded-md border px-1.5 py-1.5 transition-colors',
                    activa && !seleccionElemento
                        ? FILA_ACTIVA
                        : 'border-transparent hover:bg-muted',
                    isDragging && 'shadow-md',
                    !seccion.es_visible && 'opacity-55',
                )}
            >
                <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    aria-label={`Reordenar ${etiquetaDe(seccion)}`}
                    className="flex size-6 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground/60 hover:text-foreground active:cursor-grabbing"
                >
                    <GripVertical className="size-3.5" />
                </button>

                {contenedora ? (
                    <button
                        type="button"
                        onClick={onDesplegar}
                        aria-expanded={desplegada}
                        aria-label={
                            desplegada
                                ? `Plegar ${etiquetaDe(seccion)}`
                                : `Desplegar ${etiquetaDe(seccion)}`
                        }
                        className="flex size-4 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground"
                    >
                        {desplegada ? (
                            <ChevronDown className="size-3.5" />
                        ) : (
                            <ChevronRight className="size-3.5" />
                        )}
                    </button>
                ) : (
                    <span className="size-4 shrink-0" />
                )}

                <button
                    type="button"
                    onClick={onSeleccionar}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                    {Icono && definicion && (
                        <span
                            className={cn(
                                'flex size-6 shrink-0 items-center justify-center rounded-md',
                                activa
                                    ? 'degradado-marca text-white shadow-sm'
                                    : TONO_CATEGORIA[definicion.categoria],
                            )}
                        >
                            <Icono className="size-3.5" />
                        </span>
                    )}
                    <span
                        className={cn(
                            'truncate text-sm',
                            activa && 'font-medium text-marca',
                        )}
                    >
                        {etiquetaDe(seccion)}
                    </span>
                    {contenedora && elementos.length > 0 && (
                        <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                            {elementos.length}
                        </span>
                    )}
                </button>

                <button
                    type="button"
                    onClick={onAlternarVisible}
                    title={
                        seccion.es_visible
                            ? 'Ocultar en el sitio'
                            : 'Mostrar en el sitio'
                    }
                    aria-label={
                        seccion.es_visible
                            ? `Ocultar ${etiquetaDe(seccion)}`
                            : `Mostrar ${etiquetaDe(seccion)}`
                    }
                    className="flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground/60 opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground focus-visible:opacity-100"
                >
                    {seccion.es_visible ? (
                        <Eye className="size-3.5" />
                    ) : (
                        <EyeOff className="size-3.5" />
                    )}
                </button>
            </div>

            {contenedora && desplegada && (
                <div className="mt-0.5 ml-4 border-l pl-2">
                    <SortableContext
                        items={elementos.map((e) => e.clave)}
                        strategy={verticalListSortingStrategy}
                    >
                        <ul className="space-y-0.5">
                            {elementos.map((pieza) => (
                                <FilaElemento
                                    key={pieza.clave}
                                    pieza={pieza}
                                    activa={seleccionElemento === pieza.clave}
                                    onSeleccionar={() =>
                                        onSeleccionarElemento(pieza.clave)
                                    }
                                />
                            ))}
                        </ul>
                    </SortableContext>

                    <button
                        type="button"
                        onClick={onAnadirElemento}
                        className="mt-0.5 flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                        <Plus className="size-3" />
                        Elemento
                    </button>
                </div>
            )}
        </li>
    );
}

export function ArbolSecciones({
    secciones,
    seleccion,
    seleccionElemento,
    onSeleccionar,
    onMover,
    onAlternarVisible,
    onAnadir,
    onSeleccionarElemento,
    onMoverElemento,
    onAnadirElemento,
}: {
    secciones: SeccionEditor[];
    seleccion: string | null;
    seleccionElemento: string | null;
    onSeleccionar: (clave: string) => void;
    onMover: (desde: number, hasta: number) => void;
    onAlternarVisible: (clave: string) => void;
    onAnadir: () => void;
    onSeleccionarElemento: (seccion: string, clave: string) => void;
    onMoverElemento: (seccion: string, desde: number, hasta: number) => void;
    onAnadirElemento: (seccion: string) => void;
}) {
    const [plegadas, setPlegadas] = useState<string[]>([]);

    const sensores = useSensors(
        // El umbral evita que un clic para seleccionar se lea como arrastre.
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    /**
     * Un solo DndContext para el árbol entero, con una lista ordenable por
     * sección contenedora. Anidar contextos haría que el mismo gesto lo
     * atendieran los dos a la vez.
     */
    const alSoltar = (evento: DragEndEvent) => {
        const { active, over } = evento;

        if (!over || active.id === over.id) {
            return;
        }

        const indiceSeccion = secciones.findIndex((s) => s.clave === active.id);

        if (indiceSeccion !== -1) {
            onMover(
                indiceSeccion,
                secciones.findIndex((s) => s.clave === over.id),
            );

            return;
        }

        // Si no es una sección, es una pieza: se busca a qué lienzo pertenece.
        const contenedora = secciones.find((s) =>
            elementosDe(s).some((e) => e.clave === active.id),
        );

        if (!contenedora) {
            return;
        }

        const elementos = elementosDe(contenedora);
        const destino = elementos.findIndex((e) => e.clave === over.id);

        // Soltar sobre otra sección no mueve la pieza entre lienzos: sería un
        // gesto ambiguo con las secciones ocupando la misma columna.
        if (destino === -1) {
            return;
        }

        onMoverElemento(
            contenedora.clave,
            elementos.findIndex((e) => e.clave === active.id),
            destino,
        );
    };

    return (
        <div className="flex h-full flex-col">
            <header className="flex items-center justify-between border-b px-4 py-3">
                <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Secciones
                </h2>
                <span className="rounded-full bg-marca/12 px-2 py-0.5 text-xs font-semibold text-marca tabular-nums">
                    {secciones.length}
                </span>
            </header>

            <div className="flex-1 overflow-y-auto p-2">
                {secciones.length === 0 ? (
                    <p className="px-2 py-8 text-center text-sm text-muted-foreground">
                        Esta página todavía está vacía. Añade la primera
                        sección.
                    </p>
                ) : (
                    <DndContext
                        sensors={sensores}
                        collisionDetection={closestCenter}
                        onDragEnd={alSoltar}
                    >
                        <SortableContext
                            items={secciones.map((s) => s.clave)}
                            strategy={verticalListSortingStrategy}
                        >
                            <ul className="space-y-0.5">
                                {secciones.map((seccion) => (
                                    <Fila
                                        key={seccion.clave}
                                        seccion={seccion}
                                        activa={seleccion === seccion.clave}
                                        elementos={elementosDe(seccion)}
                                        desplegada={
                                            !plegadas.includes(seccion.clave)
                                        }
                                        seleccionElemento={
                                            seleccion === seccion.clave
                                                ? seleccionElemento
                                                : null
                                        }
                                        onDesplegar={() =>
                                            setPlegadas((actuales) =>
                                                actuales.includes(seccion.clave)
                                                    ? actuales.filter(
                                                          (c) =>
                                                              c !==
                                                              seccion.clave,
                                                      )
                                                    : [
                                                          ...actuales,
                                                          seccion.clave,
                                                      ],
                                            )
                                        }
                                        onSeleccionar={() =>
                                            onSeleccionar(seccion.clave)
                                        }
                                        onAlternarVisible={() =>
                                            onAlternarVisible(seccion.clave)
                                        }
                                        onSeleccionarElemento={(clave) =>
                                            onSeleccionarElemento(
                                                seccion.clave,
                                                clave,
                                            )
                                        }
                                        onAnadirElemento={() =>
                                            onAnadirElemento(seccion.clave)
                                        }
                                    />
                                ))}
                            </ul>
                        </SortableContext>
                    </DndContext>
                )}
            </div>

            <footer className="border-t p-2">
                <Button
                    onClick={onAnadir}
                    className="degradado-marca w-full text-white shadow-md shadow-marca/25 transition-all hover:-translate-y-px hover:shadow-lg hover:brightness-110"
                >
                    <Plus className="size-4" />
                    Añadir sección
                </Button>
            </footer>
        </div>
    );
}
