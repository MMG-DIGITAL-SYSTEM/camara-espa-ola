// resources/js/pages/Public/Actividades/Show.tsx
import { Link } from '@inertiajs/react';
import {
    Calendar,
    ArrowLeft,
    Download,
    Users,
    ChevronRight,
    Share2,
    Heart,
} from 'lucide-react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { HtmlEnriquecido } from '@/blocks/componentes/estructura';
import { ImagenSinRecorte } from '@/components/public/imagen-sin-recorte';
import PublicLayout from '@/layouts/PublicLayout';
import { textoPlano } from '@/lib/utils';

// ============================================
// TIPOS
// ============================================
interface Seccion {
    id: number;
    titulo: string;
    contenido: string;
    orden: number;
}

interface Archivo {
    id: number;
    nombre: string;
    url: string;
    tipo: string;
}

interface Categoria {
    id: number;
    nombre: string;
}

interface ActividadDetalle {
    id: number;
    titulo: string;
    descripcion: string;
    extracto: string | null;
    imagen: string | null;
    fecha_publicacion: string;
    fecha_evento: string | null;
    autor_visible: string | null;
    categorias: Categoria[];
    secciones: Seccion[];
    archivos: Archivo[];
}

// ============================================
// HOOK: Intersection Observer
// ============================================
function useReveal(threshold = 0.15) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold, rootMargin: '0px 0px -50px 0px' },
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [threshold]);

    return { ref, isVisible };
}

// ============================================
// COMPONENTES CON ANIMACIONES
// ============================================

function FadeInUp({
    children,
    delay = 0,
    className = '',
}: {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}) {
    const { ref, isVisible } = useReveal(0.1);

    return (
        <div
            ref={ref}
            className={`transition-all duration-700 ease-out ${className} ${
                isVisible
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-12 opacity-0'
            }`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

function FadeInLeft({
    children,
    delay = 0,
    className = '',
}: {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}) {
    const { ref, isVisible } = useReveal(0.1);

    return (
        <div
            ref={ref}
            className={`transition-all duration-700 ease-out ${className} ${
                isVisible
                    ? 'translate-x-0 opacity-100'
                    : '-translate-x-12 opacity-0'
            }`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

function FadeInRight({
    children,
    delay = 0,
    className = '',
}: {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}) {
    const { ref, isVisible } = useReveal(0.1);

    return (
        <div
            ref={ref}
            className={`transition-all duration-700 ease-out ${className} ${
                isVisible
                    ? 'translate-x-0 opacity-100'
                    : 'translate-x-12 opacity-0'
            }`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

// ============================================
// FORMATO DE FECHA
// ============================================
function formatDate(date: string): string {
    if (!date) {
        return '';
    }

    if (date.includes('/')) {
        const partes = date.split('/');
        const d = new Date(
            parseInt(partes[2]),
            parseInt(partes[1]) - 1,
            parseInt(partes[0]),
        );

        return d.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }

    const d = new Date(date);

    return d.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

// ============================================
// TAG CHIP
// ============================================
function TagChip({ children }: { children: string }) {
    const colors: Record<string, string> = {
        destacada: 'bg-red-100 text-red-700 hover:bg-red-200',
        noticia: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
        eventos: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
        actividades: 'bg-green-100 text-green-700 hover:bg-green-200',
        proximo: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
    };

    const colorClass =
        colors[children.toLowerCase()] ||
        'bg-gray-100 text-gray-700 hover:bg-gray-200';

    return (
        <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-medium transition-all duration-300 hover:scale-105 ${colorClass}`}
        >
            {children}
        </span>
    );
}

// ============================================
// COMPARTIR
// ============================================
function ShareButtons({ url, title }: { url: string; title: string }) {
    const [showShare, setShowShare] = useState(false);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    url: url,
                    title: title,
                });
            } catch {
                console.log('Error al compartir');
            }
        } else {
            setShowShare(!showShare);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={handleShare}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:scale-105 hover:bg-red-700 hover:shadow-lg"
            >
                <Share2 className="h-4 w-4" />
                <span>Compartir</span>
            </button>

            {showShare && (
                <div className="animate-fade-in absolute top-full right-0 left-0 z-50 mt-2 rounded-xl border border-gray-100 bg-white p-3 shadow-2xl">
                    <div className="space-y-2">
                        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600">
                            <span className="text-xl">📘</span> Facebook
                        </button>
                        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-sky-50 hover:text-sky-600">
                            <span className="text-xl">🐦</span> Twitter
                        </button>
                        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-red-50 hover:text-red-600">
                            <span className="text-xl">📧</span> Email
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ============================================
// HERO
// ============================================
function HeroSection({ actividad }: { actividad: ActividadDetalle }) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const heroRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        /*
         * Dentro de requestAnimationFrame el navegador llega a pintar el
         * estado inicial antes de cambiarlo. Si se llama directamente, React
         * puede agrupar ambos renders y la transición de entrada no se ve.
         */
        const id = requestAnimationFrame(() => setIsLoaded(true));

        return () => cancelAnimationFrame(id);
    }, []);

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (!heroRef.current) {
                return;
            }

            const rect = heroRef.current.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            setMousePosition({ x, y });
        },
        [],
    );

    /*
     * Se calculan una sola vez. El hero guarda la posición del ratón en
     * estado, así que re-renderiza con cada movimiento: generarlas en el
     * render hacía que las partículas saltasen de sitio sin parar.
     */
    const [particulas] = useState(() =>
        Array.from({ length: 20 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            tamano: Math.random() * 4 + 1,
            retraso: Math.random() * 5,
            duracion: Math.random() * 4 + 3,
        })),
    );

    return (
        <section
            ref={heroRef}
            onMouseMove={handleMouseMove}
            className="relative overflow-hidden bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 py-16 text-white md:py-20"
        >
            <div
                className="absolute inset-0 transition-all duration-300 ease-out"
                style={{
                    background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, 
            rgba(239, 68, 68, 0.12) 0%, 
            transparent 60%)`,
                }}
            />

            {particulas.map((particula) => (
                <div
                    key={particula.id}
                    className="animate-float absolute rounded-full bg-white/10"
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

            <div className="relative z-10 container mx-auto px-6">
                <div className="mx-auto max-w-6xl">
                    <div
                        className={`transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                    >
                        <Link
                            href="/actividades"
                            className="group mb-6 inline-flex items-center gap-2 text-sm text-gray-300 transition-colors hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            Volver a actividades
                        </Link>

                        {actividad.categorias &&
                            actividad.categorias.length > 0 && (
                                <div className="mb-4 flex flex-wrap gap-2">
                                    {actividad.categorias.map((cat) => (
                                        <TagChip key={cat.id}>
                                            {cat.nombre}
                                        </TagChip>
                                    ))}
                                </div>
                            )}

                        <h1 className="text-3xl leading-tight font-bold md:text-4xl lg:text-5xl">
                            {actividad.titulo}
                        </h1>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-gray-300">
                            <span className="flex items-center gap-1.5 text-sm">
                                <Calendar className="h-4 w-4 text-red-500" />
                                {formatDate(actividad.fecha_publicacion)}
                            </span>
                            {actividad.autor_visible && (
                                <span className="flex items-center gap-1.5 text-sm">
                                    <Users className="h-4 w-4 text-red-500" />
                                    {actividad.autor_visible}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute right-0 bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent" />

            <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float ease-in-out infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
        </section>
    );
}

// ============================================
// IMAGEN PRINCIPAL
// ============================================
function MainImage({ src, alt }: { src: string; alt: string }) {
    return (
        <FadeInUp>
            <div className="group relative mx-auto max-w-6xl">
                <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-xl">
                    <ImagenSinRecorte src={src} alt={alt} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </div>
            </div>
        </FadeInUp>
    );
}

// ============================================
// SIDEBAR - BIEN ORGANIZADA
// ============================================
function Sidebar({ actividad }: { actividad: ActividadDetalle }) {
    return (
        <div className="lg:col-span-1">
            <div className="space-y-4">
                {/* Tarjeta de información */}
                <FadeInRight delay={200}>
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <h3 className="mb-3 text-sm font-bold tracking-wider text-gray-900 uppercase">
                            Información
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs font-medium tracking-wider text-gray-400 uppercase">
                                    Publicado
                                </p>
                                <p className="text-sm font-medium text-gray-700">
                                    {formatDate(actividad.fecha_publicacion)}
                                </p>
                            </div>
                            {actividad.fecha_evento && (
                                <div>
                                    <p className="text-xs font-medium tracking-wider text-gray-400 uppercase">
                                        Fecha del evento
                                    </p>
                                    <p className="text-sm font-medium text-gray-700">
                                        {formatDate(actividad.fecha_evento)}
                                    </p>
                                </div>
                            )}
                            {actividad.autor_visible && (
                                <div>
                                    <p className="text-xs font-medium tracking-wider text-gray-400 uppercase">
                                        Autor
                                    </p>
                                    <p className="text-sm font-medium text-gray-700">
                                        {actividad.autor_visible}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </FadeInRight>

                {/* Compartir */}
                <FadeInRight delay={300}>
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <h3 className="mb-3 text-sm font-bold tracking-wider text-gray-900 uppercase">
                            Compartir
                        </h3>
                        <div className="flex flex-col gap-2">
                            <ShareButtons
                                url={
                                    typeof window !== 'undefined'
                                        ? window.location.href
                                        : ''
                                }
                                title={actividad.titulo}
                            />
                            <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all duration-300 hover:border-red-300 hover:bg-red-50 hover:text-red-600">
                                <Heart className="h-4 w-4" />
                                <span>Me gusta</span>
                            </button>
                        </div>
                    </div>
                </FadeInRight>
            </div>
        </div>
    );
}

// ============================================
// CONTENIDO PRINCIPAL
// ============================================
function MainContent({ actividad }: { actividad: ActividadDetalle }) {
    return (
        <div>
            {/* DESTACADO */}
            {(actividad.extracto || actividad.descripcion) && (
                <FadeInLeft delay={200}>
                    <div className="mb-8">
                        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold tracking-wider text-gray-900 uppercase">
                            <span className="h-4 w-1 rounded-full bg-red-600"></span>
                            Destacado
                        </h2>
                        <div className="border-l-4 border-red-600 pl-4">
                            <p className="text-base leading-relaxed text-gray-700 md:text-lg">
                                {actividad.extracto ||
                                    textoPlano(actividad.descripcion).substring(
                                        0,
                                        250,
                                    ) + '...'}
                            </p>
                        </div>
                    </div>
                </FadeInLeft>
            )}

            {/* CONTENIDO */}
            <FadeInRight delay={300}>
                <div className="mb-10">
                    <h2 className="mb-3 flex items-center gap-2 text-sm font-bold tracking-wider text-gray-900 uppercase">
                        <span className="h-4 w-1 rounded-full bg-red-600"></span>
                        Contenido
                    </h2>
                    <HtmlEnriquecido
                        html={actividad.descripcion}
                        className="text-lg text-gray-700"
                    />
                </div>
            </FadeInRight>

            {/* SECCIONES ADICIONALES */}
            {actividad.secciones && actividad.secciones.length > 0 && (
                <FadeInUp delay={400}>
                    <div className="mt-10">
                        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold tracking-wider text-gray-900 uppercase">
                            <span className="h-4 w-1 rounded-full bg-red-600"></span>
                            Más información
                        </h2>
                        <div className="space-y-4">
                            {actividad.secciones.map((seccion, index) => (
                                <div
                                    key={seccion.id}
                                    className="group rounded-xl border border-gray-100 bg-gray-50 p-4 transition-all duration-500 hover:border-red-600/20 hover:bg-white hover:shadow-lg"
                                >
                                    <h3 className="mb-2 flex items-center gap-3 text-lg font-bold text-gray-900 transition-colors group-hover:text-red-600">
                                        <span className="text-xs font-bold text-red-600/40 transition-colors group-hover:text-red-600">
                                            {String(index + 1).padStart(2, '0')}
                                        </span>
                                        {seccion.titulo}
                                    </h3>
                                    <HtmlEnriquecido
                                        html={seccion.contenido}
                                        className="pl-8 text-gray-600"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </FadeInUp>
            )}

            {/* ARCHIVOS */}
            {actividad.archivos && actividad.archivos.length > 0 && (
                <FadeInUp delay={500}>
                    <div className="mt-10 rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all duration-500 hover:border-red-600/30">
                        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold tracking-wider text-gray-900 uppercase">
                            <span className="h-4 w-1 rounded-full bg-red-600"></span>
                            Recursos
                        </h2>
                        <div className="space-y-2">
                            {actividad.archivos.map((archivo) => (
                                <a
                                    key={archivo.id}
                                    href={archivo.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-3 transition-all duration-300 hover:border-red-300 hover:bg-red-50"
                                >
                                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-red-600/10 transition-colors duration-300 group-hover:bg-red-600">
                                        <Download className="h-4 w-4 text-red-600 transition-colors duration-300 group-hover:text-white" />
                                    </div>
                                    <span className="flex-1 text-sm text-gray-700 transition-colors group-hover:text-red-600">
                                        {archivo.nombre}
                                    </span>
                                    <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400 transition-all group-hover:translate-x-1 group-hover:text-red-600" />
                                </a>
                            ))}
                        </div>
                    </div>
                </FadeInUp>
            )}
        </div>
    );
}

// ============================================
// PÁGINA PRINCIPAL
// ============================================
export default function ActividadShow({ data }: { data: ActividadDetalle }) {
    const actividad = data;
    const imagenUrl =
        actividad.imagen ||
        'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&h=600&fit=crop&q=80';

    return (
        <PublicLayout>
            <HeroSection actividad={actividad} />

            <section className="bg-white py-12 md:py-16">
                <div className="container mx-auto px-6">
                    {/* Imagen */}
                    <MainImage src={imagenUrl} alt={actividad.titulo} />

                    {/* Layout de dos columnas */}
                    <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
                        {/* Columna principal - Contenido */}
                        <div className="lg:col-span-2">
                            <MainContent actividad={actividad} />
                        </div>

                        {/* Sidebar - Información y Compartir */}
                        <Sidebar actividad={actividad} />
                    </div>

                    {/* Volver */}
                    <FadeInUp delay={600}>
                        <div className="mx-auto mt-14 max-w-6xl border-t border-gray-200 pt-6">
                            <Link
                                href="/actividades"
                                className="group inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-red-600"
                            >
                                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                                <span>Volver a todas las actividades</span>
                            </Link>
                        </div>
                    </FadeInUp>
                </div>
            </section>
        </PublicLayout>
    );
}
