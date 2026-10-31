// resources/js/pages/Public/RedCamaras/index.tsx
import {
    Globe,
    Building2,
    ExternalLink,
    MapPin,
    Globe2,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { SeccionesDelModulo } from '@/components/public/secciones-del-modulo';
import PublicLayout from '@/layouts/PublicLayout';

// ============================================
// TIPOS
// ============================================
interface RedCamara {
    id: number;
    nombre: string;
    pais: string | null;
    ciudad: string | null;
    pagina_web: string | null;
    logo: string | null;
    orden: number;
    activo: boolean;
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

function StaggerGrid({
    children,
    columns = 4,
}: {
    children: React.ReactNode[];
    columns?: 3 | 4;
}) {
    const { ref, isVisible } = useReveal(0.1);

    const colClasses = {
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    };

    return (
        <div ref={ref} className={`grid ${colClasses[columns]} gap-6`}>
            {children.map((child, index) => (
                <div
                    key={index}
                    className={`transition-all duration-700 ease-out ${
                        isVisible
                            ? 'translate-y-0 opacity-100'
                            : 'translate-y-12 opacity-0'
                    }`}
                    style={{ transitionDelay: `${index * 80}ms` }}
                >
                    {child}
                </div>
            ))}
        </div>
    );
}


// ============================================
// COMPONENTE CARD MEJORADO
// ============================================
function RedCamaraCard({ camara }: { camara: RedCamara }) {
    const [imageError, setImageError] = useState(false);

    const iniciales = camara.nombre
        .split(' ')
        .filter((word) => word.length > 0)
        .map((word) => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const ubicacion = [camara.ciudad, camara.pais].filter(Boolean).join(', ');

    // El realce al pasar el ratón lo resuelve group-hover, sin estado.

    return (
        <div className="group relative">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-red-600/10 to-red-400/10 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />

            <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-red-600/30 hover:shadow-2xl">
                <div className="flex flex-col items-center p-6 text-center">
                    {/* Logo / Placeholder con efecto */}
                    <div className="relative">
                        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-gray-100 bg-gradient-to-br from-gray-50 to-gray-100 transition-all duration-500 group-hover:scale-105 group-hover:border-red-200 md:h-28 md:w-28">
                            {camara.logo && !imageError ? (
                                <img
                                    src={camara.logo}
                                    alt={camara.nombre}
                                    className="h-full w-full object-cover"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <span className="text-3xl font-bold text-gray-400 transition-colors duration-300 group-hover:text-red-600">
                                    {iniciales}
                                </span>
                            )}
                        </div>

                        {/* Anillo decorativo */}
                        <div className="absolute -inset-1 rounded-full border-2 border-red-600/0 transition-all duration-500 group-hover:scale-110 group-hover:border-red-600/20" />
                    </div>

                    {/* Nombre */}
                    <h3 className="mt-4 mb-1 text-lg leading-tight font-bold text-gray-900 transition-colors duration-300 group-hover:text-red-600">
                        {camara.nombre}
                    </h3>

                    {/* Ubicación */}
                    {ubicacion && (
                        <p className="mb-4 flex items-center justify-center gap-1.5 text-sm text-gray-500">
                            <MapPin className="h-3.5 w-3.5 text-red-400" />
                            {ubicacion}
                        </p>
                    )}

                    {/* Badge de red */}
                    <div className="mb-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
                            <Globe2 className="h-3 w-3" />
                            Cámara Española
                        </span>
                    </div>

                    {/* Botón Visitar Sitio Web */}
                    {camara.pagina_web ? (
                        <a
                            href={camara.pagina_web}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/btn inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all duration-300 hover:scale-105 hover:bg-red-700 hover:shadow-xl"
                        >
                            <Globe className="h-4 w-4" />
                            <span>Visitar sitio web</span>
                            <ExternalLink className="h-3.5 w-3.5 opacity-70 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                        </a>
                    ) : (
                        <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-full bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-400">
                            <Globe className="h-4 w-4" />
                            Sitio no disponible
                        </span>
                    )}
                </div>

                {/* Barra superior decorativa */}
                <div className="absolute top-0 right-0 left-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-red-600 to-red-400 transition-transform duration-500 group-hover:scale-x-100" />

                {/* Efecto de brillo en la esquina */}
                <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-gradient-to-bl from-red-600/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </div>
        </div>
    );
}

// ============================================
// CONTADOR DE CÁMARAS
// ============================================
function CounterSection({ total }: { total: number }) {
    return (
        <FadeInUp delay={200}>
            <div className="mb-10 flex items-center justify-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600/10">
                    <Globe className="h-6 w-6 text-red-600" />
                </div>
                <div>
                    <span className="text-2xl font-bold text-gray-900">
                        {total}
                    </span>
                    <span className="ml-2 text-gray-500">
                        cámaras en la red
                    </span>
                </div>
            </div>
        </FadeInUp>
    );
}

// ============================================
// PÁGINA PRINCIPAL
// ============================================
export default function RedCamarasPage({ data }: { data: RedCamara[] }) {
    const [camaras, setCamaras] = useState<RedCamara[]>(data || []);
    // Si el servidor ya mandó las cámaras, no hay nada que cargar.
    const [loading, setLoading] = useState(!data?.length);

    useEffect(() => {
        if (data && data.length > 0) {
            return;
        }

        const fetchCamaras = async () => {
            try {
                const response = await fetch('/api/red-camaras');
                const result = await response.json();

                if (result.success) {
                    setCamaras(result.data);
                }
            } catch (error) {
                console.error('Error cargando red de cámaras:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCamaras();
    }, [data]);

    const camarasOrdenadas = [...camaras].sort(
        (a, b) => (a.orden || 0) - (b.orden || 0),
    );

    return (
        <PublicLayout>
            <SeccionesDelModulo lugar="arriba" />

            <section className="bg-white py-16 md:py-20">
                <div className="container mx-auto px-6">
                    <div className="mx-auto max-w-6xl">
                        {/* Contador */}
                        {!loading && camarasOrdenadas.length > 0 && (
                            <CounterSection total={camarasOrdenadas.length} />
                        )}

                        {loading ? (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {[...Array(8)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
                                    >
                                        <div className="flex flex-col items-center p-6 text-center">
                                            <div className="mb-4 h-28 w-28 animate-pulse rounded-full bg-gray-200" />
                                            <div className="mb-2 h-5 w-3/4 animate-pulse rounded bg-gray-200" />
                                            <div className="mb-4 h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                                            <div className="h-10 w-32 animate-pulse rounded-full bg-gray-200" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : camarasOrdenadas.length > 0 ? (
                            <StaggerGrid columns={4}>
                                {camarasOrdenadas.map((camara) => (
                                    <RedCamaraCard
                                        key={camara.id}
                                        camara={camara}
                                    />
                                ))}
                            </StaggerGrid>
                        ) : (
                            <FadeInUp>
                                <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white py-16 text-center">
                                    <Building2 className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                                    <h3 className="mb-2 text-xl font-semibold text-gray-700">
                                        No hay cámaras disponibles
                                    </h3>
                                    <p className="text-gray-500">
                                        Próximamente se agregarán más cámaras a
                                        la red.
                                    </p>
                                </div>
                            </FadeInUp>
                        )}
                    </div>
                </div>
            </section>
            <SeccionesDelModulo lugar="abajo" />
        </PublicLayout>
    );
}
