// resources/js/pages/Public/Socios/Show.tsx
import { Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    MapPin,
    Phone,
    Mail,
    Globe,
    Users,
    User,
    Star,
    Share2,
    Heart,
    ExternalLink,
} from 'lucide-react';
import { useEffect, useRef, useState, useCallback } from 'react';
import PublicLayout from '@/layouts/PublicLayout';

// ============================================
// TIPOS
// ============================================
interface Contacto {
    nombre: string;
    cargo: string;
    email: string | null;
    telefono: string | null;
}

interface SocioDetalle {
    id: number;
    nombre: string;
    descripcion: string | null;
    imagen: string | null;
    logo: string | null;
    nit: string | null;
    telefono1: string | null;
    telefono2: string | null;
    correo: string | null;
    direccion: string | null;
    pagina_web: string | null;
    slug: string;
    categoria: string | null;
    estado: string | null;
    fecha_afiliacion: string | null;
    contactos: Contacto[];
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
// LOGO PLACEHOLDER
// ============================================
function LogoPlaceholder({ nombre }: { nombre: string }) {
    const iniciales = nombre
        .split(' ')
        .filter((word) => word.length > 0)
        .map((word) => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-6xl font-bold text-gray-300">
                {iniciales}
            </span>
        </div>
    );
}

// ============================================
// BADGE DECORATIVO
// ============================================
function SectionBadge({ text, icon: Icon }: { text: string; icon?: any }) {
    return (
        <div className="mb-4 flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5 text-red-600" />}
            <span className="text-sm font-semibold tracking-[0.15em] text-red-600 uppercase">
                {text}
            </span>
            <div className="ml-4 h-px flex-1 bg-red-200"></div>
        </div>
    );
}

// ============================================
// HERO CON DISEÑO ÚNICO
// ============================================
function HeroSection({ socio }: { socio: SocioDetalle }) {
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

    const imagenUrl = socio.logo || socio.imagen || null;

    /*
     * Se calculan una sola vez. El hero guarda la posición del ratón en
     * estado, así que re-renderiza con cada movimiento: generarlas en el
     * render hacía que las partículas saltasen de sitio sin parar.
     */
    const [particulas] = useState(() =>
        Array.from({ length: 30 }, (_, i) => ({
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
                            href="/socios"
                            className="group mb-8 inline-flex items-center gap-2 text-sm text-gray-300 transition-colors hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            Volver a socios
                        </Link>

                        <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
                            <div className="relative flex-shrink-0">
                                <div className="relative h-48 w-40 md:h-60 md:w-52">
                                    <div className="absolute inset-0 overflow-hidden rounded-2xl rounded-t-none border border-white/10 bg-gradient-to-br from-red-600/20 to-red-400/10 backdrop-blur-sm">
                                        <div className="absolute inset-0 flex items-center justify-center p-6">
                                            {imagenUrl ? (
                                                <img
                                                    src={imagenUrl}
                                                    alt={socio.nombre}
                                                    className="h-full w-full object-contain drop-shadow-2xl filter"
                                                />
                                            ) : (
                                                <LogoPlaceholder
                                                    nombre={socio.nombre}
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <div className="absolute -top-1 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
                                    <div className="absolute right-0 -bottom-1 left-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50" />
                                </div>
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                <div className="mb-3 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                                    {socio.categoria && (
                                        <span className="rounded-full border border-red-600/30 bg-red-600/20 px-3 py-1 text-xs font-medium text-red-400">
                                            {socio.categoria}
                                        </span>
                                    )}
                                    {socio.estado && (
                                        <span className="rounded-full border border-green-600/30 bg-green-600/20 px-3 py-1 text-xs font-medium text-green-400">
                                            {socio.estado}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1 text-xs text-gray-400">
                                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                        Socio Destacado
                                    </span>
                                </div>

                                <h1 className="text-3xl leading-tight font-bold md:text-5xl lg:text-6xl">
                                    {socio.nombre}
                                </h1>

                                <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-gray-300 md:justify-start">
                                    {socio.telefono1 && (
                                        <span className="flex items-center gap-1.5 text-sm">
                                            <Phone className="h-4 w-4 text-red-500" />
                                            {socio.telefono1}
                                        </span>
                                    )}
                                    {socio.correo && (
                                        <span className="flex items-center gap-1.5 text-sm">
                                            <Mail className="h-4 w-4 text-red-500" />
                                            {socio.correo}
                                        </span>
                                    )}
                                </div>
                            </div>
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
      `}</style>
        </section>
    );
}

// ============================================
// CARD DE INFORMACIÓN DE CONTACTO
// ============================================
function InfoCard({
    icon: Icon,
    title,
    children,
}: {
    icon: any;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="group rounded-xl border border-gray-100 bg-white p-5 transition-all duration-500 hover:-translate-y-1 hover:border-red-600/30 hover:shadow-lg">
            <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-red-600/10 transition-colors duration-300 group-hover:bg-red-600">
                    <Icon className="h-5 w-5 text-red-600 transition-colors duration-300 group-hover:text-white" />
                </div>
                <div className="min-w-0 flex-1">
                    <h4 className="mb-1 text-xs font-medium tracking-wider text-gray-400 uppercase">
                        {title}
                    </h4>
                    <div className="text-sm font-medium text-gray-700">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================
// TARJETA DE CONTACTO
// ============================================
function ContactoCard({ contacto }: { contacto: Contacto }) {
    return (
        <div className="group rounded-xl border border-gray-100 bg-white p-5 transition-all duration-500 hover:-translate-y-1 hover:border-red-600/30 hover:shadow-lg">
            <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-red-200 transition-colors duration-300 group-hover:from-red-600 group-hover:to-red-700">
                    <User className="h-6 w-6 text-red-600 transition-colors duration-300 group-hover:text-white" />
                </div>
                <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-gray-900">
                        {contacto.nombre}
                    </h4>
                    <p className="text-sm text-gray-500">{contacto.cargo}</p>
                    <div className="mt-2 space-y-1">
                        {contacto.email && (
                            <a
                                href={`mailto:${contacto.email}`}
                                className="flex items-center gap-2 text-sm text-red-600 transition-colors hover:text-red-700"
                            >
                                <Mail className="h-3 w-3" />
                                {contacto.email}
                            </a>
                        )}
                        {contacto.telefono && (
                            <p className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="h-3 w-3" />
                                {contacto.telefono}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================
// STATS DECORATIVOS
// ============================================
function StatsSection({ socio }: { socio: SocioDetalle }) {
    const stats = [
        { icon: Building2, label: 'NIT', value: socio.nit || 'No registrado' },
        {
            icon: Users,
            label: 'Contactos',
            value: socio.contactos?.length || 0,
        },
        {
            icon: Globe,
            label: 'Sector',
            value: socio.categoria || 'No especificado',
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {stats.map((stat, index) => (
                <FadeInUp key={index} delay={index * 100}>
                    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                                <stat.icon className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-xs tracking-wider text-gray-400 uppercase">
                                    {stat.label}
                                </p>
                                <p className="text-sm font-semibold text-gray-900">
                                    {stat.value}
                                </p>
                            </div>
                        </div>
                    </div>
                </FadeInUp>
            ))}
        </div>
    );
}

// ============================================
// COMPONENTE DE CARGA
// ============================================
function LoadingSkeleton() {
    return (
        <PublicLayout>
            <div className="container mx-auto max-w-6xl px-6 py-12">
                <div className="animate-pulse">
                    <div className="mb-6 h-8 w-1/4 rounded bg-gray-200" />
                    <div className="flex flex-col items-center gap-8 md:flex-row">
                        <div className="h-60 w-52 rounded-2xl bg-gray-200" />
                        <div className="flex-1">
                            <div className="mb-4 h-10 w-3/4 rounded bg-gray-200" />
                            <div className="h-6 w-1/3 rounded bg-gray-200" />
                        </div>
                    </div>
                    <div className="mt-8 grid grid-cols-3 gap-4">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="h-20 rounded-xl bg-gray-200"
                            />
                        ))}
                    </div>
                    <div className="mt-8 grid grid-cols-3 gap-8">
                        <div className="col-span-2">
                            <div className="h-64 rounded-xl bg-gray-200" />
                        </div>
                        <div className="col-span-1">
                            <div className="h-64 rounded-xl bg-gray-200" />
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}

// ============================================
// PÁGINA PRINCIPAL
// ============================================
export default function SocioShow() {
    const { slug } = usePage<{ slug: string }>().props;
    const [socio, setSocio] = useState<SocioDetalle | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const cargarSocio = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/socios/${slug}`);
                const result = await response.json();
                console.log('📦 Detalle socio:', result);

                if (result.success) {
                    setSocio(result.data);
                } else {
                    setError(result.message || 'No se pudo cargar el socio');
                }
            } catch (err) {
                setError('Error de conexión al cargar el socio');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            cargarSocio();
        }
    }, [slug]);

    if (loading) {
        return <LoadingSkeleton />;
    }

    if (error || !socio) {
        return (
            <PublicLayout>
                <div className="container mx-auto max-w-4xl px-6 py-12 text-center">
                    <div className="mb-4 text-6xl">😕</div>
                    <h2 className="mb-2 text-2xl font-bold text-gray-700">
                        No se pudo cargar el socio
                    </h2>
                    <p className="text-gray-500">
                        {error || 'Socio no encontrado'}
                    </p>
                    <Link
                        href="/socios"
                        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Volver a socios
                    </Link>
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
            <HeroSection socio={socio} />

            <section className="bg-white py-12 md:py-16">
                <div className="container mx-auto px-6">
                    <div className="mx-auto max-w-6xl">
                        <StatsSection socio={socio} />

                        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
                            <div className="space-y-8 lg:col-span-2">
                                {socio.descripcion && (
                                    <FadeInLeft delay={200}>
                                        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                            <SectionBadge
                                                text="Sobre la empresa"
                                                icon={Building2}
                                            />
                                            <p className="leading-relaxed text-gray-600">
                                                {socio.descripcion}
                                            </p>
                                        </div>
                                    </FadeInLeft>
                                )}

                                {socio.contactos &&
                                    socio.contactos.length > 0 && (
                                        <FadeInLeft delay={300}>
                                            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                                <SectionBadge
                                                    text="Responsables"
                                                    icon={Users}
                                                />
                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    {socio.contactos.map(
                                                        (contacto, index) => (
                                                            <ContactoCard
                                                                key={index}
                                                                contacto={
                                                                    contacto
                                                                }
                                                            />
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        </FadeInLeft>
                                    )}
                            </div>

                            <div className="space-y-4 lg:col-span-1">
                                <FadeInRight delay={200}>
                                    <div className="sticky top-8 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                        <h3 className="mb-4 text-sm font-bold tracking-wider text-gray-900 uppercase">
                                            Información de contacto
                                        </h3>

                                        <div className="space-y-3">
                                            {socio.telefono1 && (
                                                <InfoCard
                                                    icon={Phone}
                                                    title="Teléfono"
                                                >
                                                    <a
                                                        href={`tel:${socio.telefono1}`}
                                                        className="transition-colors hover:text-red-600"
                                                    >
                                                        {socio.telefono1}
                                                    </a>
                                                </InfoCard>
                                            )}

                                            {socio.telefono2 && (
                                                <InfoCard
                                                    icon={Phone}
                                                    title="Teléfono 2"
                                                >
                                                    <a
                                                        href={`tel:${socio.telefono2}`}
                                                        className="transition-colors hover:text-red-600"
                                                    >
                                                        {socio.telefono2}
                                                    </a>
                                                </InfoCard>
                                            )}

                                            {socio.correo && (
                                                <InfoCard
                                                    icon={Mail}
                                                    title="Correo electrónico"
                                                >
                                                    <a
                                                        href={`mailto:${socio.correo}`}
                                                        className="break-all transition-colors hover:text-red-600"
                                                    >
                                                        {socio.correo}
                                                    </a>
                                                </InfoCard>
                                            )}

                                            {socio.direccion && (
                                                <InfoCard
                                                    icon={MapPin}
                                                    title="Dirección"
                                                >
                                                    <span>
                                                        {socio.direccion}
                                                    </span>
                                                </InfoCard>
                                            )}

                                            {socio.pagina_web && (
                                                <InfoCard
                                                    icon={Globe}
                                                    title="Sitio web"
                                                >
                                                    <a
                                                        href={
                                                            socio.pagina_web.startsWith(
                                                                'http',
                                                            )
                                                                ? socio.pagina_web
                                                                : `https://${socio.pagina_web}`
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 transition-colors hover:text-red-600"
                                                    >
                                                        {socio.pagina_web.replace(
                                                            /^https?:\/\//,
                                                            '',
                                                        )}
                                                        <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                </InfoCard>
                                            )}
                                        </div>

                                        <div className="mt-6 space-y-2 border-t border-gray-100 pt-6">
                                            {socio.pagina_web && (
                                                <a
                                                    href={
                                                        socio.pagina_web.startsWith(
                                                            'http',
                                                        )
                                                            ? socio.pagina_web
                                                            : `https://${socio.pagina_web}`
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 font-medium text-white transition-all duration-300 hover:scale-105 hover:bg-red-700 hover:shadow-lg"
                                                >
                                                    <Globe className="h-4 w-4" />
                                                    Visitar sitio web
                                                </a>
                                            )}
                                            <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-medium text-gray-700 transition-all duration-300 hover:border-red-300 hover:bg-red-50 hover:text-red-600">
                                                <Heart className="h-4 w-4" />
                                                Me gusta
                                            </button>
                                            <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-medium text-gray-700 transition-all duration-300 hover:border-red-300 hover:bg-red-50 hover:text-red-600">
                                                <Share2 className="h-4 w-4" />
                                                Compartir
                                            </button>
                                        </div>
                                    </div>
                                </FadeInRight>
                            </div>
                        </div>

                        <FadeInUp delay={400}>
                            <div className="mt-12 border-t border-gray-200 pt-6">
                                <Link
                                    href="/socios"
                                    className="group inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-red-600"
                                >
                                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                                    <span>Volver a todos los socios</span>
                                </Link>
                            </div>
                        </FadeInUp>
                    </div>
                </div>
            </section>

            <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
        </PublicLayout>
    );
}
