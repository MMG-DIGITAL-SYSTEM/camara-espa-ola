import { ArrowRight, Check, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PropsElemento } from '../tipos';
import { urlIncrustada } from './contenido';
import { IconoPorNombre } from './dinamicos';
import { HtmlEnriquecido } from './estructura';

/**
 * Piezas sueltas del lienzo.
 *
 * Son los mismos recursos visuales que el resto del sitio —rojo de marca,
 * `rounded-xl`, sombras suaves— pero en trozos pequeños, para que el editor
 * componga una sección a su gusto en lugar de elegir una franja ya montada.
 *
 * Cada componente recibe además los `estilos` de la sección que lo contiene:
 * lo único que necesita saber es si está sobre fondo oscuro.
 */

function esOscuro(estilos?: PropsElemento['estilos']): boolean {
    return estilos?.fondo === 'oscuro' || estilos?.fondo === 'marca';
}

const ALINEACIONES: Record<string, string> = {
    izquierda: 'text-left',
    centro: 'text-center',
    derecha: 'text-right',
};

function alinear(valor?: unknown): string {
    return ALINEACIONES[String(valor ?? 'izquierda')] ?? 'text-left';
}

// ============================================================
// TÍTULO
// ============================================================

const NIVELES = {
    h2: 'text-3xl md:text-4xl',
    h3: 'text-2xl md:text-3xl',
    h4: 'text-xl md:text-2xl',
} as const;

type NivelTitulo = keyof typeof NIVELES;

export function ElementoTitulo({
    datos,
    estilos,
}: PropsElemento<{ texto?: string; nivel?: string; alineacion?: string }>) {
    const nivel: NivelTitulo =
        datos.nivel === 'h3' || datos.nivel === 'h4'
            ? (datos.nivel as NivelTitulo)
            : 'h2';

    // La etiqueta se elige por nombre para no crear un componente nuevo en
    // cada render, que es lo que ocurre al guardarla en una variable.
    const contenido = (
        <>
            {datos.texto}
            {!datos.texto && (
                <span className="text-gray-400">Escribe un título</span>
            )}
        </>
    );

    const clases = cn(
        'font-bold tracking-tight',
        NIVELES[nivel],
        alinear(datos.alineacion),
        esOscuro(estilos) ? 'text-white' : 'text-gray-900',
    );

    if (nivel === 'h3') {
        return <h3 className={clases}>{contenido}</h3>;
    }

    if (nivel === 'h4') {
        return <h4 className={clases}>{contenido}</h4>;
    }

    return <h2 className={clases}>{contenido}</h2>;
}

// ============================================================
// PÁRRAFO
// ============================================================

export function ElementoParrafo({
    datos,
    estilos,
}: PropsElemento<{ contenido?: string; alineacion?: string }>) {
    const html = String(datos.contenido ?? '');

    if (html.trim() === '') {
        return (
            <p className="text-sm text-gray-400 italic">
                Este párrafo todavía está vacío.
            </p>
        );
    }

    return (
        <HtmlEnriquecido
            html={html}
            className={cn(
                alinear(datos.alineacion),
                esOscuro(estilos) ? 'text-white/85' : 'text-gray-600',
            )}
        />
    );
}

// ============================================================
// IMAGEN
// ============================================================

const PROPORCIONES: Record<string, string> = {
    original: '',
    panoramica: 'aspect-video object-cover',
    clasica: 'aspect-4/3 object-cover',
    cuadrada: 'aspect-square object-cover',
};

export function ElementoImagen({
    datos,
}: PropsElemento<{
    imagen?: string;
    alt?: string;
    proporcion?: string;
    redondeada?: boolean;
}>) {
    if (!datos.imagen) {
        return (
            <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-400">
                Elige una imagen
            </div>
        );
    }

    return (
        <img
            src={datos.imagen}
            alt={datos.alt ?? ''}
            className={cn(
                'w-full',
                PROPORCIONES[String(datos.proporcion ?? 'original')] ?? '',
                datos.redondeada !== false && 'rounded-xl',
                'shadow-sm',
            )}
        />
    );
}

// ============================================================
// BOTÓN
// ============================================================

export function ElementoBoton({
    datos,
    estilos,
}: PropsElemento<{
    texto?: string;
    enlace?: string;
    estilo?: string;
    alineacion?: string;
}>) {
    if (!datos.texto) {
        return null;
    }

    const variante = String(datos.estilo ?? 'solido');
    const oscuro = esOscuro(estilos);

    const clases = {
        solido: oscuro
            ? 'bg-white text-red-700 hover:bg-white/90'
            : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/20',
        contorno: oscuro
            ? 'border border-white/40 text-white hover:bg-white/10'
            : 'border border-gray-300 text-gray-900 hover:border-red-600 hover:text-red-600',
        enlace: oscuro
            ? 'px-0 text-white underline underline-offset-4'
            : 'px-0 text-red-600 underline underline-offset-4',
    }[variante];

    return (
        <div className={alinear(datos.alineacion)}>
            <a
                href={datos.enlace || '#'}
                className={cn(
                    'group inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition-all duration-300',
                    clases,
                )}
            >
                {datos.texto}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
        </div>
    );
}

// ============================================================
// TARJETA
// ============================================================

export function ElementoTarjeta({
    datos,
}: PropsElemento<{
    icono?: string;
    titulo?: string;
    texto?: string;
    enlace_texto?: string;
    enlace?: string;
}>) {
    return (
        <div className="group flex h-full flex-col rounded-xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-red-200 hover:shadow-lg hover:shadow-gray-200/60">
            {datos.icono && (
                <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-red-50 text-red-600 transition-colors group-hover:bg-red-600 group-hover:text-white">
                    <IconoPorNombre nombre={datos.icono} className="size-5" />
                </span>
            )}

            <h3 className="text-lg font-semibold text-gray-900">
                {datos.titulo || 'Título de la tarjeta'}
            </h3>

            {datos.texto && (
                <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600">
                    {datos.texto}
                </p>
            )}

            {datos.enlace_texto && (
                <a
                    href={datos.enlace || '#'}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-red-600"
                >
                    {datos.enlace_texto}
                    <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
            )}
        </div>
    );
}

// ============================================================
// CARACTERÍSTICA (icono a la izquierda)
// ============================================================

export function ElementoCaracteristica({
    datos,
    estilos,
}: PropsElemento<{ icono?: string; titulo?: string; texto?: string }>) {
    const oscuro = esOscuro(estilos);

    return (
        <div className="flex gap-4">
            <span
                className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-xl',
                    oscuro
                        ? 'bg-white/10 text-white'
                        : 'bg-red-50 text-red-600',
                )}
            >
                <IconoPorNombre nombre={datos.icono} className="size-5" />
            </span>
            <div>
                <h4
                    className={cn(
                        'font-semibold',
                        oscuro ? 'text-white' : 'text-gray-900',
                    )}
                >
                    {datos.titulo || 'Característica'}
                </h4>
                {datos.texto && (
                    <p
                        className={cn(
                            'mt-1 text-sm leading-relaxed',
                            oscuro ? 'text-white/75' : 'text-gray-600',
                        )}
                    >
                        {datos.texto}
                    </p>
                )}
            </div>
        </div>
    );
}

// ============================================================
// CIFRA
// ============================================================

export function ElementoCifra({
    datos,
    estilos,
}: PropsElemento<{ valor?: string; etiqueta?: string }>) {
    const oscuro = esOscuro(estilos);

    return (
        <div className="text-center">
            <p
                className={cn(
                    'text-4xl font-bold tracking-tight md:text-5xl',
                    oscuro ? 'text-white' : 'text-red-600',
                )}
            >
                {datos.valor || '00'}
            </p>
            <p
                className={cn(
                    'mt-1 text-sm',
                    oscuro ? 'text-white/70' : 'text-gray-600',
                )}
            >
                {datos.etiqueta || 'Descripción'}
            </p>
        </div>
    );
}

// ============================================================
// CITA
// ============================================================

export function ElementoCita({
    datos,
    estilos,
}: PropsElemento<{ texto?: string; autor?: string; cargo?: string }>) {
    const oscuro = esOscuro(estilos);

    return (
        <figure
            className={cn(
                'rounded-xl border-l-4 border-red-600 py-2 pl-6',
                oscuro ? 'text-white' : 'text-gray-900',
            )}
        >
            <Quote
                aria-hidden
                className={cn(
                    'mb-3 size-6',
                    oscuro ? 'text-white/40' : 'text-red-200',
                )}
            />
            <blockquote className="text-lg leading-relaxed font-medium text-balance">
                {datos.texto || 'Escribe aquí la cita.'}
            </blockquote>
            {datos.autor && (
                <figcaption
                    className={cn(
                        'mt-3 text-sm',
                        oscuro ? 'text-white/70' : 'text-gray-600',
                    )}
                >
                    <span className="font-semibold">{datos.autor}</span>
                    {datos.cargo && <span> · {datos.cargo}</span>}
                </figcaption>
            )}
        </figure>
    );
}

// ============================================================
// LISTA DE PUNTOS
// ============================================================

export function ElementoLista({
    datos,
    estilos,
}: PropsElemento<{ puntos?: unknown }>) {
    const puntos = Array.isArray(datos.puntos) ? datos.puntos : [];
    const oscuro = esOscuro(estilos);

    if (puntos.length === 0) {
        return (
            <p className="text-sm text-gray-400 italic">
                Añade puntos a la lista.
            </p>
        );
    }

    return (
        <ul className="space-y-2.5">
            {puntos.map((punto, indice) => {
                const texto =
                    typeof punto === 'object' && punto !== null
                        ? String((punto as { texto?: unknown }).texto ?? '')
                        : String(punto);

                return (
                    <li
                        key={indice}
                        className={cn(
                            'flex items-start gap-2.5 text-sm leading-relaxed',
                            oscuro ? 'text-white/85' : 'text-gray-700',
                        )}
                    >
                        <Check className="mt-0.5 size-4 shrink-0 text-red-600" />
                        {texto}
                    </li>
                );
            })}
        </ul>
    );
}

// ============================================================
// VÍDEO
// ============================================================

export function ElementoVideo({ datos }: PropsElemento<{ url?: string }>) {
    const incrustado = urlIncrustada(String(datos.url ?? ''));

    if (!incrustado) {
        return (
            <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-400">
                Pega la dirección de un vídeo de YouTube o Vimeo
            </div>
        );
    }

    return (
        <div className="aspect-video overflow-hidden rounded-xl bg-black shadow-sm">
            <iframe
                src={incrustado}
                title="Vídeo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
            />
        </div>
    );
}

// ============================================================
// SEPARADOR Y ESPACIO
// ============================================================

export function ElementoSeparador({
    datos,
    estilos,
}: PropsElemento<{ estilo?: string }>) {
    const oscuro = esOscuro(estilos);
    const variante = String(datos.estilo ?? 'linea');

    if (variante === 'invisible') {
        return <hr className="border-transparent" />;
    }

    return (
        <hr
            className={cn(
                variante === 'punteado' ? 'border-dashed' : 'border-solid',
                oscuro ? 'border-white/20' : 'border-gray-200',
            )}
        />
    );
}

const ALTURAS: Record<string, string> = {
    pequeno: 'h-4',
    mediano: 'h-10',
    grande: 'h-20',
};

export function ElementoEspacio({ datos }: PropsElemento<{ altura?: string }>) {
    return (
        <div
            aria-hidden
            className={ALTURAS[String(datos.altura ?? 'mediano')] ?? 'h-10'}
        />
    );
}
