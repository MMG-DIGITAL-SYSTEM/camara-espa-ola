import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type {
    AnchoSeccion,
    EspaciadoSeccion,
    EstilosSeccion,
    FondoSeccion,
} from './tipos';

const FONDOS: Record<FondoSeccion, string> = {
    claro: 'bg-white text-gray-900',
    suave: 'bg-gray-50 text-gray-900',
    oscuro: 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white',
    marca: 'bg-gradient-to-r from-red-700 to-red-600 text-white',
};

const ESPACIADOS: Record<EspaciadoSeccion, string> = {
    compacto: 'py-10',
    normal: 'py-16 md:py-20',
    amplio: 'py-24 md:py-32',
};

const ANCHOS: Record<AnchoSeccion, string> = {
    estrecho: 'max-w-3xl',
    normal: 'max-w-6xl',
    completo: 'max-w-none',
};

/**
 * Envoltura común de todo bloque: traduce los ajustes de presentación que el
 * editor guarda en `estilos` a clases concretas.
 *
 * Que viva en un solo sitio es lo que mantiene coherente el sitio entero
 * cuando alguien no técnico apila secciones a su gusto.
 */
export function EnvoltorioSeccion({
    estilos,
    children,
    className,
}: {
    estilos?: EstilosSeccion;
    children: ReactNode;
    className?: string;
}) {
    const fondo = estilos?.fondo ?? 'claro';
    const espaciado = estilos?.espaciado ?? 'normal';
    const ancho = estilos?.ancho ?? 'normal';

    return (
        <section
            className={cn(
                // isolate: las capas con z negativo (imagen de fondo del hero)
                // quedan dentro de la sección y no detrás de su color de fondo.
                'relative isolate overflow-hidden',
                FONDOS[fondo],
                ESPACIADOS[espaciado],
                className,
            )}
            data-fondo={fondo}
        >
            <div
                className={cn(
                    'mx-auto px-4 md:px-6',
                    ANCHOS[ancho],
                    ancho === 'completo' && 'px-0 md:px-0',
                )}
            >
                {children}
            </div>
        </section>
    );
}

/**
 * Los textos secundarios necesitan un gris distinto según el fondo.
 */
export function tonoSecundario(estilos?: EstilosSeccion): string {
    const fondo = estilos?.fondo ?? 'claro';

    return fondo === 'oscuro' || fondo === 'marca'
        ? 'text-white/75'
        : 'text-gray-600';
}

/**
 * Campos de estilo que el editor ofrece para cualquier bloque.
 */
export const CAMPOS_DE_ESTILO = [
    {
        tipo: 'select' as const,
        clave: 'fondo',
        etiqueta: 'Fondo',
        opciones: [
            { valor: 'claro', etiqueta: 'Blanco' },
            { valor: 'suave', etiqueta: 'Gris suave' },
            { valor: 'oscuro', etiqueta: 'Oscuro' },
            { valor: 'marca', etiqueta: 'Rojo de la Cámara' },
        ],
    },
    {
        tipo: 'select' as const,
        clave: 'espaciado',
        etiqueta: 'Espaciado vertical',
        opciones: [
            { valor: 'compacto', etiqueta: 'Compacto' },
            { valor: 'normal', etiqueta: 'Normal' },
            { valor: 'amplio', etiqueta: 'Amplio' },
        ],
    },
    {
        tipo: 'select' as const,
        clave: 'ancho',
        etiqueta: 'Ancho del contenido',
        opciones: [
            { valor: 'estrecho', etiqueta: 'Estrecho' },
            { valor: 'normal', etiqueta: 'Normal' },
            { valor: 'completo', etiqueta: 'A todo lo ancho' },
        ],
    },
];
