import { ChevronDown, Download, FileText, MapPin, Play } from 'lucide-react';
import { useState } from 'react';
import { FadeInUp } from '@/components/public/reveal';
import { cn } from '@/lib/utils';
import { EnvoltorioSeccion, tonoSecundario } from '../seccion';
import type { PropsBloque } from '../tipos';

/** Cabecera opcional compartida por los bloques de esta familia. */
function Cabecera({
    titulo,
    descripcion,
    estilos,
    centrada = false,
}: {
    titulo?: string;
    descripcion?: string;
    estilos?: PropsBloque['estilos'];
    centrada?: boolean;
}) {
    if (!titulo && !descripcion) {
        return null;
    }

    return (
        <FadeInUp>
            <div
                className={cn(
                    'mb-10 max-w-2xl',
                    centrada && 'mx-auto text-center',
                )}
            >
                <span
                    className={cn(
                        'mb-3 block h-1 w-12 rounded-full bg-gradient-to-r from-red-600 to-red-400',
                        centrada && 'mx-auto',
                    )}
                />
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
        </FadeInUp>
    );
}

/** Los repetidores llegan como array; en el editor pueden venir a medio llenar. */
function lista<T>(valor: unknown): T[] {
    return Array.isArray(valor) ? (valor as T[]) : [];
}

// ============================================================
// GALERÍA
// ============================================================

type Imagen = { imagen?: string; pie?: string };

export function BloqueGaleria({
    datos,
    estilos,
}: PropsBloque<{
    titulo?: string;
    descripcion?: string;
    columnas?: string;
    imagenes?: Imagen[];
}>) {
    const imagenes = lista<Imagen>(datos.imagenes).filter((i) => i.imagen);
    const columnas = Number(datos.columnas) || 3;

    return (
        <EnvoltorioSeccion estilos={estilos}>
            <Cabecera
                titulo={datos.titulo}
                descripcion={datos.descripcion}
                estilos={estilos}
            />

            {imagenes.length === 0 ? (
                <p className="rounded-xl border border-dashed border-gray-200 px-6 py-10 text-center text-sm text-gray-500">
                    Añade imágenes a la galería.
                </p>
            ) : (
                <div
                    className={cn(
                        'grid gap-4',
                        columnas === 2 && 'sm:grid-cols-2',
                        columnas === 3 && 'sm:grid-cols-2 lg:grid-cols-3',
                        columnas === 4 && 'sm:grid-cols-2 lg:grid-cols-4',
                    )}
                >
                    {imagenes.map((imagen, indice) => (
                        <FadeInUp key={indice} delay={indice * 50}>
                            <figure className="group overflow-hidden rounded-xl bg-gray-100">
                                <img
                                    src={imagen.imagen}
                                    alt={imagen.pie ?? ''}
                                    className="aspect-4/3 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                {imagen.pie && (
                                    <figcaption className="bg-white px-3 py-2 text-xs text-gray-600">
                                        {imagen.pie}
                                    </figcaption>
                                )}
                            </figure>
                        </FadeInUp>
                    ))}
                </div>
            )}
        </EnvoltorioSeccion>
    );
}

// ============================================================
// ACORDEÓN / PREGUNTAS FRECUENTES
// ============================================================

type Pregunta = { pregunta?: string; respuesta?: string };

export function BloqueAcordeon({
    datos,
    estilos,
}: PropsBloque<{
    titulo?: string;
    descripcion?: string;
    preguntas?: Pregunta[];
}>) {
    const preguntas = lista<Pregunta>(datos.preguntas).filter(
        (p) => p.pregunta,
    );
    const [abierta, setAbierta] = useState<number | null>(0);

    return (
        <EnvoltorioSeccion estilos={{ ancho: 'estrecho', ...estilos }}>
            <Cabecera
                titulo={datos.titulo}
                descripcion={datos.descripcion}
                estilos={estilos}
            />

            {preguntas.length === 0 ? (
                <p className="rounded-xl border border-dashed border-gray-200 px-6 py-10 text-center text-sm text-gray-500">
                    Añade preguntas y respuestas.
                </p>
            ) : (
                <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-100 bg-white">
                    {preguntas.map((pregunta, indice) => {
                        const activa = abierta === indice;

                        return (
                            <div key={indice}>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setAbierta(activa ? null : indice)
                                    }
                                    aria-expanded={activa}
                                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-gray-50"
                                >
                                    <span className="font-medium text-gray-900">
                                        {pregunta.pregunta}
                                    </span>
                                    <ChevronDown
                                        className={cn(
                                            'h-4 w-4 shrink-0 text-gray-400 transition-transform duration-300',
                                            activa && 'rotate-180 text-red-600',
                                        )}
                                    />
                                </button>
                                {activa && pregunta.respuesta && (
                                    <p className="px-5 pb-4 text-sm leading-relaxed text-gray-600">
                                        {pregunta.respuesta}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </EnvoltorioSeccion>
    );
}

// ============================================================
// CIFRAS DESTACADAS
// ============================================================

type Cifra = { valor?: string; etiqueta?: string };

export function BloqueCifras({
    datos,
    estilos,
}: PropsBloque<{ titulo?: string; descripcion?: string; cifras?: Cifra[] }>) {
    const cifras = lista<Cifra>(datos.cifras).filter((c) => c.valor);
    const sobreOscuro =
        estilos?.fondo === 'oscuro' || estilos?.fondo === 'marca';

    return (
        <EnvoltorioSeccion estilos={estilos}>
            <Cabecera
                titulo={datos.titulo}
                descripcion={datos.descripcion}
                estilos={estilos}
                centrada
            />

            {cifras.length > 0 && (
                <dl
                    className={cn(
                        'grid gap-8 text-center',
                        cifras.length === 2 && 'sm:grid-cols-2',
                        cifras.length === 3 && 'sm:grid-cols-3',
                        cifras.length >= 4 && 'sm:grid-cols-2 lg:grid-cols-4',
                    )}
                >
                    {cifras.map((cifra, indice) => (
                        <FadeInUp key={indice} delay={indice * 80}>
                            <div>
                                <dt
                                    className={cn(
                                        'text-4xl font-bold tracking-tight tabular-nums md:text-5xl',
                                        sobreOscuro
                                            ? 'text-white'
                                            : 'text-red-600',
                                    )}
                                >
                                    {cifra.valor}
                                </dt>
                                <dd
                                    className={cn(
                                        'mt-2 text-sm',
                                        sobreOscuro
                                            ? 'text-white/75'
                                            : 'text-gray-600',
                                    )}
                                >
                                    {cifra.etiqueta}
                                </dd>
                            </div>
                        </FadeInUp>
                    ))}
                </dl>
            )}
        </EnvoltorioSeccion>
    );
}

// ============================================================
// LÍNEA DE TIEMPO
// ============================================================

type Hito = { fecha?: string; titulo?: string; texto?: string };

export function BloqueTimeline({
    datos,
    estilos,
}: PropsBloque<{ titulo?: string; descripcion?: string; hitos?: Hito[] }>) {
    const hitos = lista<Hito>(datos.hitos).filter((h) => h.titulo || h.fecha);

    return (
        <EnvoltorioSeccion estilos={{ ancho: 'estrecho', ...estilos }}>
            <Cabecera
                titulo={datos.titulo}
                descripcion={datos.descripcion}
                estilos={estilos}
            />

            {hitos.length > 0 && (
                <ol className="relative space-y-8 border-l-2 border-red-100 pl-6">
                    {hitos.map((hito, indice) => (
                        <FadeInUp key={indice} delay={indice * 60}>
                            <li className="relative">
                                <span className="absolute top-1.5 -left-[1.9rem] size-3 rounded-full border-2 border-white bg-red-600" />
                                {hito.fecha && (
                                    <p className="text-xs font-semibold tracking-wide text-red-600 uppercase">
                                        {hito.fecha}
                                    </p>
                                )}
                                {hito.titulo && (
                                    <h3 className="mt-0.5 font-semibold text-gray-900">
                                        {hito.titulo}
                                    </h3>
                                )}
                                {hito.texto && (
                                    <p className="mt-1 text-sm leading-relaxed text-gray-600">
                                        {hito.texto}
                                    </p>
                                )}
                            </li>
                        </FadeInUp>
                    ))}
                </ol>
            )}
        </EnvoltorioSeccion>
    );
}

// ============================================================
// VÍDEO
// ============================================================

/**
 * Admite pegar la URL normal de YouTube o Vimeo y la convierte a la de
 * incrustar: nadie debería tener que buscar el «código embed».
 */
export function urlIncrustada(url: string): string | null {
    const limpio = url.trim();

    if (limpio === '') {
        return null;
    }

    const youtube = limpio.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/,
    );

    if (youtube) {
        return `https://www.youtube.com/embed/${youtube[1]}`;
    }

    const vimeo = limpio.match(/vimeo\.com\/(?:video\/)?(\d+)/);

    if (vimeo) {
        return `https://player.vimeo.com/video/${vimeo[1]}`;
    }

    return limpio.startsWith('https://') ? limpio : null;
}

export function BloqueVideo({
    datos,
    estilos,
}: PropsBloque<{ titulo?: string; descripcion?: string; url?: string }>) {
    const incrustado = urlIncrustada(String(datos.url ?? ''));

    return (
        <EnvoltorioSeccion estilos={{ ancho: 'estrecho', ...estilos }}>
            <Cabecera
                titulo={datos.titulo}
                descripcion={datos.descripcion}
                estilos={estilos}
                centrada
            />

            <FadeInUp>
                {incrustado ? (
                    <div className="aspect-video overflow-hidden rounded-2xl bg-black shadow-[0_10px_50px_rgba(0,0,0,0.15)]">
                        <iframe
                            src={incrustado}
                            title={datos.titulo || 'Vídeo'}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="h-full w-full"
                        />
                    </div>
                ) : (
                    <div className="flex aspect-video items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-200 text-sm text-gray-500">
                        <Play className="h-4 w-4" />
                        Pega la dirección de un vídeo de YouTube o Vimeo.
                    </div>
                )}
            </FadeInUp>
        </EnvoltorioSeccion>
    );
}

// ============================================================
// DESCARGAS
// ============================================================

type Archivo = { nombre?: string; descripcion?: string; url?: string };

export function BloqueDescargas({
    datos,
    estilos,
}: PropsBloque<{
    titulo?: string;
    descripcion?: string;
    archivos?: Archivo[];
}>) {
    const archivos = lista<Archivo>(datos.archivos).filter((a) => a.nombre);

    return (
        <EnvoltorioSeccion estilos={{ ancho: 'estrecho', ...estilos }}>
            <Cabecera
                titulo={datos.titulo}
                descripcion={datos.descripcion}
                estilos={estilos}
            />

            {archivos.length === 0 ? (
                <p className="rounded-xl border border-dashed border-gray-200 px-6 py-10 text-center text-sm text-gray-500">
                    Añade los documentos descargables.
                </p>
            ) : (
                <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-100 bg-white">
                    {archivos.map((archivo, indice) => (
                        <li key={indice}>
                            <a
                                href={archivo.url || '#'}
                                target="_blank"
                                rel="noreferrer"
                                className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-gray-50"
                            >
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                                    <FileText className="h-4 w-4" />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate font-medium text-gray-900 group-hover:text-red-600">
                                        {archivo.nombre}
                                    </span>
                                    {archivo.descripcion && (
                                        <span className="block truncate text-xs text-gray-500">
                                            {archivo.descripcion}
                                        </span>
                                    )}
                                </span>
                                <Download className="h-4 w-4 shrink-0 text-gray-400 group-hover:text-red-600" />
                            </a>
                        </li>
                    ))}
                </ul>
            )}
        </EnvoltorioSeccion>
    );
}

// ============================================================
// MAPA Y CONTACTO
// ============================================================

export function BloqueMapa({
    datos,
    estilos,
}: PropsBloque<{
    titulo?: string;
    descripcion?: string;
    direccion?: string;
    telefono?: string;
    correo?: string;
    mapa_url?: string;
}>) {
    const mapa = String(datos.mapa_url ?? '').trim();

    return (
        <EnvoltorioSeccion estilos={estilos}>
            <div className="grid items-center gap-10 md:grid-cols-2">
                <FadeInUp>
                    <div>
                        <span className="mb-3 block h-1 w-12 rounded-full bg-gradient-to-r from-red-600 to-red-400" />
                        {datos.titulo && (
                            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                                {datos.titulo}
                            </h2>
                        )}
                        {datos.descripcion && (
                            <p className={cn('mt-3', tonoSecundario(estilos))}>
                                {datos.descripcion}
                            </p>
                        )}

                        <dl className="mt-6 space-y-3 text-sm">
                            {datos.direccion && (
                                <div className="flex items-start gap-3">
                                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                                    <dd className={tonoSecundario(estilos)}>
                                        {datos.direccion}
                                    </dd>
                                </div>
                            )}
                            {datos.telefono && (
                                <div className="flex items-start gap-3">
                                    <span className="mt-0.5 w-4 shrink-0 text-center text-red-600">
                                        ☎
                                    </span>
                                    <dd>
                                        <a
                                            href={`tel:${datos.telefono}`}
                                            className="hover:text-red-600"
                                        >
                                            {datos.telefono}
                                        </a>
                                    </dd>
                                </div>
                            )}
                            {datos.correo && (
                                <div className="flex items-start gap-3">
                                    <span className="mt-0.5 w-4 shrink-0 text-center text-red-600">
                                        ✉
                                    </span>
                                    <dd>
                                        <a
                                            href={`mailto:${datos.correo}`}
                                            className="hover:text-red-600"
                                        >
                                            {datos.correo}
                                        </a>
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </div>
                </FadeInUp>

                <FadeInUp delay={100}>
                    {mapa.startsWith('https://') ? (
                        <div className="aspect-4/3 overflow-hidden rounded-2xl bg-gray-100 shadow-[0_10px_50px_rgba(0,0,0,0.1)]">
                            <iframe
                                src={mapa}
                                title={`Mapa de ${datos.titulo ?? 'la oficina'}`}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="h-full w-full border-0"
                            />
                        </div>
                    ) : (
                        <div className="flex aspect-4/3 items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-200 text-sm text-gray-500">
                            <MapPin className="h-4 w-4" />
                            Pega la dirección de incrustar de Google Maps.
                        </div>
                    )}
                </FadeInUp>
            </div>
        </EnvoltorioSeccion>
    );
}
