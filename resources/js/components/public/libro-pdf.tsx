import { BookOpen, FileText } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { abrirPdf, imagenDePagina } from './fichas-pais/pdf';

/**
 * Primera página de un PDF como portada, y de paso cuántas páginas tiene.
 * `ancho` es el ancho al que se dibuja, en píxeles CSS.
 */
export function usePortada(
    pdf: string | null,
    ancho: number,
): {
    portada: string | null;
    paginas: number | null;
} {
    const [portada, setPortada] = useState<string | null>(null);
    const [paginas, setPaginas] = useState<number | null>(null);

    useEffect(() => {
        if (!pdf) {
            return;
        }

        let cancelado = false;
        let creada: string | null = null;

        abrirPdf(pdf)
            .then(async (documento) => {
                if (!cancelado) {
                    setPaginas(documento.numPages);
                }

                const { url } = await imagenDePagina(documento, 1, ancho);
                creada = url;

                if (!cancelado) {
                    setPortada(url);
                }
            })
            // Sin portada se queda la tapa de color: no es un error visible.
            .catch(() => undefined);

        return () => {
            cancelado = true;

            if (creada) {
                URL.revokeObjectURL(creada);
            }
        };
    }, [pdf, ancho]);

    return { portada, paginas };
}

/** Tapa de respaldo mientras carga la portada o si no hay PDF. */
function TapaDeColor({
    etiqueta,
    titulo,
    icono: Icono,
}: {
    etiqueta: string;
    titulo: string;
    icono: LucideIcon;
}) {
    return (
        <div className="flex h-full w-full flex-col justify-between bg-gradient-to-br from-red-700 via-red-600 to-red-800 p-4 text-white">
            <Icono className="h-6 w-6 opacity-80" />
            <div>
                <p className="text-[10px] font-semibold tracking-[0.25em] uppercase opacity-80">
                    {etiqueta}
                </p>
                <p className="mt-1 text-lg leading-tight font-bold">{titulo}</p>
            </div>
        </div>
    );
}

/**
 * Un PDF como libro de pie sobre su balda. Se endereza al pasar el ratón por
 * encima de su contenedor, que debe llevar la clase `group`.
 */
export function LibroPdf({
    titulo,
    etiqueta,
    portada,
    disponible,
    onAbrir,
    etiquetaAccesible,
    icono = FileText,
    className = 'w-36 sm:w-40',
    claseBalda = 'w-52',
}: {
    titulo: string;
    etiqueta: string;
    portada: string | null;
    disponible: boolean;
    onAbrir: () => void;
    etiquetaAccesible: string;
    icono?: LucideIcon;
    /** Ancho del libro. */
    className?: string;
    /** Ancho de la balda. */
    claseBalda?: string;
}) {
    return (
        <div className="flex flex-col items-center">
            <button
                type="button"
                onClick={onAbrir}
                disabled={!disponible}
                className="relative z-10 block [perspective:1200px] focus-visible:outline-none disabled:cursor-not-allowed"
                aria-label={etiquetaAccesible}
            >
                <div
                    className={cn(
                        'relative aspect-[1/1.414] [transform:rotateY(-14deg)] transition-transform duration-500 ease-out [transform-style:preserve-3d]',
                        className,
                        disponible &&
                            'group-focus-within:[transform:rotateY(0deg)_translateY(-10px)] group-hover:[transform:rotateY(0deg)_translateY(-10px)]',
                    )}
                >
                    {/* Hojas asomando por el borde, bajo la tapa. */}
                    <div className="absolute top-1 -right-1 bottom-1 w-full rounded-r-md bg-[repeating-linear-gradient(90deg,#fafaf9_0px,#fafaf9_2px,#e7e5e4_3px)] shadow-[4px_6px_14px_rgba(0,0,0,0.18)]" />

                    {/* Tapa. */}
                    <div className="absolute inset-0 overflow-hidden rounded-l-sm rounded-r-md bg-white shadow-[8px_10px_24px_rgba(0,0,0,0.25)]">
                        {portada ? (
                            <img
                                src={portada}
                                alt=""
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <TapaDeColor
                                etiqueta={etiqueta}
                                titulo={titulo}
                                icono={icono}
                            />
                        )}

                        {/* Lomo y brillo, para que parezca encuadernado. */}
                        <div className="pointer-events-none absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/35 via-black/10 to-transparent" />
                        <div className="pointer-events-none absolute inset-y-0 left-3 w-px bg-white/40" />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/25 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    </div>

                    {disponible && (
                        <span className="absolute -top-3 -right-3 flex h-9 w-9 scale-75 items-center justify-center rounded-full bg-red-600 text-white opacity-0 shadow-lg transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
                            <BookOpen className="h-4 w-4" />
                        </span>
                    )}
                </div>
            </button>

            {/* Balda bajo el libro. */}
            <div
                className={cn(
                    'relative -mt-1 h-3.5 rounded-sm bg-gradient-to-b from-stone-200 to-stone-300 shadow-[0_10px_18px_-8px_rgba(0,0,0,0.35)]',
                    claseBalda,
                )}
            >
                <div className="absolute inset-x-0 top-0 h-px bg-white/70" />
            </div>
        </div>
    );
}
