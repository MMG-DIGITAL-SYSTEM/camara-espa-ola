import { Heart } from 'lucide-react';
import { useState } from 'react';
import { peticionJson } from '@/lib/http';
import { cn } from '@/lib/utils';
import {
    marcar as marcarActividad,
    quitar as quitarActividad,
} from '@/routes/api/me-gusta/actividad';
import {
    marcar as marcarNoticia,
    quitar as quitarNoticia,
} from '@/routes/api/me-gusta/noticia';

type Objetivo =
    { tipo: 'noticia'; slug: string } | { tipo: 'actividad'; id: number };

type EstadoMeGusta = { le_gusta: boolean; total: number };

function direccion(objetivo: Objetivo, marcar: boolean): string {
    if (objetivo.tipo === 'noticia') {
        return (marcar ? marcarNoticia : quitarNoticia)(objetivo.slug).url;
    }

    return (marcar ? marcarActividad : quitarActividad)(objetivo.id).url;
}

/**
 * «Me gusta» de una noticia o actividad. Cambia al instante y se corrige con
 * lo que responda el servidor; si la petición falla, vuelve a como estaba.
 */
export function BotonMeGusta({
    objetivo,
    totalInicial,
    leGustaInicial,
    className,
}: {
    objetivo: Objetivo;
    totalInicial: number;
    leGustaInicial: boolean;
    className?: string;
}) {
    const [estado, setEstado] = useState<EstadoMeGusta>({
        le_gusta: leGustaInicial,
        total: totalInicial,
    });
    const [enviando, setEnviando] = useState(false);
    const [latido, setLatido] = useState(false);

    const alternar = () => {
        if (enviando) {
            return;
        }

        const anterior = estado;
        const marcar = !estado.le_gusta;

        setEstado({
            le_gusta: marcar,
            total: Math.max(0, estado.total + (marcar ? 1 : -1)),
        });
        setLatido(marcar);
        setEnviando(true);

        peticionJson<EstadoMeGusta>(
            direccion(objetivo, marcar),
            marcar ? 'POST' : 'DELETE',
        )
            .then(setEstado)
            .catch(() => setEstado(anterior))
            .finally(() => setEnviando(false));
    };

    return (
        <button
            type="button"
            onClick={alternar}
            aria-pressed={estado.le_gusta}
            aria-label={
                estado.le_gusta
                    ? 'Quitar me gusta'
                    : 'Me gusta esta publicación'
            }
            className={cn(
                'flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300',
                estado.le_gusta
                    ? 'border-red-200 bg-red-50 text-red-600'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-red-300 hover:bg-red-50 hover:text-red-600',
                className,
            )}
        >
            <Heart
                onAnimationEnd={() => setLatido(false)}
                className={cn(
                    'h-4 w-4 transition-colors',
                    estado.le_gusta && 'fill-red-600 text-red-600',
                    latido && 'animate-[latido_0.45s_ease-out]',
                )}
            />
            <span>{estado.le_gusta ? 'Te gusta' : 'Me gusta'}</span>
            <span
                className={cn(
                    'rounded-full px-2 py-0.5 text-xs tabular-nums',
                    estado.le_gusta
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-600',
                )}
            >
                {estado.total}
            </span>
        </button>
    );
}

/** Contador de solo lectura para las tarjetas de los listados. */
export function ContadorMeGusta({
    total,
    leGusta,
}: {
    total: number;
    leGusta: boolean;
}) {
    return (
        <span
            className="flex items-center gap-1"
            aria-label={total === 1 ? '1 me gusta' : `${total} me gusta`}
        >
            <Heart
                className={cn(
                    'h-3.5 w-3.5',
                    leGusta && 'fill-red-500 text-red-500',
                )}
            />
            {total}
        </span>
    );
}
