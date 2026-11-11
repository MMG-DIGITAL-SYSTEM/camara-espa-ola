// resources/js/pages/Public/Noticias/Show.tsx
import { Link, usePage } from '@inertiajs/react';
import {
    Calendar,
    ArrowLeft,
    User,
    Share2,
    Clock,
    Sparkles,
} from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { HtmlEnriquecido } from '@/blocks/componentes/estructura';
import { BotonMeGusta } from '@/components/public/boton-me-gusta';
import { SeccionComentarios } from '@/components/public/comentarios';
import type { ComentarioPublico } from '@/components/public/comentarios';
import { ImagenSinRecorte } from '@/components/public/imagen-sin-recorte';
import PublicLayout from '@/layouts/PublicLayout';

interface Categoria {
    id: number;
    nombre: string;
}

interface NoticiaDetalle {
    id: number;
    titulo: string;
    descripcion: string;
    extracto: string | null;
    imagen: string | null;
    fecha_publicacion: string;
    fecha_evento: string | null;
    destacada: boolean;
    autor_visible: string | null;
    slug: string;
    categorias: Categoria[];
    me_gusta_count: number;
    le_gusta: boolean;
}

// ============================================
// HOOKS
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

// ============================================
// FORMATO DE FECHA
// ============================================
function formatDate(date: string): string {
    if (!date) {
        return '';
    }

    const d = new Date(date);

    return d.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

// ============================================
// TAG CHIP MEJORADO
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
// SKELETON DE CARGA
// ============================================
function LoadingSkeleton() {
    return (
        <PublicLayout>
            <div className="container mx-auto max-w-4xl px-6 py-12">
                <div className="animate-pulse">
                    <div className="mb-6 h-8 w-1/4 rounded bg-gray-200" />
                    <div className="mb-4 h-12 w-3/4 rounded bg-gray-200" />
                    <div className="mb-8 h-6 w-1/3 rounded bg-gray-200" />
                    <div className="mb-8 h-96 rounded-2xl bg-gray-200" />
                    <div className="space-y-4">
                        <div className="h-4 w-full rounded bg-gray-200" />
                        <div className="h-4 w-5/6 rounded bg-gray-200" />
                        <div className="h-4 w-4/6 rounded bg-gray-200" />
                        <div className="h-4 w-3/4 rounded bg-gray-200" />
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}

// ============================================
// HERO SECTION MEJORADO
// ============================================
function HeroSection({ noticia }: { noticia: NoticiaDetalle }) {
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

    return (
        <section
            ref={heroRef}
            onMouseMove={handleMouseMove}
            className="relative overflow-hidden bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 py-20 text-white md:py-28"
        >
            <div
                className="absolute inset-0 transition-all duration-300 ease-out"
                style={{
                    background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, 
            rgba(239, 68, 68, 0.12) 0%, 
            transparent 60%)`,
                }}
            />

            <div className="relative z-10 container mx-auto px-6">
                <div className="mx-auto max-w-4xl">
                    <div
                        className={`transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                    >
                        <Link
                            href="/noticias"
                            className="group mb-6 inline-flex items-center gap-2 text-sm text-gray-300 transition-colors hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            Volver a noticias
                        </Link>

                        {noticia.destacada && (
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-600/30 bg-red-600/20 px-3 py-1.5 text-xs font-medium text-red-400">
                                <Sparkles className="h-3.5 w-3.5" />
                                Noticia Destacada
                            </div>
                        )}

                        <h1 className="text-3xl leading-tight font-bold md:text-5xl lg:text-6xl">
                            {noticia.titulo}
                        </h1>

                        <div className="mt-6 flex flex-wrap items-center gap-4 text-gray-300">
                            <span className="flex items-center gap-1.5 text-sm">
                                <Calendar className="h-4 w-4 text-red-500" />
                                {formatDate(noticia.fecha_publicacion)}
                            </span>
                            {noticia.autor_visible && (
                                <span className="flex items-center gap-1.5 text-sm">
                                    <User className="h-4 w-4 text-red-500" />
                                    {noticia.autor_visible}
                                </span>
                            )}
                            <span className="flex items-center gap-1.5 text-sm text-gray-400">
                                <Clock className="h-4 w-4" />3 min de lectura
                            </span>
                        </div>

                        {noticia.categorias &&
                            noticia.categorias.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {noticia.categorias.map((cat) => (
                                        <TagChip key={cat.id}>
                                            {cat.nombre}
                                        </TagChip>
                                    ))}
                                </div>
                            )}
                    </div>
                </div>
            </div>

            <div className="absolute right-0 bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent" />
        </section>
    );
}

// ============================================
// IMAGEN PRINCIPAL CON EFECTOS
// ============================================
function MainImage({ src, alt }: { src: string; alt: string }) {
    return (
        <FadeInUp>
            <div className="group relative">
                <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-2xl">
                    <ImagenSinRecorte src={src} alt={alt} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </div>

                {/* Elementos decorativos */}
                <div className="animate-spin-slow absolute -top-4 -right-4 h-20 w-20 rounded-full border-2 border-red-600/20" />
                <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-red-600/5" />
            </div>

            <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 30s linear infinite;
        }
      `}</style>
        </FadeInUp>
    );
}

// ============================================
// EXTRACTO DESTACADO
// ============================================
function ExtractoSection({ extracto }: { extracto: string }) {
    return (
        <FadeInUp delay={200}>
            <div className="relative mb-10">
                <div className="absolute top-0 bottom-0 left-0 w-1 rounded-full bg-gradient-to-b from-red-600 to-red-400" />
                <div className="pl-6">
                    <div className="mb-2 flex items-center gap-2">
                        <span className="text-xs font-semibold tracking-[0.15em] text-red-600 uppercase">
                            Destacado
                        </span>
                        <div className="ml-4 h-px flex-1 bg-red-200"></div>
                    </div>
                    <p className="text-xl leading-relaxed font-light text-gray-700 md:text-2xl">
                        {extracto}
                    </p>
                </div>
            </div>
        </FadeInUp>
    );
}

// ============================================
// CONTENIDO PRINCIPAL
// ============================================
function ContentSection({ descripcion }: { descripcion: string }) {
    return (
        <FadeInUp delay={300}>
            <HtmlEnriquecido
                html={descripcion}
                className="text-lg text-gray-700"
            />
        </FadeInUp>
    );
}

// ============================================
// COMPARTIR EN REDES SOCIALES
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
                className="flex w-full items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:scale-105 hover:bg-red-700 hover:shadow-lg"
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
// SIDEBAR CON INFORMACIÓN ADICIONAL
// ============================================
function Sidebar({ noticia }: { noticia: NoticiaDetalle }) {
    return (
        <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
                <FadeInUp delay={400}>
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
                        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-wider text-gray-900 uppercase">
                            <Calendar className="h-4 w-4 text-red-600" />
                            Información
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-medium tracking-wider text-gray-400 uppercase">
                                    Publicado
                                </p>
                                <p className="text-sm font-medium text-gray-700">
                                    {formatDate(noticia.fecha_publicacion)}
                                </p>
                            </div>
                            {noticia.fecha_evento && (
                                <div>
                                    <p className="text-xs font-medium tracking-wider text-gray-400 uppercase">
                                        Fecha del evento
                                    </p>
                                    <p className="text-sm font-medium text-gray-700">
                                        {formatDate(noticia.fecha_evento)}
                                    </p>
                                </div>
                            )}
                            {noticia.autor_visible && (
                                <div>
                                    <p className="text-xs font-medium tracking-wider text-gray-400 uppercase">
                                        Autor
                                    </p>
                                    <p className="text-sm font-medium text-gray-700">
                                        {noticia.autor_visible}
                                    </p>
                                </div>
                            )}
                            {noticia.categorias &&
                                noticia.categorias.length > 0 && (
                                    <div>
                                        <p className="text-xs font-medium tracking-wider text-gray-400 uppercase">
                                            Categorías
                                        </p>
                                        <div className="mt-1 flex flex-wrap gap-1.5">
                                            {noticia.categorias.map((cat) => (
                                                <TagChip key={cat.id}>
                                                    {cat.nombre}
                                                </TagChip>
                                            ))}
                                        </div>
                                    </div>
                                )}
                        </div>
                    </div>
                </FadeInUp>

                <FadeInUp delay={500}>
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
                        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-wider text-gray-900 uppercase">
                            <Share2 className="h-4 w-4 text-red-600" />
                            Compartir
                        </h3>
                        <div className="flex flex-col gap-2">
                            <ShareButtons
                                url={
                                    typeof window !== 'undefined'
                                        ? window.location.href
                                        : ''
                                }
                                title={noticia.titulo}
                            />
                            <BotonMeGusta
                                objetivo={{
                                    tipo: 'noticia',
                                    slug: noticia.slug,
                                }}
                                totalInicial={noticia.me_gusta_count}
                                leGustaInicial={noticia.le_gusta}
                            />
                        </div>
                    </div>
                </FadeInUp>
            </div>
        </div>
    );
}

// ============================================
// PÁGINA PRINCIPAL
// ============================================
export default function NoticiaShow() {
    const { slug } = usePage<{ slug: string }>().props;
    const [noticia, setNoticia] = useState<NoticiaDetalle | null>(null);
    const [comentarios, setComentarios] = useState<ComentarioPublico[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const cargarNoticia = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/noticias/${slug}`);
                const result = await response.json();

                if (result.success) {
                    setNoticia(result.data);
                    setComentarios(result.comentarios ?? []);
                } else {
                    setError(result.message || 'No se pudo cargar la noticia');
                }
            } catch (err) {
                setError('Error de conexión al cargar la noticia');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            cargarNoticia();
        }
    }, [slug]);

    if (loading) {
        return <LoadingSkeleton />;
    }

    if (error || !noticia) {
        return (
            <PublicLayout>
                <div className="container mx-auto max-w-4xl px-6 py-12 text-center">
                    <div className="mb-4 text-6xl">😕</div>
                    <h2 className="mb-2 text-2xl font-bold text-gray-700">
                        No se pudo cargar la noticia
                    </h2>
                    <p className="text-gray-500">
                        {error || 'Noticia no encontrada'}
                    </p>
                    <Link
                        href="/noticias"
                        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Volver a noticias
                    </Link>
                </div>
            </PublicLayout>
        );
    }

    const imagenUrl =
        noticia.imagen ||
        'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=600&fit=crop&q=80';

    return (
        <PublicLayout>
            <HeroSection noticia={noticia} />

            <section className="bg-white py-12 md:py-16">
                <div className="container mx-auto px-6">
                    <div className="mx-auto max-w-6xl">
                        {/* Layout de dos columnas */}
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
                            {/* Columna principal */}
                            <div className="lg:col-span-2">
                                {/* Imagen */}
                                <MainImage
                                    src={imagenUrl}
                                    alt={noticia.titulo}
                                />

                                {/* Extracto */}
                                {noticia.extracto && (
                                    <ExtractoSection
                                        extracto={noticia.extracto}
                                    />
                                )}

                                {/* Contenido */}
                                <ContentSection
                                    descripcion={noticia.descripcion}
                                />

                                <SeccionComentarios
                                    destino={{
                                        tipo: 'noticia',
                                        slug: noticia.slug,
                                    }}
                                    comentarios={comentarios}
                                />
                            </div>

                            {/* Sidebar */}
                            <Sidebar noticia={noticia} />
                        </div>

                        {/* Volver */}
                        <FadeInUp delay={600}>
                            <div className="mt-12 border-t border-gray-200 pt-6">
                                <Link
                                    href="/noticias"
                                    className="group inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-red-600"
                                >
                                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                                    <span>Volver a todas las noticias</span>
                                </Link>
                            </div>
                        </FadeInUp>
                    </div>
                </div>
            </section>

            <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
        </PublicLayout>
    );
}
