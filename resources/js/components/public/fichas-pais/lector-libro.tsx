import {
    ChevronLeft,
    ChevronRight,
    Download,
    LoaderCircle,
    X,
} from 'lucide-react';
import { PageFlip } from 'page-flip';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { useCallback, useEffect, useRef, useState } from 'react';
import { abrirPdf, imagenDePagina } from './pdf';

export type FichaLibro = {
    id: number;
    pais: string;
    titulo: string;
    descripcion: string | null;
    pdf: string;
    fecha_publicacion: string | null;
};

type Libro = {
    documento: PDFDocumentProxy;
    total: number;
    /** Alto entre ancho de la primera página. */
    proporcion: number;
    /** Ancho de cada página en píxeles CSS. */
    ancho: number;
    doble: boolean;
};

/** Margen que se reserva alrededor del libro: cabecera, controles y aire. */
const RESERVA_VERTICAL = 190;
const RESERVA_HORIZONTAL = 48;

/** Páginas que se preparan alrededor de la que se está leyendo. */
const ADELANTE = 6;
const ATRAS = 2;

/**
 * Ancho de cada página para que el libro abierto quepa en la ventana.
 * En pantallas estrechas se muestra una sola página.
 */
function medidas(proporcion: number): { ancho: number; doble: boolean } {
    const doble = window.innerWidth >= 768;
    const porAncho =
        (window.innerWidth - RESERVA_HORIZONTAL - (doble ? 120 : 0)) /
        (doble ? 2 : 1);
    const porAlto = (window.innerHeight - RESERVA_VERTICAL) / proporcion;

    return {
        ancho: Math.floor(Math.max(200, Math.min(porAncho, porAlto, 640))),
        doble,
    };
}

/**
 * Lector a pantalla completa: el PDF se convierte en un libro cuyas páginas
 * se pasan arrastrando la esquina, con las flechas o con el teclado.
 *
 * Una ficha puede tener cientos de páginas: el libro se abre en cuanto se
 * conoce el tamaño y cada página se dibuja solo cuando el lector se acerca.
 */
export function LectorLibro({
    ficha,
    onCerrar,
    etiqueta = `Ficha país · ${ficha.pais}`,
}: {
    ficha: FichaLibro;
    onCerrar: () => void;
    /** Antetítulo de la cabecera del lector. */
    etiqueta?: string;
}) {
    const anfitrion = useRef<HTMLDivElement>(null);
    const pageFlip = useRef<PageFlip | null>(null);
    const prepararCerca = useRef<(pagina: number) => void>(() => undefined);

    const [libro, setLibro] = useState<Libro | null>(null);
    const [actual, setActual] = useState(0);
    const [doble, setDoble] = useState(true);
    const [error, setError] = useState(false);

    // 1. Abrir el PDF y medir la primera página.
    useEffect(() => {
        let cancelado = false;

        abrirPdf(ficha.pdf)
            .then(async (documento) => {
                const primera = await documento.getPage(1);
                const base = primera.getViewport({ scale: 1 });
                const proporcion = base.height / base.width;

                if (!cancelado) {
                    setLibro({
                        documento,
                        total: documento.numPages,
                        proporcion,
                        ...medidas(proporcion),
                    });
                }
            })
            .catch((motivo) => {
                console.error('No se pudo abrir la ficha país', motivo);

                if (!cancelado) {
                    setError(true);
                }
            });

        return () => {
            cancelado = true;
        };
    }, [ficha.pdf]);

    // 2. Montar el libro con hojas vacías y dibujarlas según se acerca el
    //    lector. page-flip borra su contenedor al destruirse: se le da un
    //    nodo propio, fuera de React.
    useEffect(() => {
        if (!libro || !anfitrion.current) {
            return;
        }

        const { documento, total, proporcion, ancho } = libro;
        const alto = Math.round(ancho * proporcion);
        let cancelado = false;

        const bloque = document.createElement('div');
        bloque.style.width = `${libro.doble ? ancho * 2 : ancho}px`;
        bloque.style.height = `${alto}px`;
        anfitrion.current.appendChild(bloque);

        const imagenes: HTMLImageElement[] = [];
        const hojas = Array.from({ length: total }, (_, indice) => {
            const hoja = document.createElement('div');
            hoja.className = 'relative bg-white';

            const espera = document.createElement('div');
            espera.className =
                'absolute inset-0 flex items-center justify-center text-sm text-stone-400';
            espera.textContent = `Página ${indice + 1}`;

            const imagen = document.createElement('img');
            imagen.alt = `${ficha.titulo}, página ${indice + 1}`;
            imagen.draggable = false;
            imagen.className =
                'relative h-full w-full select-none object-contain opacity-0 transition-opacity duration-300';
            imagen.onload = () => imagen.classList.remove('opacity-0');

            hoja.append(espera, imagen);
            imagenes.push(imagen);

            return hoja;
        });

        // Cola de dibujo: de una en una, primero las más cercanas.
        const hechas = new Set<number>();
        const urls: string[] = [];
        let cola: number[] = [];
        let trabajando = false;

        const procesar = async () => {
            if (trabajando) {
                return;
            }

            trabajando = true;

            while (cola.length > 0 && !cancelado) {
                const indice = cola.shift()!;

                if (hechas.has(indice)) {
                    continue;
                }

                hechas.add(indice);

                try {
                    const { url } = await imagenDePagina(
                        documento,
                        indice + 1,
                        ancho,
                    );

                    if (cancelado) {
                        URL.revokeObjectURL(url);
                        break;
                    }

                    urls.push(url);
                    imagenes[indice].src = url;
                } catch (motivo) {
                    hechas.delete(indice);
                    console.error(
                        `No se pudo dibujar la página ${indice + 1}`,
                        motivo,
                    );
                }
            }

            trabajando = false;
        };

        prepararCerca.current = (pagina: number) => {
            const cerca: number[] = [];

            for (let paso = 0; paso <= ADELANTE; paso++) {
                cerca.push(pagina + paso);
            }

            for (let paso = 1; paso <= ATRAS; paso++) {
                cerca.push(pagina - paso);
            }

            const nuevas = cerca.filter(
                (indice) =>
                    indice >= 0 && indice < total && !hechas.has(indice),
            );

            cola = [...nuevas, ...cola.filter((i) => !nuevas.includes(i))];
            void procesar();
        };

        const instancia = new PageFlip(bloque, {
            width: ancho,
            height: alto,
            size: 'fixed',
            showCover: true,
            usePortrait: true,
            drawShadow: true,
            maxShadowOpacity: 0.45,
            flippingTime: 900,
            mobileScrollSupport: false,
            showPageCorners: true,
        });

        instancia.loadFromHTML(hojas);
        instancia.on('flip', (evento) => {
            setActual(evento.data);
            prepararCerca.current(evento.data);
        });
        instancia.on('changeOrientation', (evento) =>
            setDoble(evento.data === 'landscape'),
        );
        pageFlip.current = instancia;
        setDoble(libro.doble);
        prepararCerca.current(0);

        return () => {
            cancelado = true;
            pageFlip.current = null;
            prepararCerca.current = () => undefined;
            instancia.destroy();
            urls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [libro, ficha.titulo]);

    const anterior = useCallback(() => pageFlip.current?.flipPrev(), []);
    const siguiente = useCallback(() => pageFlip.current?.flipNext(), []);

    const irA = useCallback((pagina: number) => {
        pageFlip.current?.turnToPage(pagina);
        setActual(pagina);
        prepararCerca.current(pagina);
    }, []);

    // Teclado y scroll del fondo bloqueado mientras el lector está abierto.
    useEffect(() => {
        const alPulsar = (evento: KeyboardEvent) => {
            if (evento.key === 'Escape') {
                onCerrar();
            } else if (evento.key === 'ArrowLeft') {
                anterior();
            } else if (evento.key === 'ArrowRight') {
                siguiente();
            }
        };

        const desbordamiento = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', alPulsar);

        return () => {
            document.body.style.overflow = desbordamiento;
            window.removeEventListener('keydown', alPulsar);
        };
    }, [onCerrar, anterior, siguiente]);

    const total = libro?.total ?? 0;

    // En doble página, la portada va sola y luego van de dos en dos.
    const visibles =
        doble && actual > 0 && actual < total - 1
            ? `${actual + 1}–${actual + 2}`
            : `${actual + 1}`;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label={ficha.titulo}
            className="fixed inset-0 z-50 flex flex-col bg-neutral-950/95 text-white backdrop-blur-sm"
        >
            <header className="flex items-center gap-4 px-4 py-3 md:px-8">
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold tracking-[0.2em] text-red-400 uppercase">
                        {etiqueta}
                    </p>
                    <h2 className="truncate text-base font-semibold md:text-lg">
                        {ficha.titulo}
                    </h2>
                </div>
                <a
                    href={ficha.pdf}
                    download
                    className="hidden items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm transition hover:bg-white/10 sm:inline-flex"
                >
                    <Download className="h-4 w-4" />
                    Descargar PDF
                </a>
                <button
                    type="button"
                    onClick={onCerrar}
                    className="rounded-full p-2 transition hover:bg-white/10"
                    aria-label="Cerrar lector"
                >
                    <X className="h-6 w-6" />
                </button>
            </header>

            <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4">
                {error ? (
                    <div className="max-w-sm text-center">
                        <p className="font-medium">
                            No pudimos abrir este PDF en el navegador.
                        </p>
                        <p className="mt-1 text-sm text-white/60">
                            Puede que el archivo ya no exista. Prueba a abrirlo
                            directamente.
                        </p>
                        <a
                            href={ficha.pdf}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-4 inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-medium transition hover:bg-red-700"
                        >
                            <Download className="h-4 w-4" />
                            Abrir el PDF
                        </a>
                    </div>
                ) : (
                    !libro && (
                        <div className="flex flex-col items-center gap-3 text-white/70">
                            <LoaderCircle className="h-8 w-8 animate-spin text-red-400" />
                            <p className="text-sm">Abriendo la ficha…</p>
                        </div>
                    )
                )}

                <div
                    ref={anfitrion}
                    className="drop-shadow-[0_30px_40px_rgba(0,0,0,0.55)]"
                />

                {libro && (
                    <>
                        <button
                            type="button"
                            onClick={anterior}
                            disabled={actual === 0}
                            className="absolute left-2 rounded-full bg-white/10 p-3 transition hover:bg-white/20 disabled:opacity-0 md:left-6"
                            aria-label="Página anterior"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                            type="button"
                            onClick={siguiente}
                            disabled={actual >= total - 1}
                            className="absolute right-2 rounded-full bg-white/10 p-3 transition hover:bg-white/20 disabled:opacity-0 md:right-6"
                            aria-label="Página siguiente"
                        >
                            <ChevronRight className="h-6 w-6" />
                        </button>
                    </>
                )}
            </div>

            <footer className="px-4 pt-2 pb-5">
                {libro && (
                    <div className="mx-auto flex max-w-2xl items-center gap-4">
                        <span className="w-24 shrink-0 text-right text-xs text-white/60 tabular-nums">
                            {visibles} / {total}
                        </span>
                        <input
                            type="range"
                            min={0}
                            max={Math.max(0, total - 1)}
                            value={actual}
                            onChange={(evento) =>
                                irA(Number(evento.target.value))
                            }
                            className="h-1.5 flex-1 cursor-pointer accent-red-500"
                            aria-label="Ir a la página"
                        />
                        <span className="hidden w-24 shrink-0 text-xs text-white/40 sm:block">
                            ← → para pasar
                        </span>
                    </div>
                )}
            </footer>
        </div>
    );
}
