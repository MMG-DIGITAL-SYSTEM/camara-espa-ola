import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TonoTarjeta =
    | 'rojo'
    | 'azul'
    | 'violeta'
    | 'esmeralda'
    | 'ambar'
    | 'cian';

/**
 * Cada tarjeta lleva su color para que el resumen se lea de un vistazo: el
 * icono va en una pastilla de ese tono y una franja fina lo repite arriba.
 */
const TONOS: Record<TonoTarjeta, { pastilla: string; franja: string }> = {
    rojo: {
        pastilla: 'bg-rose-500/12 text-rose-600 dark:text-rose-300',
        franja: 'from-rose-500 to-orange-400',
    },
    azul: {
        pastilla: 'bg-sky-500/12 text-sky-600 dark:text-sky-300',
        franja: 'from-sky-500 to-blue-500',
    },
    violeta: {
        pastilla: 'bg-violet-500/12 text-violet-600 dark:text-violet-300',
        franja: 'from-violet-500 to-fuchsia-500',
    },
    esmeralda: {
        pastilla: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-300',
        franja: 'from-emerald-500 to-teal-400',
    },
    ambar: {
        pastilla: 'bg-amber-500/15 text-amber-600 dark:text-amber-300',
        franja: 'from-amber-500 to-orange-400',
    },
    cian: {
        pastilla: 'bg-cyan-500/12 text-cyan-600 dark:text-cyan-300',
        franja: 'from-cyan-500 to-sky-400',
    },
};

export function StatCard({
    titulo,
    valor,
    detalle,
    icono: Icono,
    tono = 'azul',
    destacado = false,
}: {
    titulo: string;
    valor: number | string;
    detalle?: string;
    icono: LucideIcon;
    tono?: TonoTarjeta;
    /** Resalta la tarjeta cuando el dato exige atención (p. ej. pendientes). */
    destacado?: boolean;
}) {
    const colores = TONOS[tono];

    return (
        <div
            className={cn(
                'group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg',
                destacado && 'border-marca/40 ring-2 ring-marca/15',
            )}
        >
            <span
                aria-hidden
                className={cn(
                    'absolute inset-x-0 top-0 h-1 bg-linear-to-r opacity-80 transition-opacity group-hover:opacity-100',
                    colores.franja,
                )}
            />
            <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium text-muted-foreground">
                    {titulo}
                </span>
                <span
                    className={cn(
                        'flex size-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110',
                        colores.pastilla,
                    )}
                >
                    <Icono className="size-4.5" />
                </span>
            </div>
            <p className="mt-3 text-3xl font-bold tracking-tight tabular-nums">
                {valor}
            </p>
            {detalle && (
                <p
                    className={cn(
                        'mt-1 truncate text-xs',
                        destacado
                            ? 'font-medium text-marca'
                            : 'text-muted-foreground',
                    )}
                >
                    {detalle}
                </p>
            )}
        </div>
    );
}
