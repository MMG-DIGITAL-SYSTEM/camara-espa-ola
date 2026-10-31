import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export function EmptyState({
    icono: Icono,
    titulo,
    descripcion,
    accion,
}: {
    icono: LucideIcon;
    titulo: string;
    descripcion?: string;
    accion?: ReactNode;
}) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-marca-suave">
                <Icono className="size-5 text-marca" />
            </span>
            <div>
                <p className="font-medium">{titulo}</p>
                {descripcion && (
                    <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                        {descripcion}
                    </p>
                )}
            </div>
            {accion}
        </div>
    );
}
