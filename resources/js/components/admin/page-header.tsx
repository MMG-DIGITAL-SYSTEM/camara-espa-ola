import type { ReactNode } from 'react';

/**
 * Encabezado estándar de cada sección del panel: título, descripción y un
 * hueco a la derecha para las acciones principales.
 */
export function PageHeader({
    titulo,
    descripcion,
    acciones,
}: {
    titulo: string;
    descripcion?: string;
    acciones?: ReactNode;
}) {
    return (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 gap-3">
                <span
                    aria-hidden
                    className="degradado-marca mt-1 w-1.5 shrink-0 self-stretch rounded-full"
                />
                <div className="min-w-0">
                    <h1 className="text-2xl font-bold tracking-tight">
                        {titulo}
                    </h1>
                    {descripcion && (
                        <p className="mt-1 text-sm text-muted-foreground">
                            {descripcion}
                        </p>
                    )}
                </div>
            </div>
            {acciones && (
                <div className="flex shrink-0 items-center gap-2">
                    {acciones}
                </div>
            )}
        </div>
    );
}
