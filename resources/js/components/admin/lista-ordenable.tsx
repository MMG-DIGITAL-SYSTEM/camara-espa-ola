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
import { router } from '@inertiajs/react';
import { EyeOff, GripVertical, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ElementoOrdenable = {
    id: number;
    activo: boolean;
};

function Fila<T extends ElementoOrdenable>({
    elemento,
    children,
    onEditar,
    onEliminar,
    etiqueta,
}: {
    elemento: T;
    children: ReactNode;
    onEditar: () => void;
    onEliminar: () => void;
    etiqueta: string;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: elemento.id });

    return (
        <li
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            className={cn(
                'flex items-center gap-3 border-b bg-card px-3 py-2.5 last:border-0',
                isDragging && 'z-10 rounded-md shadow-md',
                !elemento.activo && 'opacity-60',
            )}
        >
            <button
                type="button"
                {...attributes}
                {...listeners}
                aria-label={`Reordenar ${etiqueta}`}
                className="flex size-7 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground/60 hover:text-foreground active:cursor-grabbing"
            >
                <GripVertical className="size-4" />
            </button>

            <div className="min-w-0 flex-1">{children}</div>

            {!elemento.activo && (
                <span
                    title="No se muestra en el sitio"
                    className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground"
                >
                    <EyeOff className="size-3.5" />
                    Oculto
                </span>
            )}

            <div className="flex shrink-0 gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onEditar}
                    aria-label={`Editar ${etiqueta}`}
                >
                    <Pencil className="size-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onEliminar}
                    aria-label={`Eliminar ${etiqueta}`}
                    className="text-muted-foreground hover:text-destructive"
                >
                    <Trash2 className="size-4" />
                </Button>
            </div>
        </li>
    );
}

/**
 * Lista corta que se reordena arrastrando.
 *
 * El nuevo orden se manda al servidor en cuanto se suelta, pero la lista se
 * reacomoda antes en el cliente: esperar a la respuesta para mover la fila
 * haría que pareciera que el arrastre no funcionó.
 */
export function ListaOrdenable<T extends ElementoOrdenable>({
    elementos,
    rutaReordenar,
    etiquetaDe,
    onEditar,
    onEliminar,
    children,
    vacio,
}: {
    elementos: T[];
    /** Ruta que recibe `{ ids: [...] }` con el orden nuevo. */
    rutaReordenar: string;
    etiquetaDe: (elemento: T) => string;
    onEditar: (elemento: T) => void;
    onEliminar: (elemento: T) => void;
    children: (elemento: T) => ReactNode;
    vacio: ReactNode;
}) {
    /*
     * Orden provisional mientras el servidor confirma. No se espeja la prop en
     * estado con un efecto: se usa la lista del servidor salvo justo después
     * de soltar, y se descarta en cuanto la petición termina.
     */
    const [optimista, setOptimista] = useState<T[] | null>(null);
    const orden = optimista ?? elementos;

    const sensores = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const alSoltar = (evento: DragEndEvent) => {
        const { active, over } = evento;

        if (!over || active.id === over.id) {
            return;
        }

        const desde = orden.findIndex((e) => e.id === active.id);
        const hasta = orden.findIndex((e) => e.id === over.id);
        const copia = [...orden];
        const [movido] = copia.splice(desde, 1);

        copia.splice(hasta, 0, movido);
        setOptimista(copia);

        router.post(
            rutaReordenar,
            { ids: copia.map((e) => e.id) },
            {
                preserveScroll: true,
                onFinish: () => setOptimista(null),
            },
        );
    };

    if (orden.length === 0) {
        return <>{vacio}</>;
    }

    return (
        <DndContext
            sensors={sensores}
            collisionDetection={closestCenter}
            onDragEnd={alSoltar}
        >
            <SortableContext
                items={orden.map((e) => e.id)}
                strategy={verticalListSortingStrategy}
            >
                <ul className="overflow-hidden rounded-xl border bg-card">
                    {orden.map((elemento) => (
                        <Fila
                            key={elemento.id}
                            elemento={elemento}
                            etiqueta={etiquetaDe(elemento)}
                            onEditar={() => onEditar(elemento)}
                            onEliminar={() => onEliminar(elemento)}
                        >
                            {children(elemento)}
                        </Fila>
                    ))}
                </ul>
            </SortableContext>
        </DndContext>
    );
}
