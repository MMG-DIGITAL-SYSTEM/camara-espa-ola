import {
    Award,
    Briefcase,
    Building2,
    Calendar,
    CalendarDays,
    Clock,
    Database,
    FileDown,
    Filter,
    Globe,
    Globe2,
    ArrowRight,
    Handshake,
    Image as ImageIcon,
    MapPin,
    Newspaper,
    Search,
    Shield,
    Sparkles,
    Ticket,
    TrendingUp,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { createElement } from 'react';
import { ImagenSinRecorte } from '@/components/public/imagen-sin-recorte';
import { FadeInLeft, FadeInRight, FadeInUp } from '@/components/public/reveal';
import { cn } from '@/lib/utils';
import { EnvoltorioSeccion, tonoSecundario } from '../seccion';
import type { PropsBloque } from '../tipos';

/**
 * Los iconos se guardan por nombre para que el editor pueda elegirlos sin
 * saber nada de React. Mismo mapa que ya usaba la vista de Servicios.
 */
const ICONOS: Record<string, LucideIcon> = {
    calendar: Calendar,
    'calendar-days': CalendarDays,
    database: Database,
    newspaper: Newspaper,
    image: ImageIcon,
    briefcase: Briefcase,
    ticket: Ticket,
    handshake: Handshake,
    award: Award,
    users: Users,
    building: Building2,
    shield: Shield,
    search: Search,
    filter: Filter,
    clock: Clock,
    'trending-up': TrendingUp,
    globe: Globe,
    'map-pin': MapPin,
    sparkles: Sparkles,
};

export function iconoPorNombre(nombre?: string | null): LucideIcon {
    return ICONOS[(nombre ?? '').toLowerCase().trim()] ?? Sparkles;
}

/**
 * Icono de un servicio a partir de su nombre guardado.
 *
 * Va envuelto en un componente en lugar de resolverse a una variable con
 * mayúscula durante el render, que React lee como crear un componente nuevo
 * en cada pasada.
 */
export function IconoPorNombre({
    nombre,
    className,
    style,
}: {
    nombre?: string | null;
    className?: string;
    style?: React.CSSProperties;
}) {
    return createElement(iconoPorNombre(nombre), { className, style });
}

/**
 * Título de sección con un enlace opcional a la página completa del módulo
 * («Ver todas»), alineado a la derecha en escritorio y debajo en móvil.
 */
function CabeceraDeBloque({
    titulo,
    descripcion,
    estilos,
    enlace,
    enlaceTexto,
}: {
    titulo?: string;
    descripcion?: string;
    estilos?: PropsBloque['estilos'];
    enlace?: string;
    enlaceTexto?: string;
}) {
    const conEnlace = Boolean(enlace?.trim() && enlaceTexto?.trim());

    if (!titulo && !descripcion && !conEnlace) {
        return null;
    }

    return (
        <FadeInUp>
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="max-w-2xl">
                    <span className="mb-3 block h-1 w-12 rounded-full bg-gradient-to-r from-red-600 to-red-400" />
                    {titulo && (
                        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                            {titulo}
                        </h2>
                    )}
                    {descripcion && (
                        <p className={cn('mt-3', tonoSecundario(estilos))}>
                            {descripcion}
                        </p>
                    )}
                </div>
                {conEnlace && (
                    <a
                        href={enlace}
                        className="group inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border border-red-200 px-5 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-600 hover:text-white md:self-auto"
                    >
                        {enlaceTexto}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </a>
                )}
            </div>
        </FadeInUp>
    );
}

/**
 * Un bloque dinámico sin registros no debe dejar un hueco mudo en la página.
 */
function SinContenido({ mensaje }: { mensaje: string }) {
    return (
        <p className="rounded-xl border border-dashed border-gray-200 px-6 py-10 text-center text-sm text-gray-500">
            {mensaje}
        </p>
    );
}

const COLUMNAS: Record<number, string> = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
};

function clasesDeRejilla(columnas?: number): string {
    return COLUMNAS[Number(columnas) || 3] ?? COLUMNAS[3];
}

// ============================================================
// PRESENTACIÓN INSTITUCIONAL
// ============================================================

type Presentacion = {
    titulo: string;
    contenido: string;
    imagen: string | null;
};

/**
 * El texto sale de `contenido_institucional` (lo mismo que se ve en La
 * Cámara): aquí solo se decide el título y qué sección enseñar.
 */
export function BloquePresentacion({
    datos,
    estilos,
    contenido,
}: PropsBloque<{
    antetitulo?: string;
    titulo?: string;
    seccion?: string;
    boton_texto?: string;
    boton_enlace?: string;
}>) {
    const presentacion = (contenido ?? null) as Presentacion | null;
    const titulo = datos.titulo?.trim() || presentacion?.titulo;

    if (!titulo && !presentacion) {
        return null;
    }

    return (
        <EnvoltorioSeccion estilos={estilos}>
            <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
                <FadeInLeft className="lg:col-span-5">
                    <div className="relative">
                        {datos.antetitulo && (
                            <div className="mb-4 flex items-center gap-3">
                                <span className="h-px w-10 bg-red-600" />
                                <span className="text-sm font-medium tracking-[0.2em] text-red-600 uppercase">
                                    {datos.antetitulo}
                                </span>
                            </div>
                        )}
                        {titulo && (
                            <h2 className="text-3xl leading-tight font-bold tracking-tight md:text-4xl">
                                {titulo}
                            </h2>
                        )}
                        <span className="mt-6 block h-1 w-20 rounded-full bg-linear-to-r from-red-600 to-red-400" />
                    </div>
                </FadeInLeft>

                <FadeInRight className="lg:col-span-7">
                    <div className="relative border-l-4 border-red-600 pl-6 md:pl-8">
                        {presentacion?.imagen && (
                            <img
                                src={presentacion.imagen}
                                alt=""
                                className="mb-6 aspect-video w-full rounded-2xl object-cover"
                            />
                        )}
                        {presentacion?.contenido && (
                            <p
                                className={cn(
                                    'text-base leading-relaxed whitespace-pre-line md:text-lg',
                                    tonoSecundario(estilos),
                                )}
                            >
                                {presentacion.contenido}
                            </p>
                        )}
                        {datos.boton_texto?.trim() &&
                            datos.boton_enlace?.trim() && (
                                <a
                                    href={datos.boton_enlace}
                                    className="group mt-8 inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition-all duration-300 hover:bg-red-700 hover:shadow-xl"
                                >
                                    {datos.boton_texto}
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </a>
                            )}
                    </div>
                </FadeInRight>
            </div>
        </EnvoltorioSeccion>
    );
}
// ============================================================
// SERVICIOS
// ============================================================

type Servicio = {
    id: number;
    titulo: string;
    contenido: string;
    icono: string | null;
    imagen: string | null;
};

export function BloqueServicios({
    datos,
    estilos,
    contenido,
}: PropsBloque<{
    titulo?: string;
    descripcion?: string;
    columnas?: number;
    enlace_texto?: string;
    enlace?: string;
}>) {
    const servicios = (contenido ?? []) as Servicio[];

    return (
        <EnvoltorioSeccion estilos={estilos}>
            <CabeceraDeBloque
                titulo={datos.titulo}
                descripcion={datos.descripcion}
                estilos={estilos}
                enlace={datos.enlace}
                enlaceTexto={datos.enlace_texto}
            />

            {servicios.length === 0 ? (
                <SinContenido mensaje="Todavía no hay servicios publicados." />
            ) : (
                <div
                    className={cn(
                        'grid gap-6',
                        clasesDeRejilla(datos.columnas),
                    )}
                >
                    {servicios.map((servicio, indice) => {
                        return (
                            <FadeInUp key={servicio.id} delay={indice * 60}>
                                <article className="group h-full rounded-2xl border border-gray-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-red-100 hover:shadow-[0_10px_40px_rgba(0,0,0,0.07)]">
                                    <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600 transition-colors duration-300 group-hover:bg-red-600 group-hover:text-white">
                                        <IconoPorNombre
                                            nombre={servicio.icono}
                                            className="h-5 w-5"
                                        />
                                    </span>
                                    <h3 className="mb-2 font-semibold text-gray-900">
                                        {servicio.titulo}
                                    </h3>
                                    <p className="line-clamp-4 text-sm leading-relaxed text-gray-600">
                                        {servicio.contenido}
                                    </p>
                                </article>
                            </FadeInUp>
                        );
                    })}
                </div>
            )}
        </EnvoltorioSeccion>
    );
}

// ============================================================
// NOTICIAS Y ACTIVIDADES (misma tarjeta, distinta fuente)
// ============================================================

type Publicacion = {
    id: number;
    titulo: string;
    extracto?: string | null;
    imagen: string | null;
    fecha: string | null;
    categorias?: string[];
    url: string;
};

function RejillaDePublicaciones({
    publicaciones,
    columnas,
    iconoVacio: IconoVacio,
    mensajeVacio,
}: {
    publicaciones: Publicacion[];
    columnas?: number;
    iconoVacio: LucideIcon;
    mensajeVacio: string;
}) {
    if (publicaciones.length === 0) {
        return <SinContenido mensaje={mensajeVacio} />;
    }

    return (
        <div className={cn('grid gap-6', clasesDeRejilla(columnas))}>
            {publicaciones.map((publicacion, indice) => (
                <FadeInUp key={publicacion.id} delay={indice * 60}>
                    <a
                        href={publicacion.url}
                        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(0,0,0,0.07)]"
                    >
                        <div className="relative aspect-16/9 overflow-hidden bg-gray-100">
                            {publicacion.imagen ? (
                                <ImagenSinRecorte
                                    src={publicacion.imagen}
                                    alt=""
                                    className="transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <span className="flex h-full items-center justify-center text-gray-300">
                                    <IconoVacio className="h-8 w-8" />
                                </span>
                            )}
                        </div>
                        <div className="flex flex-1 flex-col p-5">
                            {publicacion.categorias &&
                                publicacion.categorias.length > 0 && (
                                    <div className="mb-3 flex flex-wrap gap-1.5">
                                        {publicacion.categorias.map(
                                            (categoria) => (
                                                <span
                                                    key={categoria}
                                                    className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700"
                                                >
                                                    {categoria}
                                                </span>
                                            ),
                                        )}
                                    </div>
                                )}
                            {publicacion.fecha && (
                                <time className="mb-2 text-xs font-medium tracking-wide text-red-600 uppercase">
                                    {publicacion.fecha}
                                </time>
                            )}
                            <h3 className="mb-2 line-clamp-2 font-semibold text-gray-900 transition-colors duration-300 group-hover:text-red-600">
                                {publicacion.titulo}
                            </h3>
                            {publicacion.extracto && (
                                <p className="line-clamp-3 text-sm leading-relaxed text-gray-600">
                                    {publicacion.extracto}
                                </p>
                            )}
                        </div>
                    </a>
                </FadeInUp>
            ))}
        </div>
    );
}

export function BloqueNoticiasRecientes({
    datos,
    estilos,
    contenido,
}: PropsBloque<{
    titulo?: string;
    descripcion?: string;
    columnas?: number;
    limite?: number;
    solo_destacadas?: boolean;
}>) {
    return (
        <EnvoltorioSeccion estilos={estilos}>
            <CabeceraDeBloque
                titulo={datos.titulo}
                descripcion={datos.descripcion}
                estilos={estilos}
            />
            <RejillaDePublicaciones
                publicaciones={(contenido ?? []) as Publicacion[]}
                columnas={datos.columnas}
                iconoVacio={Newspaper}
                mensajeVacio="Todavía no hay noticias publicadas."
            />
        </EnvoltorioSeccion>
    );
}

export function BloqueActividadesProximas({
    datos,
    estilos,
    contenido,
}: PropsBloque<{
    titulo?: string;
    descripcion?: string;
    columnas?: number;
    limite?: number;
    solo_proximas?: boolean;
    enlace_texto?: string;
    enlace?: string;
}>) {
    return (
        <EnvoltorioSeccion estilos={estilos}>
            <CabeceraDeBloque
                titulo={datos.titulo}
                descripcion={datos.descripcion}
                estilos={estilos}
                enlace={datos.enlace}
                enlaceTexto={datos.enlace_texto}
            />
            <RejillaDePublicaciones
                publicaciones={(contenido ?? []) as Publicacion[]}
                columnas={datos.columnas}
                iconoVacio={CalendarDays}
                mensajeVacio="No hay actividades en agenda por ahora."
            />
        </EnvoltorioSeccion>
    );
}

// ============================================================
// DIRECTORIO
// ============================================================

type Directivo = {
    id: number;
    nombre: string;
    cargo: string | null;
    empresa: string | null;
    imagen: string | null;
};

export function BloqueDirectorio({
    datos,
    estilos,
    contenido,
}: PropsBloque<{
    titulo?: string;
    descripcion?: string;
    columnas?: number;
    limite?: number;
}>) {
    const directivos = (contenido ?? []) as Directivo[];

    return (
        <EnvoltorioSeccion estilos={estilos}>
            <CabeceraDeBloque
                titulo={datos.titulo}
                descripcion={datos.descripcion}
                estilos={estilos}
            />

            {directivos.length === 0 ? (
                <SinContenido mensaje="El directorio todavía está vacío." />
            ) : (
                <div
                    className={cn(
                        'grid gap-6',
                        clasesDeRejilla(datos.columnas ?? 4),
                    )}
                >
                    {directivos.map((directivo, indice) => (
                        <FadeInUp key={directivo.id} delay={indice * 50}>
                            <article className="group text-center">
                                <div className="mx-auto mb-4 aspect-square w-full max-w-[200px] overflow-hidden rounded-2xl bg-gray-100">
                                    {directivo.imagen ? (
                                        <img
                                            src={directivo.imagen}
                                            alt={directivo.nombre}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <span className="flex h-full items-center justify-center text-gray-300">
                                            <Users className="h-8 w-8" />
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-semibold text-gray-900">
                                    {directivo.nombre}
                                </h3>
                                {directivo.cargo && (
                                    <p className="text-sm font-medium text-red-600">
                                        {directivo.cargo}
                                    </p>
                                )}
                                {directivo.empresa && (
                                    <p className="mt-0.5 text-xs text-gray-500">
                                        {directivo.empresa}
                                    </p>
                                )}
                            </article>
                        </FadeInUp>
                    ))}
                </div>
            )}
        </EnvoltorioSeccion>
    );
}

// ============================================================
// CARRUSEL DE SOCIOS
// ============================================================

type SocioLogo = {
    id: number;
    nombre: string;
    logo: string | null;
    url: string;
};

export function BloqueSocios({
    datos,
    estilos,
    contenido,
}: PropsBloque<{
    titulo?: string;
    descripcion?: string;
    limite?: number;
    solo_destacados?: boolean;
    boton_texto?: string;
    boton_enlace?: string;
}>) {
    const socios = (contenido ?? []) as SocioLogo[];
    const boton = datos.boton_texto?.trim() && datos.boton_enlace?.trim();

    return (
        <EnvoltorioSeccion estilos={estilos}>
            <CabeceraDeBloque
                titulo={datos.titulo}
                descripcion={datos.descripcion}
                estilos={estilos}
            />

            {socios.length === 0 ? (
                <SinContenido mensaje="Todavía no hay socios con logotipo." />
            ) : (
                <ul className="grid grid-cols-2 items-center gap-6 sm:grid-cols-3 lg:grid-cols-5">
                    {socios.map((socio, indice) => (
                        <FadeInUp key={socio.id} delay={indice * 40}>
                            <li>
                                <a
                                    href={socio.url}
                                    title={socio.nombre}
                                    className="flex h-20 items-center justify-center rounded-xl border border-gray-100 bg-white px-4 transition-all duration-300 hover:border-red-100 hover:shadow-sm"
                                >
                                    {socio.logo ? (
                                        <img
                                            src={socio.logo}
                                            alt={socio.nombre}
                                            /* En gris hasta el hover: evita que
                                               veinte logos de colores compitan
                                               con el resto de la página. */
                                            className="max-h-12 w-auto opacity-70 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
                                        />
                                    ) : (
                                        <span className="text-center text-xs font-medium text-gray-500">
                                            {socio.nombre}
                                        </span>
                                    )}
                                </a>
                            </li>
                        </FadeInUp>
                    ))}
                </ul>
            )}

            {boton && (
                <FadeInUp>
                    <div className="mt-10 text-center">
                        <a
                            href={datos.boton_enlace}
                            className="group inline-flex items-center gap-2 rounded-full bg-red-600 px-8 py-3 font-semibold tracking-wide text-white uppercase shadow-lg shadow-red-600/20 transition-all duration-300 hover:bg-red-700 hover:shadow-xl"
                        >
                            {datos.boton_texto}
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </a>
                    </div>
                </FadeInUp>
            )}
        </EnvoltorioSeccion>
    );
}

// ============================================================
// FICHAS PAÍS
// ============================================================

type Ficha = {
    id: number;
    pais: string;
    titulo: string | null;
    descripcion: string | null;
    pdf: string | null;
};

export function BloqueFichasPais({
    datos,
    estilos,
    contenido,
}: PropsBloque<{ titulo?: string; descripcion?: string; limite?: number }>) {
    const fichas = (contenido ?? []) as Ficha[];

    return (
        <EnvoltorioSeccion estilos={estilos}>
            <CabeceraDeBloque
                titulo={datos.titulo}
                descripcion={datos.descripcion}
                estilos={estilos}
            />

            {fichas.length === 0 ? (
                <SinContenido mensaje="Todavía no hay fichas país publicadas." />
            ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                    {fichas.map((ficha, indice) => (
                        <FadeInUp key={ficha.id} delay={indice * 60}>
                            <article className="group flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(0,0,0,0.07)]">
                                <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                                    <Globe2 className="h-5 w-5" />
                                </span>
                                <h3 className="font-semibold text-gray-900">
                                    {ficha.titulo || ficha.pais}
                                </h3>
                                {ficha.descripcion && (
                                    <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-gray-600">
                                        {ficha.descripcion}
                                    </p>
                                )}
                                {ficha.pdf && (
                                    <a
                                        href={ficha.pdf}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
                                    >
                                        <FileDown className="h-4 w-4" />
                                        Descargar ficha
                                    </a>
                                )}
                            </article>
                        </FadeInUp>
                    ))}
                </div>
            )}
        </EnvoltorioSeccion>
    );
}

// ============================================================
// RED DE CÁMARAS
// ============================================================

type Camara = {
    id: number;
    nombre: string;
    pais: string | null;
    ciudad: string | null;
    logo: string | null;
    web: string | null;
};

export function BloqueRedCamaras({
    datos,
    estilos,
    contenido,
}: PropsBloque<{
    titulo?: string;
    descripcion?: string;
    columnas?: number;
    limite?: number;
}>) {
    const camaras = (contenido ?? []) as Camara[];

    return (
        <EnvoltorioSeccion estilos={estilos}>
            <CabeceraDeBloque
                titulo={datos.titulo}
                descripcion={datos.descripcion}
                estilos={estilos}
            />

            {camaras.length === 0 ? (
                <SinContenido mensaje="Todavía no hay cámaras en la red." />
            ) : (
                <div
                    className={cn(
                        'grid gap-5',
                        clasesDeRejilla(datos.columnas),
                    )}
                >
                    {camaras.map((camara, indice) => (
                        <FadeInUp key={camara.id} delay={indice * 50}>
                            <a
                                href={camara.web ?? undefined}
                                target={camara.web ? '_blank' : undefined}
                                rel={camara.web ? 'noreferrer' : undefined}
                                className="group flex h-full items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 transition-all duration-300 hover:border-red-100 hover:shadow-[0_10px_40px_rgba(0,0,0,0.07)]"
                            >
                                <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-50">
                                    {camara.logo ? (
                                        <img
                                            src={camara.logo}
                                            alt=""
                                            className="max-h-9 w-auto"
                                        />
                                    ) : (
                                        <Building2 className="h-5 w-5 text-gray-300" />
                                    )}
                                </span>
                                <span className="min-w-0">
                                    <span className="block truncate font-medium text-gray-900 group-hover:text-red-600">
                                        {camara.nombre}
                                    </span>
                                    {(camara.ciudad || camara.pais) && (
                                        <span className="block truncate text-xs text-gray-500">
                                            {[camara.ciudad, camara.pais]
                                                .filter(Boolean)
                                                .join(', ')}
                                        </span>
                                    )}
                                </span>
                            </a>
                        </FadeInUp>
                    ))}
                </div>
            )}
        </EnvoltorioSeccion>
    );
}
