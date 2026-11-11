import {
    BookOpen,
    CalendarDays,
    Download,
    FileText,
    Globe2,
} from 'lucide-react';
import { LibroPdf, usePortada } from '../libro-pdf';
import type { FichaLibro } from './lector-libro';

export type FichaEnEstante = Omit<FichaLibro, 'pdf'> & { pdf: string | null };

/** Ancho al que se dibuja la portada: el libro mide como mucho 160 px. */
const ANCHO_PORTADA = 180;

function TarjetaDeFicha({
    ficha,
    onAbrir,
}: {
    ficha: FichaEnEstante;
    onAbrir: () => void;
}) {
    const { portada, paginas } = usePortada(ficha.pdf, ANCHO_PORTADA);
    const disponible = ficha.pdf !== null;

    return (
        <article className="group flex h-full flex-col items-center gap-8 rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm transition-shadow duration-500 hover:shadow-xl sm:flex-row sm:items-center sm:p-8">
            <div className="shrink-0 pt-2">
                <LibroPdf
                    titulo={ficha.pais}
                    etiqueta="Ficha país"
                    icono={Globe2}
                    portada={portada}
                    disponible={disponible}
                    onAbrir={onAbrir}
                    etiquetaAccesible={
                        disponible
                            ? `Abrir la ficha país de ${ficha.pais}`
                            : `La ficha país de ${ficha.pais} estará disponible pronto`
                    }
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
