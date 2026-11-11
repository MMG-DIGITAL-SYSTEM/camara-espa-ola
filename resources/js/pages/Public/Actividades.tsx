// resources/js/pages/Public/Actividades/index.tsx
import { Link } from '@inertiajs/react';
import { Calendar, ChevronRight, Sparkles, Clock } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ContadorMeGusta } from '@/components/public/boton-me-gusta';
import { ImagenSinRecorte } from '@/components/public/imagen-sin-recorte';
import { SeccionesDelModulo } from '@/components/public/secciones-del-modulo';
import PublicLayout from '@/layouts/PublicLayout';
import { textoPlano } from '@/lib/utils';

interface Actividad {
    id: number;
    titulo: string;
    descripcion: string;
    extracto: string | null;
    imagen: string | null;
    fecha_publicacion: string;
    categorias: string[];
    slug: string;
    me_gusta_count: number;
    le_gusta: boolean;
}

interface ActividadesData {
    data: Actividad[];
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
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

function StaggerGrid({
    children,
    columns = 3,
}: {
    children: React.ReactNode[];
    columns?: 2 | 3 | 4;
}) {
    const { ref, isVisible } = useReveal(0.1);

    const colClasses = {
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    };

    return (
        <div ref={ref} className={`grid ${colClasses[columns]} gap-6 md:gap-8`}>
            {children.map((child, index) => (
                <div
                    key={index}
                    className={`transition-all duration-700 ease-out ${
                        isVisible
                            ? 'translate-y-0 opacity-100'
                            : 'translate-y-12 opacity-0'
                    }`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                >
                    {child}
                </div>
            ))}
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

function truncateText(html: string, maxLength: number = 120): string {
    const text = textoPlano(html);

    if (!text) {
        return '';
    }

    if (text.length <= maxLength) {
        return text;
    }

    return text.substring(0, maxLength).trim() + '...';
}

// ============================================
// TAG CHIP CON COLORES MEJORADOS
// ============================================
function TagChip({ children }: { children: string }) {
    const colors: Record<string, string> = {
        destacada: 'bg-red-100 text-red-700 hover:bg-red-200',
        noticia: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
        eventos: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
        actividades: 'bg-green-100 text-green-700 hover:bg-green-200',
        proximo: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
        'sin categoria': 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    };

    const colorClass =
        colors[children.toLowerCase()] ||
        'bg-gray-100 text-gray-700 hover:bg-gray-200';

    return (
        <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium transition-all duration-300 ${colorClass}`}
        >
            {children}
        </span>
    );
}

// ============================================
// TARJETA DE ACTIVIDAD MEJORADA
// ============================================
function ActividadCard({
    actividad,
    index,
}: {
    actividad: Actividad;
    index: number;
}) {
    const imagenUrl =
        actividad.imagen ||
        'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&h=400&fit=crop&q=80';
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="group animate-fade-in relative"
            style={{ animationDelay: `${index * 100}ms` }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link
                href={`/actividades/${actividad.slug}`}
                className="relative block overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-red-600/30 hover:shadow-2xl"
            >
                <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    <ImagenSinRecorte
                        src={imagenUrl}
                        alt={actividad.titulo}
                        className="transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Overlay con gradiente al hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                    {/* Icono flotante al hover */}
                    <div
                        className={`absolute top-4 right-4 transition-all duration-500 ${isHovered ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                    </div>

                    {/* Línea decorativa */}
                    <div className="absolute top-0 right-0 left-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-red-600 to-red-400 transition-transform duration-500 group-hover:scale-x-100" />
                </div>

                <div className="p-6">
                    {actividad.categorias &&
                        actividad.categorias.length > 0 && (
                            <div className="mb-3 flex flex-wrap gap-1.5">
                                {actividad.categorias.map((cat) => (
                                    <TagChip key={cat}>{cat}</TagChip>
                                ))}
                            </div>
                        )}

                    <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4 text-red-600" />
                        <span className="font-medium">
                            {formatDate(actividad.fecha_publicacion)}
                        </span>
                    </div>

                    <h3 className="mb-3 line-clamp-2 text-xl leading-tight font-bold text-gray-900 transition-colors group-hover:text-red-600">
                        {actividad.titulo}
                    </h3>

                    <p className="line-clamp-3 text-sm leading-relaxed text-gray-600">
                        {actividad.extracto ||
                            truncateText(actividad.descripcion, 150)}
                    </p>

                    <div className="mt-5 flex items-center justify-between">
                        <div className="flex items-center text-sm font-semibold text-red-600 transition-all duration-300 group-hover:translate-x-2">
                            <span>Leer más</span>
                            <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                        <div className="text-xs text-gray-400">
                            <ContadorMeGusta
                                total={actividad.me_gusta_count}
                                leGusta={actividad.le_gusta}
                            />
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}

// ============================================
// PAGINACIÓN MEJORADA
// ============================================
function Pagination({
    links,
}: {
    links: ActividadesData['pagination']['links'];
}) {
    if (!links || links.length <= 3) {
        return null;
    }

    return (
        <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
            {links.map((link, index) => {
                if (link.url === null) {
                    return (
                        <span
                            key={index}
                            className="cursor-not-allowed px-4 py-2 text-sm text-gray-400"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );
                }

                return (
                    <Link
                        key={index}
                        href={link.url}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ${
                            link.active
                                ? 'bg-red-600 text-white shadow-md hover:bg-red-700 hover:shadow-lg'
                                : 'border border-gray-200 bg-white text-gray-700 hover:border-red-300 hover:bg-red-50 hover:text-red-600'
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                );
            })}
        </div>
    );
}

// ============================================
// SECCIÓN DE CONTEO DE ACTIVIDADES
// ============================================
function StatsSection({ total }: { total: number }) {
    return (
        <div className="border-b border-gray-100 bg-white">
            <div className="container mx-auto px-6">
                <div className="flex flex-wrap items-center justify-between gap-4 py-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600/10">
                            <Calendar className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <span className="text-2xl font-bold text-gray-900">
                                {total}
                            </span>
                            <span className="ml-2 text-gray-500">
                                actividades publicadas
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span>Mantente al día</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================
// PÁGINA PRINCIPAL
// ============================================
export default function ActividadesPage({ data }: { data: ActividadesData }) {
    const actividades = data?.data || [];
    const pagination = data?.pagination;

    return (
        <PublicLayout>
            <SeccionesDelModulo lugar="arriba" />
            <StatsSection total={pagination?.total || 0} />

            <section className="bg-white py-12 md:py-16">
                <div className="container mx-auto px-6">
                    {actividades.length > 0 ? (
                        <>
                            <StaggerGrid columns={3}>
                                {actividades.map((actividad, index) => (
                                    <ActividadCard
                                        key={actividad.id}
                                        actividad={actividad}
                                        index={index}
                                    />
                                ))}
                            </StaggerGrid>

                            {pagination && pagination.links && (
                                <FadeInUp delay={300}>
                                    <Pagination links={pagination.links} />
                                </FadeInUp>
                            )}
                        </>
                    ) : (
                        <FadeInUp>
                            <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white py-20 text-center">
                                <div className="animate-float mb-6 text-7xl text-gray-300">
                                    📋
                                </div>
                                <h3 className="mb-3 text-2xl font-bold text-gray-700">
                                    No hay actividades
                                </h3>
                                <p className="mx-auto max-w-md text-gray-500">
                                    Próximamente se publicarán nuevas
                                    actividades.
                                    <span className="mt-2 block text-sm text-red-600">
                                        ¡Mantente atento!
                                    </span>
                                </p>
                            </div>
                        </FadeInUp>
                    )}
                </div>
            </section>

            <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
            <SeccionesDelModulo lugar="abajo" />
        </PublicLayout>
    );
}
