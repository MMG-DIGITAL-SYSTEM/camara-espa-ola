// resources/js/pages/Public/Servicios/index.tsx
import { Link } from '@inertiajs/react';
import { ArrowRight, Building2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { IconoPorNombre } from '@/blocks/componentes/dinamicos';
import { SeccionesDelModulo } from '@/components/public/secciones-del-modulo';
import PublicLayout from '@/layouts/PublicLayout';

// ============================================
// TIPOS
// ============================================
interface Servicio {
    id: number;
    titulo: string;
    contenido: string;
    icono: string | null;
    imagen: string | null;
    enlace: string | null;
    enlace_texto: string | null;
    orden: number;
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
// TARJETA DE SERVICIO
// ============================================

/** Enlace interno con Inertia; externo, en pestaña nueva. */
function BotonServicio({ enlace, texto }: { enlace: string; texto: string }) {
    const clases =
        'group/boton mt-auto inline-flex items-center gap-2 self-start rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-600/20 transition-all duration-300 hover:bg-red-700 hover:shadow-lg';
    const contenido = (
        <>
            {texto}
            <ArrowRight className="h-4 w-4 transition-transform group-hover/boton:translate-x-1" />
        </>
    );

    if (enlace.startsWith('/')) {
        return (
            <Link href={enlace} className={clases}>
                {contenido}
            </Link>
        );
    }

    return (
        <a
            href={enlace}
            target="_blank"
            rel="noopener noreferrer"
            className={clases}
        >
            {contenido}
        </a>
    );
}

/**
 * Cada servicio con su propia imagen. Si no tiene, o no carga, se muestra un
 * fondo con su icono para que la tarjeta no quede con un hueco roto.
 */
function TarjetaServicio({ servicio }: { servicio: Servicio }) {
    const [imagenRota, setImagenRota] = useState(false);
    const conImagen = servicio.imagen && !imagenRota;

    return (
        <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-red-600/20 hover:shadow-xl">
            <div className="relative aspect-video overflow-hidden">
                {conImagen ? (
                    <img
                        src={servicio.imagen!}
                        alt={servicio.titulo}
                        loading="lazy"
                        onError={() => setImagenRota(true)}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-gray-900 via-gray-800 to-red-900">
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm transition-transform duration-500 group-hover:scale-110">
                            <IconoPorNombre
                                nombre={servicio.icono}
                                className="h-10 w-10 text-white"
                            />
                        </div>
                    </div>
                )}
                <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-linear-to-r from-red-600 to-red-400 transition-transform duration-500 group-hover:scale-x-100" />
            </div>

            <div className="flex flex-1 flex-col gap-3 p-6">
                <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-600/10 transition-colors duration-300 group-hover:bg-red-600">
                        <IconoPorNombre
                            nombre={servicio.icono}
                            className="h-5 w-5 text-red-600 transition-colors duration-300 group-hover:text-white"
                        />
                    </span>
                    <h3 className="text-lg leading-snug font-bold text-gray-900 transition-colors group-hover:text-red-600">
                        {servicio.titulo}
                    </h3>
                </div>

                <p className="text-sm leading-relaxed whitespace-pre-line text-gray-600">
                    {servicio.contenido}
                </p>

                {servicio.enlace && (
                    <div className="mt-auto pt-2">
                        <BotonServicio
                            enlace={servicio.enlace}
                            texto={servicio.enlace_texto ?? 'Ver más'}
                        />
                    </div>
                )}
            </div>
        </article>
    );
}

// ============================================
// PÁGINA PRINCIPAL
// ============================================
export default function ServiciosPage() {
    const [servicios, setServicios] = useState<Servicio[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarServicios = async () => {
            try {
                const response = await fetch('/api/servicios');
                const result = await response.json();

                if (result.success) {
                    setServicios(result.data);
                }
            } catch (error) {
                console.error('Error cargando servicios:', error);
            } finally {
                setLoading(false);
            }
        };

        cargarServicios();
    }, []);

    return (
        <PublicLayout>
            <SeccionesDelModulo lugar="arriba" />

            <section className="bg-gray-50 py-16 md:py-20">
                <div className="container mx-auto px-6">
                    <div className="mx-auto max-w-6xl">
                        {loading ? (
                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                {[...Array(6)].map((_, indice) => (
                                    <div
                                        key={indice}
                                        className="overflow-hidden rounded-2xl border border-gray-100 bg-white"
                                    >
                                        <div className="aspect-video animate-pulse bg-gray-200" />
                                        <div className="space-y-3 p-6">
                                            <div className="h-5 w-1/2 animate-pulse rounded bg-gray-200" />
                                            <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
                                            <div className="h-4 w-5/6 animate-pulse rounded bg-gray-100" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : servicios.length > 0 ? (
                            // Flex en vez de grid: la última fila incompleta queda centrada.
                            <div className="flex flex-wrap justify-center gap-8">
                                {servicios.map((servicio, indice) => (
                                    <FadeInUp
                                        key={servicio.id}
                                        delay={(indice % 3) * 100}
                                        className="w-full md:w-[calc(50%-1rem)] lg:w-[calc((100%-4rem)/3)]"
                                    >
                                        <TarjetaServicio servicio={servicio} />
                                    </FadeInUp>
                                ))}
                            </div>
                        ) : (
                            <FadeInUp>
                                <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white py-16 text-center">
                                    <Building2 className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                                    <h3 className="mb-2 text-xl font-semibold text-gray-700">
                                        No hay servicios disponibles
                                    </h3>
                                    <p className="text-gray-500">
                                        Próximamente se publicarán nuevos
                                        servicios.
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
