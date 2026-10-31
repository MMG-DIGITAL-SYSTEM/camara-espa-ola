import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { colorConAlfa, colorOVacio } from '../color';
import type { PropsBloque } from '../tipos';
import { IconoPorNombre } from './dinamicos';

type DatosPortadaModulo = {
    antetitulo?: string;
    titulo?: string;
    titulo_destacado?: string;
    /** Una línea por renglón. */
    titulo_cierre?: string;
    descripcion?: string;
    alineacion?: 'izquierda' | 'centro';
    tema?: 'oscuro' | 'claro';
    decoracion?: 'particulas' | 'moleculas' | 'ninguna';
    imagen?: string;
    video?: string;
    etiquetas?: { icono?: string; texto?: string }[];
    cifras?: { icono?: string; valor?: string; etiqueta?: string }[];
    boton_texto?: string;
    boton_enlace?: string;
    tamano_titulo?: 'mediano' | 'grande' | 'enorme';
    espaciado?: 'compacto' | 'normal' | 'amplio';
    color_antetitulo?: string;
    color_titulo?: string;
    color_destacado?: string;
    color_cierre?: string;
    color_descripcion?: string;
    color_acento?: string;
    color_fondo?: string;
};

const TAMANOS_TITULO = {
    mediano: 'text-3xl md:text-5xl lg:text-6xl',
    grande: 'text-4xl md:text-6xl lg:text-7xl',
    enorme: 'text-5xl md:text-7xl lg:text-8xl',
};

const ESPACIADOS = {
    compacto: 'py-12 md:py-16',
    normal: 'py-20 md:py-28',
    amplio: 'py-28 md:py-40',
};

const MOLECULAS = [
    { icono: '◆', tamano: 'text-3xl', x: 10, y: 20, retraso: 0, duracion: 8 },
    { icono: '●', tamano: 'text-4xl', x: 85, y: 15, retraso: 2, duracion: 10 },
    { icono: '▲', tamano: 'text-2xl', x: 15, y: 75, retraso: 1, duracion: 7 },
    { icono: '■', tamano: 'text-3xl', x: 90, y: 70, retraso: 3, duracion: 9 },
    { icono: '✦', tamano: 'text-2xl', x: 50, y: 10, retraso: 0.5, duracion: 6 },
    { icono: '⬢', tamano: 'text-3xl', x: 5, y: 50, retraso: 2.5, duracion: 11 },
    { icono: '⬡', tamano: 'text-2xl', x: 75, y: 45, retraso: 1.5, duracion: 8 },
    { icono: '◈', tamano: 'text-4xl', x: 25, y: 90, retraso: 3.5, duracion: 7 },
    { icono: '◉', tamano: 'text-3xl', x: 60, y: 85, retraso: 0.8, duracion: 9 },
    { icono: '▣', tamano: 'text-2xl', x: 45, y: 5, retraso: 2.2, duracion: 6 },
    { icono: '◐', tamano: 'text-3xl', x: 70, y: 30, retraso: 1.8, duracion: 10 },
    { icono: '◑', tamano: 'text-2xl', x: 30, y: 40, retraso: 3.2, duracion: 8 },
];

/**
 * Portada de las páginas de módulo (Actividades, Noticias, Socios…).
 *
 * Reúne en un solo bloque las portadas que antes estaban escritas a mano en
 * cada vista: fondo oscuro con una luz que sigue al ratón, o un vídeo o una
 * imagen a todo el ancho, y el título repartido en una línea blanca, una roja
 * y las de cierre. Como es un bloque, el editor la pinta igual que el sitio.
 */
export function BloquePortadaModulo({ datos }: PropsBloque<DatosPortadaModulo>) {
    const [cargado, setCargado] = useState(false);
    const [raton, setRaton] = useState({ x: 0.5, y: 0.5 });

    // Se calculan una sola vez: el ratón re-renderiza la portada sin parar
    // y, generadas en el render, las partículas saltarían de sitio.
    const [particulas] = useState(() =>
        Array.from({ length: 20 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            tamano: Math.random() * 5 + 2,
            retraso: Math.random() * 5,
            duracion: Math.random() * 4 + 3,
        })),
    );

    useEffect(() => {
        // En requestAnimationFrame el navegador pinta antes el estado inicial
        // y la transición de entrada llega a verse.
        const id = requestAnimationFrame(() => setCargado(true));

        return () => cancelAnimationFrame(id);
    }, []);

    const alMoverRaton = (evento: React.MouseEvent<HTMLElement>) => {
        const caja = evento.currentTarget.getBoundingClientRect();

        setRaton({
            x: (evento.clientX - caja.left) / caja.width,
            y: (evento.clientY - caja.top) / caja.height,
        });
    };

    if (datos.tema === 'claro') {
        return <PortadaClara datos={datos} />;
    }

    const conMedio = Boolean(datos.video || datos.imagen);
    const centrado = conMedio || datos.alineacion === 'centro';

    const contenido = (
        <ContenidoPortada
            datos={datos}
            centrado={centrado}
            cargado={cargado}
        />
    );

    if (conMedio) {
        const sombra = {
            background: `radial-gradient(circle at ${raton.x * 100}% ${raton.y * 100}%, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.6) 100%)`,
        };

        return (
            <section
                onMouseMove={alMoverRaton}
                className="relative isolate w-full overflow-hidden bg-gray-900 text-white"
            >
                <div
                    className={cn(
                        'relative w-full',
                        datos.video && 'aspect-video md:aspect-[21/9]',
                    )}
                >
                    <div
                        className={cn(
                            'transition-transform duration-300 ease-out',
                            datos.video && 'absolute inset-0',
                        )}
                        style={{
                            transform: `scale(${1 + (raton.y - 0.5) * 0.02})`,
                        }}
                    >
                        {datos.video ? (
                            <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="h-full w-full object-cover"
                                src={datos.video}
                            />
                        ) : (
                            <img
                                src={datos.imagen}
                                alt=""
                                aria-hidden
                                className="block h-auto min-h-[440px] w-full object-cover"
                            />
                        )}
                    </div>

                    <div
                        aria-hidden
                        className="absolute inset-0 transition-all duration-300 ease-out"
                        style={sombra}
                    />

                    <div className="absolute inset-0 z-10 flex items-center justify-center px-6">
                        {contenido}
                    </div>
                </div>
            </section>
        );
    }

    const fondo = colorOVacio(datos.color_fondo);
    const acento = colorOVacio(datos.color_acento);

    return (
        <section
            onMouseMove={alMoverRaton}
            className={cn(
                'relative isolate overflow-hidden bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white',
                ESPACIADOS[datos.espaciado ?? 'normal'] ?? ESPACIADOS.normal,
                datos.decoracion === 'moleculas' &&
                    'flex min-h-[600px] items-center',
            )}
            style={
                fondo
                    ? { backgroundColor: fondo, backgroundImage: 'none' }
                    : undefined
            }
        >
            <div
                aria-hidden
                className="absolute inset-0 transition-all duration-300 ease-out"
                style={{
                    background: `radial-gradient(circle at ${raton.x * 100}% ${raton.y * 100}%, ${acento ? colorConAlfa(acento, 0.13) : 'rgba(239, 68, 68, 0.13)'} 0%, transparent 60%)`,
                }}
            />

            {datos.decoracion === 'particulas' &&
                particulas.map((particula) => (
                    <div
                        key={particula.id}
                        aria-hidden
                        className="portada-flotar absolute rounded-full bg-white/10"
                        style={{
                            left: `${particula.x}%`,
                            top: `${particula.y}%`,
                            width: `${particula.tamano}px`,
                            height: `${particula.tamano}px`,
                            animationDelay: `${particula.retraso}s`,
                            animationDuration: `${particula.duracion}s`,
                        }}
                    />
                ))}

            {datos.decoracion === 'moleculas' && (
                <>
                    <div aria-hidden className="absolute inset-0 opacity-20">
                        <svg className="h-full w-full">
                            <pattern
                                id="portada-puntos"
                                x="0"
                                y="0"
                                width="40"
                                height="40"
                                patternUnits="userSpaceOnUse"
                            >
                                <circle cx="2" cy="2" r="2" fill="white" />
                            </pattern>
                            <rect
                                width="100%"
                                height="100%"
                                fill="url(#portada-puntos)"
                            />
                        </svg>
                    </div>
                    {MOLECULAS.map((molecula, indice) => (
                        <div
                            key={indice}
                            aria-hidden
                            className={`absolute ${molecula.tamano} portada-molecula font-bold text-red-500/20`}
                            style={{
                                color: acento
                                    ? colorConAlfa(acento, 0.2)
                                    : undefined,
                                left: `${molecula.x}%`,
                                top: `${molecula.y}%`,
                                animationDelay: `${molecula.retraso}s`,
                                animationDuration: `${molecula.duracion}s`,
                                transform: `translate(${(raton.x - 0.5) * 30 * ((indice % 3) + 1)}px, ${(raton.y - 0.5) * 30 * ((indice % 2) + 1)}px)`,
                                transition: 'transform 0.3s ease-out',
                            }}
                        >
                            {molecula.icono}
                        </div>
                    ))}
                </>
            )}

            <div className="relative z-10 container mx-auto px-6">
                {contenido}
            </div>

            <div
                aria-hidden
                className="absolute right-0 bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent"
                style={
                    acento
                        ? {
                              backgroundImage: `linear-gradient(to right, transparent, ${acento}, transparent)`,
                          }
                        : undefined
                }
            />

            <style>{`
        @keyframes portada-flotar {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .portada-flotar { animation: portada-flotar ease-in-out infinite; }
        @keyframes portada-molecula {
          0%, 100% { translate: 0px 0px; rotate: 0deg; }
          25% { translate: 20px -30px; rotate: 10deg; }
          50% { translate: -15px -40px; rotate: -5deg; }
          75% { translate: 25px -20px; rotate: 15deg; }
        }
        .portada-molecula { animation: portada-molecula ease-in-out infinite; will-change: translate; }
      `}</style>
        </section>
    );
}

const TAMANOS_TITULO_CLARO = {
    mediano: 'text-2xl md:text-3xl',
    grande: 'text-3xl md:text-4xl',
    enorme: 'text-4xl md:text-6xl',
};

/**
 * Variante sobre fondo blanco, como la cabecera de Contacto: más sobria, con
 * el título en una sola línea y la parte destacada en rojo.
 */
function PortadaClara({ datos }: { datos: DatosPortadaModulo }) {
    const centrado = datos.alineacion !== 'izquierda';
    const acento = colorOVacio(datos.color_acento);
    const linea = acento ? { backgroundColor: acento } : undefined;
    const color = (valor?: string) => {
        const valido = colorOVacio(valor);

        return valido ? { color: valido } : undefined;
    };
    const fondo = colorOVacio(datos.color_fondo);

    return (
        <section
            className={cn(
                'bg-white',
                ESPACIADOS[datos.espaciado ?? 'normal'] ?? ESPACIADOS.normal,
            )}
            style={fondo ? { backgroundColor: fondo } : undefined}
        >
            <div
                className={cn(
                    'container mx-auto px-6',
                    centrado && 'text-center',
                )}
            >
                <div className={cn('max-w-3xl', centrado && 'mx-auto')}>
                    {datos.antetitulo && (
                        <div
                            className={cn(
                                'mb-4 flex items-center gap-3',
                                centrado && 'justify-center',
                            )}
                        >
                            <span
                                className="h-px w-10 bg-red-600"
                                style={linea}
                            />
                            <span
                                className="text-sm font-medium tracking-[0.2em] text-red-600 uppercase"
                                style={color(datos.color_antetitulo)}
                            >
                                {datos.antetitulo}
                            </span>
                            {centrado && (
                                <span
                                    className="h-px w-10 bg-red-600"
                                    style={linea}
                                />
                            )}
                        </div>
                    )}

                    <h2
                        className={cn(
                            'font-bold tracking-wide text-gray-900 uppercase',
                            TAMANOS_TITULO_CLARO[
                                datos.tamano_titulo ?? 'grande'
                            ] ?? TAMANOS_TITULO_CLARO.grande,
                        )}
                    >
                        {datos.titulo && (
                            <span style={color(datos.color_titulo)}>
                                {datos.titulo}
                            </span>
                        )}
                        {datos.titulo_destacado && (
                            <>
                                {' '}
                                <span
                                    className="text-red-600"
                                    style={color(datos.color_destacado)}
                                >
                                    {datos.titulo_destacado}
                                </span>
                            </>
                        )}
                        {datos.titulo_cierre && (
                            <span
                                className="block"
                                style={color(datos.color_cierre)}
                            >
                                {datos.titulo_cierre}
                            </span>
                        )}
                    </h2>

                    {datos.descripcion && (
                        <p
                            className={cn(
                                'mt-4 max-w-xl leading-relaxed text-gray-600',
                                centrado && 'mx-auto',
                            )}
                            style={color(datos.color_descripcion)}
                        >
                            {datos.descripcion}
                        </p>
                    )}

                    {datos.boton_texto && (
                        <a
                            href={datos.boton_enlace || '#'}
                            className="mt-8 inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-red-700 hover:shadow-lg"
                            style={linea}
                        >
                            {datos.boton_texto}
                            <ChevronRight className="h-4 w-4" />
                        </a>
                    )}
                </div>
            </div>
        </section>
    );
}

function ContenidoPortada({
    datos,
    centrado,
    cargado,
}: {
    datos: DatosPortadaModulo;
    centrado: boolean;
    cargado: boolean;
}) {
    const entrada = (retraso?: string) =>
        cn(
            'transition-all duration-1000',
            retraso,
            cargado ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
        );

    const lineasDeCierre = (datos.titulo_cierre ?? '')
        .split('\n')
        .map((linea) => linea.trim())
        .filter(Boolean);
    const acento = colorOVacio(datos.color_acento);
    const color = (valor?: string) => {
        const valido = colorOVacio(valor);

        return valido ? { color: valido } : undefined;
    };
    const linea = acento ? { backgroundColor: acento } : undefined;
    const etiquetas = (datos.etiquetas ?? []).filter((e) => e.texto);
    const cifras = (datos.cifras ?? []).filter((c) => c.valor || c.etiqueta);

    return (
        <div
            className={cn(
                'w-full',
                centrado ? 'mx-auto max-w-4xl text-center' : 'max-w-4xl',
            )}
        >
            {datos.antetitulo && (
                <div
                    className={cn(
                        'mb-6 flex items-center gap-4',
                        centrado && 'justify-center',
                        entrada(),
                    )}
                >
                    <span
                        className="h-px w-12 shrink-0 bg-red-500 md:w-20"
                        style={linea}
                    />
                    <span
                        className="text-sm font-medium tracking-[0.2em] text-red-400 uppercase"
                        style={color(datos.color_antetitulo)}
                    >
                        {datos.antetitulo}
                    </span>
                    <span
                        className="h-px w-12 shrink-0 bg-red-500 md:w-20"
                        style={linea}
                    />
                </div>
            )}

            <h1
                className={cn(
                    'leading-tight font-bold',
                    TAMANOS_TITULO[datos.tamano_titulo ?? 'grande'] ??
                        TAMANOS_TITULO.grande,
                    entrada('delay-200'),
                )}
            >
                {datos.titulo && (
                    <span className="block" style={color(datos.color_titulo)}>
                        {datos.titulo}
                    </span>
                )}
                {datos.titulo_destacado && (
                    <span
                        className="block text-red-500"
                        style={color(datos.color_destacado)}
                    >
                        {datos.titulo_destacado}
                    </span>
                )}
                {lineasDeCierre.map((texto, indice) => (
                    <span
                        key={indice}
                        className="block text-white/90"
                        style={color(datos.color_cierre)}
                    >
                        {texto}
                    </span>
                ))}
            </h1>

            {datos.descripcion && (
                <p
                    className={cn(
                        'mt-5 max-w-2xl text-lg leading-relaxed text-gray-300',
                        centrado && 'mx-auto',
                        entrada('delay-300'),
                    )}
                    style={color(datos.color_descripcion)}
                >
                    {datos.descripcion}
                </p>
            )}

            {etiquetas.length > 0 && (
                <div
                    className={cn(
                        'mt-8 flex flex-wrap gap-3',
                        centrado && 'justify-center',
                        entrada('delay-500'),
                    )}
                >
                    {etiquetas.map((etiqueta, indice) => (
                        <div
                            key={indice}
                            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 backdrop-blur-sm"
                        >
                            <IconoPorNombre
                                nombre={etiqueta.icono}
                                className="h-4 w-4 text-red-400"
                                style={color(datos.color_acento)}
                            />
                            <span
                                className="text-sm text-gray-300"
                                style={color(datos.color_descripcion)}
                            >
                                {etiqueta.texto}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {cifras.length > 0 && (
                <div
                    className={cn(
                        'mt-8 flex flex-wrap gap-8',
                        centrado && 'justify-center',
                        entrada('delay-500'),
                    )}
                >
                    {cifras.map((cifra, indice) => (
                        <div
                            key={indice}
                            className="flex items-center gap-3 text-left"
                        >
                            <div
                                className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600/20"
                                style={
                                    acento
                                        ? {
                                              backgroundColor: colorConAlfa(
                                                  acento,
                                                  0.2,
                                              ),
                                          }
                                        : undefined
                                }
                            >
                                <IconoPorNombre
                                    nombre={cifra.icono}
                                    className="h-6 w-6 text-red-400"
                                    style={color(datos.color_acento)}
                                />
                            </div>
                            <div>
                                <span
                                    className="text-2xl font-bold text-white"
                                    style={color(datos.color_titulo)}
                                >
                                    {cifra.valor}
                                </span>
                                <p
                                    className="text-xs text-gray-400"
                                    style={color(datos.color_descripcion)}
                                >
                                    {cifra.etiqueta}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {datos.boton_texto && (
                <div className={cn('mt-10', entrada('delay-700'))}>
                    <a
                        href={datos.boton_enlace || '#'}
                        className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-red-600 px-8 py-4 font-medium text-white transition-all duration-300 hover:scale-105 hover:bg-red-700 hover:shadow-2xl"
                        style={linea}
                    >
                        <span className="relative z-10">
                            {datos.boton_texto}
                        </span>
                        <ChevronRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </a>
                </div>
            )}
        </div>
    );
}
