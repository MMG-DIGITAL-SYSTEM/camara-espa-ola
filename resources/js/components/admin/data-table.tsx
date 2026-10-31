import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type Columna<T> = {
    clave: string;
    titulo: string;
    /** Contenido de la celda. Por defecto, el valor crudo de `clave`. */
    render?: (fila: T) => ReactNode;
    /** Oculta la columna en pantallas estrechas. */
    ocultarEnMovil?: boolean;
    alinear?: 'izquierda' | 'derecha';
};

export type EnlacePaginacion = {
    url: string | null;
    label: string;
    active: boolean;
};

export type Paginado<T> = {
    data: T[];
    links: EnlacePaginacion[];
    from: number | null;
    to: number | null;
    total: number;
};

export function DataTable<T extends { id: number | string }>({
    columnas,
    filas,
    vacio,
    acciones,
}: {
    columnas: Columna<T>[];
    filas: T[];
    /** Qué mostrar cuando no hay filas. */
    vacio: ReactNode;
    /** Celda final con los botones de cada fila. */
    acciones?: (fila: T) => ReactNode;
}) {
    if (filas.length === 0) {
        return <div className="rounded-xl border bg-card">{vacio}</div>;
    }

    return (
        <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b bg-muted/40 text-left">
                        {columnas.map((columna) => (
                            <th
                                key={columna.clave}
                                scope="col"
                                className={cn(
                                    'px-4 py-3 font-medium text-muted-foreground',
                                    columna.alinear === 'derecha' &&
                                        'text-right',
                                    columna.ocultarEnMovil &&
                                        'hidden md:table-cell',
                                )}
                            >
                                {columna.titulo}
                            </th>
                        ))}
                        {acciones && (
                            <th scope="col" className="px-4 py-3 text-right">
                                <span className="sr-only">Acciones</span>
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {filas.map((fila) => (
                        <tr
                            key={fila.id}
                            className="border-b transition-colors last:border-0 hover:bg-muted/30"
                        >
                            {columnas.map((columna) => (
                                <td
                                    key={columna.clave}
                                    className={cn(
                                        'px-4 py-3',
                                        columna.alinear === 'derecha' &&
                                            'text-right',
                                        columna.ocultarEnMovil &&
                                            'hidden md:table-cell',
                                    )}
                                >
                                    {columna.render
                                        ? columna.render(fila)
                                        : String(
                                              (fila as Record<string, unknown>)[
                                                  columna.clave
                                              ] ?? '—',
                                          )}
                                </td>
                            ))}
                            {acciones && (
                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                    {acciones(fila)}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function Paginacion({
    links,
    from,
    to,
    total,
}: Omit<Paginado<unknown>, 'data'>) {
    if (links.length <= 3) {
        return null;
    }

    return (
        <nav
            aria-label="Paginación"
            className="mt-4 flex flex-wrap items-center justify-between gap-3"
        >
            <p className="text-sm text-muted-foreground">
                Mostrando {from ?? 0}–{to ?? 0} de {total}
            </p>
            <div className="flex flex-wrap gap-1">
                {links.map((enlace, indice) =>
                    enlace.url ? (
                        <Link
                            key={`${enlace.label}-${indice}`}
                            href={enlace.url}
                            preserveScroll
                            className={cn(
                                'rounded-md border px-3 py-1.5 text-sm transition-colors',
                                enlace.active
                                    ? 'border-marca bg-marca text-marca-foreground'
                                    : 'hover:bg-muted',
                            )}
                            dangerouslySetInnerHTML={{ __html: enlace.label }}
                        />
                    ) : (
                        <span
                            key={`${enlace.label}-${indice}`}
                            className="rounded-md border px-3 py-1.5 text-sm text-muted-foreground/50"
                            dangerouslySetInnerHTML={{ __html: enlace.label }}
                        />
                    ),
                )}
            </div>
        </nav>
    );
}
