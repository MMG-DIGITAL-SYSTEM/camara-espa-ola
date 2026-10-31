import {
    BookOpen,
    CalendarDays,
    Download,
    FileText,
    Globe2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { FichaLibro } from './lector-libro';
import { abrirPdf, imagenDePagina } from './pdf';

export type FichaEnEstante = Omit<FichaLibro, 'pdf'> & { pdf: string | null };

/** Ancho al que se dibuja la portada: el libro mide como mucho 176 px. */
const ANCHO_PORTADA = 180;

/** Primera página del PDF como portada, y de paso cuántas páginas tiene. */
function usePortada(pdf: string | null): {
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

                const { url } = await imagenDePagina(
                    documento,
                    1,
                    ANCHO_PORTADA,
                );
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
    }, [pdf]);

    return { portada, paginas };
}

/** Tapa de respaldo mientras carga la portada o si la ficha no tiene PDF. */
function TapaDeColor({ pais }: { pais: string }) {
    return (
        <div className="flex h-full w-full flex-col justify-between bg-gradient-to-br from-red-700 via-red-600 to-red-800 p-4 text-white">
            <Globe2 className="h-6 w-6 opacity-80" />
            <div>
                <p className="text-[10px] font-semibold tracking-[0.25em] uppercase opacity-80">
                    Ficha país
                </p>
                <p className="mt-1 text-lg leading-tight font-bold">{pais}</p>
            </div>
        </div>
    );
}

function Libro({
    pais,
    portada,
    disponible,
    onAbrir,
}: {
    pais: string;
    portada: string | null;
    disponible: boolean;
    onAbrir: () => void;
}) {
    return (
        <div className="flex flex-col items-center">
            <button
                type="button"
                onClick={onAbrir}
                disabled={!disponible}
                className="relative z-10 block [perspective:1200px] focus-visible:outline-none disabled:cursor-not-allowed"
                aria-label={
                    disponible
                        ? `Abrir la ficha país de ${pais}`
                        : `La ficha país de ${pais} estará disponible pronto`
                }
            >
                <div
                    className={cn(
                        'relative aspect-[1/1.414] w-36 [transform:rotateY(-14deg)] transition-transform duration-500 ease-out [transform-style:preserve-3d] sm:w-40',
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
                            <TapaDeColor pais={pais} />
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
            <div className="relative -mt-1 h-3.5 w-52 rounded-sm bg-gradient-to-b from-stone-200 to-stone-300 shadow-[0_10px_18px_-8px_rgba(0,0,0,0.35)]">
                <div className="absolute inset-x-0 top-0 h-px bg-white/70" />
            </div>
        </div>
    );
}

function TarjetaDeFicha({
    ficha,
    onAbrir,
}: {
    ficha: FichaEnEstante;
    onAbrir: () => void;
}) {
    const { portada, paginas } = usePortada(ficha.pdf);
    const disponible = ficha.pdf !== null;

    return (
        <article className="group flex h-full flex-col items-center gap-8 rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm transition-shadow duration-500 hover:shadow-xl sm:flex-row sm:items-center sm:p-8">
            <div className="shrink-0 pt-2">
                <Libro
                    pais={ficha.pais}
                    portada={portada}
                    disponible={disponible}
                    onAbrir={onAbrir}
                />
            </div>

            <div className="flex min-w-0 flex-1 flex-col text-center sm:text-left">
                <span className="inline-flex items-center justify-center gap-2 text-xs font-semibold tracking-[0.2em] text-red-600 uppercase sm:justify-start">
                    <Globe2 className="h-3.5 w-3.5" />
                    {ficha.pais}
                </span>

                <h3 className="mt-2 text-xl leading-snug font-bold text-gray-900 lg:text-2xl">
                    {ficha.titulo}
                </h3>

                {ficha.descripcion && (
                    <p className="mt-3 leading-relaxed text-gray-600">
                        {ficha.descripcion}
                    </p>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-gray-400 sm:justify-start">
                    {ficha.fecha_publicacion && (
                        <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="h-4 w-4" />
                            {ficha.fecha_publicacion}
                        </span>
                    )}
                    {paginas !== null && (
                        <span className="inline-flex items-center gap-1.5">
                            <FileText className="h-4 w-4" />
                            {paginas === 1 ? '1 página' : `${paginas} páginas`}
                        </span>
                    )}
                </div>

                {disponible ? (
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                        <button
                            type="button"
                            onClick={onAbrir}
                            className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-red-700"
                        >
                            <BookOpen className="h-4 w-4" />
                            Leer la ficha
                        </button>
                        <a
                            href={ficha.pdf ?? undefined}
                            download
                            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:border-red-200 hover:text-red-600"
                        >
                            <Download className="h-4 w-4" />
                            Descargar PDF
                        </a>
                    </div>
                ) : (
                    <p className="mt-6 text-sm font-medium text-gray-400">
                        Próximamente disponible
                    </p>
                )}
            </div>
        </article>
    );
}

/**
 * Las fichas país como libros en su balda, con toda su información al lado.
 * La portada de cada libro es la primera página real de su PDF.
 */
export function Estanteria({
    fichas,
    onAbrir,
}: {
    fichas: FichaEnEstante[];
    onAbrir: (ficha: FichaLibro) => void;
}) {
    return (
        <div className="grid gap-8 lg:grid-cols-2">
            {fichas.map((ficha) => (
                <TarjetaDeFicha
                    key={ficha.id}
                    ficha={ficha}
                    onAbrir={() =>
                        ficha.pdf && onAbrir({ ...ficha, pdf: ficha.pdf })
                    }
                />
            ))}
        </div>
    );
}
