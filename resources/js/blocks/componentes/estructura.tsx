import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FadeInLeft, FadeInRight, FadeInUp } from '@/components/public/reveal';
import { cn } from '@/lib/utils';
import { EnvoltorioSeccion, tonoSecundario } from '../seccion';
import type { PropsBloque } from '../tipos';

/**
 * El HTML viene del editor de texto enriquecido, que lo sanea en el servidor
 * antes de guardarlo.
 */
export function HtmlEnriquecido({
    html,
    className,
}: {
    html: string;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'prose-headings:font-semibold max-w-none leading-relaxed [&_a]:text-red-600 [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:mb-4 [&_blockquote]:border-l-4 [&_blockquote]:border-red-600/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:text-3xl [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-2xl [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-xl [&_h4]:mt-4 [&_h4]:mb-2 [&_h4]:text-lg [&_hr]:my-8 [&_li]:mb-1 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-4 [&_strong]:font-semibold [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5',
                className,
            )}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

function Boton({
    texto,
    enlace,
    invertido = false,
}: {
    texto?: string;
    enlace?: string;
    invertido?: boolean;
}) {
    if (!texto) {
        return null;
    }

    return (
        <a
            href={enlace || '#'}
            className={cn(
                'group inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition-all duration-300',
                invertido
                    ? 'bg-white text-red-700 hover:bg-white/90'
                    : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/20',
            )}
        >
            {texto}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </a>
    );
}

// ============================================================
// HERO
// ============================================================

type DatosHero = {
    antetitulo?: string;
    titulo?: string;
    titulo_destacado?: string;
    subtitulo?: string;
    imagen?: string;
    alineacion?: 'izquierda' | 'centro';
    boton_texto?: string;
    boton_enlace?: string;
};

/**
 * Hero a imagen completa, con el mismo estilo que la portada de La Cámara:
 * la foto ocupa todo el ancho, un degradado radial sigue al ratón y el título
 * se reparte en tres líneas (blanca, roja y fina) que entran escalonadas.
 */
function HeroConImagen({ datos }: { datos: DatosHero }) {
    const [cargado, setCargado] = useState(false);
    const [raton, setRaton] = useState({ x: 0.5, y: 0.5 });

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

    const entrada = (retraso: string) =>
        cn(
            'block transition-all duration-1000',
            retraso,
            cargado ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
        );

    return (
        <section
            onMouseMove={alMoverRaton}
            className="relative isolate w-full overflow-hidden bg-gray-900"
        >
            <div
                className="transition-transform duration-300 ease-out"
                style={{ transform: `scale(${1 + (raton.y - 0.5) * 0.02})` }}
            >
                <img
                    src={datos.imagen}
                    alt=""
                    aria-hidden
                    className="block h-auto min-h-[440px] w-full object-cover md:min-h-[560px]"
                />
            </div>

            <div
                aria-hidden
                className="absolute inset-0 transition-all duration-300 ease-out"
                style={{
                    background: `radial-gradient(circle at ${raton.x * 100}% ${raton.y * 100}%, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.65) 100%)`,
                }}
            />

            <div className="absolute inset-0 z-10 flex items-center justify-center">
                <div className="w-full px-6 text-center text-white">
                    {datos.antetitulo && (
                        <div
                            className={cn(
                                'mb-6 flex items-center justify-center gap-4',
                                entrada('delay-300'),
                            )}
                        >
                            <span className="h-px w-12 bg-red-500 md:w-20" />
                            <span className="text-xs font-medium tracking-[0.2em] uppercase md:text-sm">
                                {datos.antetitulo}
                            </span>
                            <span className="h-px w-12 bg-red-500 md:w-20" />
                        </div>
                    )}

                    <h1 className="leading-[1.05] font-bold tracking-tight uppercase">
                        {datos.titulo && (
                            <span
                                className={cn(
                                    'text-4xl md:text-6xl lg:text-7xl',
                                    entrada('delay-500'),
                                )}
                            >
                                {datos.titulo}
                            </span>
                        )}
                        {datos.titulo_destacado && (
                            <span
                                className={cn(
                                    'text-4xl text-red-500 md:text-6xl lg:text-7xl',
                                    entrada('delay-700'),
                                )}
                            >
                                {datos.titulo_destacado}
                            </span>
                        )}
                        {datos.subtitulo && (
                            <span
                                className={cn(
                                    'text-3xl font-light md:text-5xl lg:text-6xl',
                                    entrada('delay-1000'),
                                )}
                            >
                                {datos.subtitulo}
                            </span>
                        )}
                    </h1>

                    {datos.boton_texto && (
                        <div className={cn('mt-10', entrada('delay-1000'))}>
                            <Boton
                                texto={datos.boton_texto}
                                enlace={datos.boton_enlace}
                            />
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export function BloqueHero({ datos, estilos }: PropsBloque<DatosHero>) {
    if (datos.alineacion === 'centro' && datos.imagen) {
        return <HeroConImagen datos={datos} />;
    }

    const sobreOscuro =
        Boolean(datos.imagen) ||
        estilos?.fondo === 'oscuro' ||
        estilos?.fondo === 'marca';
    const centrado = datos.alineacion === 'centro';

    return (
        <EnvoltorioSeccion
            estilos={{ espaciado: 'amplio', ...estilos }}
            className={cn(
                datos.imagen && 'text-white',
                // Centrado ocupa casi toda la pantalla, como la portada de La Cámara.
                centrado && 'flex min-h-[70vh] items-center',
            )}
        >
            {datos.imagen && (
                <>
                    <img
                        src={datos.imagen}
                        alt=""
                        aria-hidden
                        className="absolute inset-0 -z-20 h-full w-full object-cover"
                    />
                    <div
                        aria-hidden
                        className={cn(
                            'absolute inset-0 -z-10',
                            centrado
                                ? 'bg-linear-to-b from-gray-900/70 via-gray-900/55 to-gray-900/80'
                                : 'bg-gradient-to-r from-gray-900/85 via-gray-900/70 to-gray-900/40',
                        )}
                    />
                </>
            )}

            <FadeInUp className={cn(centrado && 'w-full')}>
                <div
                    className={cn(
                        'max-w-3xl',
                        centrado && 'mx-auto max-w-4xl text-center',
                    )}
                >
                    {datos.antetitulo && (
                        <div
                            className={cn(
                                'mb-6 flex items-center gap-4',
                                centrado && 'justify-center',
                            )}
                        >
                            <span className="h-px w-10 bg-red-500 md:w-16" />
                            <span
                                className={cn(
                                    'text-xs font-medium tracking-[0.2em] uppercase md:text-sm',
                                    sobreOscuro
                                        ? 'text-white/90'
                                        : 'text-red-600',
                                )}
                            >
                                {datos.antetitulo}
                            </span>
                            {centrado && (
                                <span className="h-px w-10 bg-red-500 md:w-16" />
                            )}
                        </div>
                    )}
                    {datos.titulo && (
                        <h1
                            className={cn(
                                'text-4xl leading-tight font-bold tracking-tight md:text-5xl lg:text-6xl',
                                centrado && 'uppercase',
                            )}
                        >
                            {datos.titulo}
                        </h1>
                    )}
                    {datos.subtitulo && (
                        <p
                            className={cn(
                                'mt-5 text-lg md:text-xl',
                                centrado && 'mx-auto max-w-2xl',
                                sobreOscuro
                                    ? 'text-white/80'
                                    : tonoSecundario(estilos),
                            )}
                        >
                            {datos.subtitulo}
                        </p>
                    )}
                    {datos.boton_texto && (
                        <div className="mt-8">
                            <Boton
                                texto={datos.boton_texto}
                                enlace={datos.boton_enlace}
                                invertido={estilos?.fondo === 'marca'}
                            />
                        </div>
                    )}
                </div>
            </FadeInUp>
        </EnvoltorioSeccion>
    );
}

// ============================================================
// ENCABEZADO DE PÁGINA
// ============================================================

type DatosEncabezado = { titulo?: string; descripcion?: string };

export function BloqueEncabezado({
    datos,
    estilos,
}: PropsBloque<DatosEncabezado>) {
    return (
        <EnvoltorioSeccion estilos={{ espaciado: 'compacto', ...estilos }}>
            <FadeInUp>
                <span className="mb-3 block h-1 w-12 rounded-full bg-gradient-to-r from-red-600 to-red-400" />
                {datos.titulo && (
                    <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                        {datos.titulo}
                    </h1>
                )}
                {datos.descripcion && (
                    <p
                        className={cn(
                            'mt-3 max-w-2xl',
                            tonoSecundario(estilos),
                        )}
                    >
                        {datos.descripcion}
                    </p>
                )}
            </FadeInUp>
        </EnvoltorioSeccion>
    );
}

// ============================================================
// TEXTO ENRIQUECIDO
// ============================================================

type DatosTexto = { titulo?: string; contenido?: string };

export function BloqueTexto({ datos, estilos }: PropsBloque<DatosTexto>) {
    return (
        <EnvoltorioSeccion estilos={{ ancho: 'estrecho', ...estilos }}>
            <FadeInUp>
                {datos.titulo && (
                    <h2 className="mb-5 text-2xl font-bold tracking-tight md:text-3xl">
                        {datos.titulo}
                    </h2>
                )}
                <HtmlEnriquecido
                    html={datos.contenido ?? ''}
                    className={tonoSecundario(estilos)}
                />
            </FadeInUp>
        </EnvoltorioSeccion>
    );
}

// ============================================================
// TEXTO + IMAGEN
// ============================================================

type DatosTextoImagen = {
    antetitulo?: string;
    titulo?: string;
    contenido?: string;
    imagen?: string;
    posicion_imagen?: 'izquierda' | 'derecha';
    boton_texto?: string;
    boton_enlace?: string;
};

export function BloqueTextoImagen({
    datos,
    estilos,
}: PropsBloque<DatosTextoImagen>) {
    const imagenIzquierda = datos.posicion_imagen === 'izquierda';

    const bloqueImagen = datos.imagen ? (
        <div className={cn(imagenIzquierda ? 'md:order-1' : 'md:order-2')}>
            <img
                src={datos.imagen}
                alt=""
                className="aspect-4/3 w-full rounded-2xl object-cover shadow-[0_10px_50px_rgba(0,0,0,0.1)]"
            />
        </div>
    ) : null;

    const bloqueTexto = (
        <div className={cn(imagenIzquierda ? 'md:order-2' : 'md:order-1')}>
            {datos.antetitulo ? (
                <div className="mb-4 flex items-center gap-3">
                    <span className="h-px w-10 bg-red-600" />
                    <span className="text-sm font-medium tracking-[0.2em] text-red-600 uppercase">
                        {datos.antetitulo}
                    </span>
                </div>
            ) : (
                datos.titulo && (
                    <span className="mb-3 block h-1 w-12 rounded-full bg-gradient-to-r from-red-600 to-red-400" />
                )
            )}
            {datos.titulo && (
                <h2 className="mb-4 text-2xl font-bold tracking-tight md:text-3xl">
                    {datos.titulo}
                </h2>
            )}
            <HtmlEnriquecido
                html={datos.contenido ?? ''}
                className={tonoSecundario(estilos)}
            />
            {datos.boton_texto && (
                <div className="mt-8">
                    <Boton
                        texto={datos.boton_texto}
                        enlace={datos.boton_enlace}
                        invertido={estilos?.fondo === 'marca'}
                    />
                </div>
            )}
        </div>
    );

    const Entrada = imagenIzquierda ? FadeInRight : FadeInLeft;

    return (
        <EnvoltorioSeccion estilos={estilos}>
            <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
                <Entrada>{bloqueTexto}</Entrada>
                {bloqueImagen && (
                    <FadeInUp delay={100}>{bloqueImagen}</FadeInUp>
                )}
            </div>
        </EnvoltorioSeccion>
    );
}

// ============================================================
// LLAMADO A LA ACCIÓN
// ============================================================

type DatosCta = {
    titulo?: string;
    texto?: string;
    boton_texto?: string;
    boton_enlace?: string;
};

export function BloqueCta({ datos, estilos }: PropsBloque<DatosCta>) {
    const fondo = estilos?.fondo ?? 'marca';

    return (
        <EnvoltorioSeccion
            estilos={{ fondo, espaciado: 'compacto', ...estilos }}
        >
            <FadeInUp>
                <div className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
                    <div>
                        {datos.titulo && (
                            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                                {datos.titulo}
                            </h2>
                        )}
                        {datos.texto && (
                            <p
                                className={cn(
                                    'mt-2 max-w-xl',
                                    fondo === 'marca' || fondo === 'oscuro'
                                        ? 'text-white/80'
                                        : 'text-gray-600',
                                )}
                            >
                                {datos.texto}
                            </p>
                        )}
                    </div>
                    <Boton
                        texto={datos.boton_texto}
                        enlace={datos.boton_enlace}
                        invertido={fondo === 'marca' || fondo === 'oscuro'}
                    />
                </div>
            </FadeInUp>
        </EnvoltorioSeccion>
    );
}

// ============================================================
// SEPARADOR
// ============================================================

type DatosSeparador = { altura?: number; con_linea?: boolean };

export function BloqueSeparador({
    datos,
    estilos,
}: PropsBloque<DatosSeparador>) {
    const altura = Math.min(Math.max(Number(datos.altura) || 48, 8), 240);

    return (
        <EnvoltorioSeccion
            estilos={{ ...estilos, espaciado: 'compacto' }}
            className="!py-0"
        >
            <div
                style={{ height: `${altura}px` }}
                className="flex items-center"
            >
                {datos.con_linea && (
                    <span className="h-px w-full bg-gray-200" />
                )}
            </div>
        </EnvoltorioSeccion>
    );
}
