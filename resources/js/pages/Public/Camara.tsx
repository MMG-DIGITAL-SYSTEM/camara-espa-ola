// resources/js/pages/Public/Camara/index.tsx
import {
    Download,
    FileText,
    Users,
    Building2,
    Target,
    Eye,
    FileCheck,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { SeccionesDelModulo } from '@/components/public/secciones-del-modulo';
import PublicLayout from '@/layouts/PublicLayout';

// ============================================
// TIPOS
// ============================================
interface Seccion {
    titulo: string;
    contenido: string;
    imagen: string | null;
    pdf_url: string | null;
}

interface Directivo {
    id: number;
    nombre: string;
    cargo: string;
    empresa: string | null;
    imagen: string | null;
}

interface CamaraData {
    nuestra_organizacion: Seccion;
    nosotros: Seccion;
    mision: Seccion;
    vision: Seccion;
    estatutos: Seccion;
    directorio: Directivo[];
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
// BADGE DECORATIVO
// ============================================
function SectionBadge({ text, icon: Icon }: { text: string; icon?: any }) {
    return (
        <div className="mb-6 flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5 text-red-600" />}
            <span className="text-sm font-semibold tracking-[0.15em] text-red-600 uppercase">
                {text}
            </span>
            <div className="ml-4 h-px flex-1 bg-red-200"></div>
        </div>
    );
}


// ============================================
// NUESTRA ORGANIZACIÓN - CON IMAGEN Y ANIMACIONES
// ============================================
function InstitutionalSection({ data }: { data: Seccion }) {
    const imagenUrl =
        data?.imagen ||
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop&q=80';

    return (
        <section
            id="organizacion"
            className="relative overflow-hidden bg-white py-24 md:py-32"
        >
            {/* Elementos decorativos flotantes */}
            <div className="animate-float-slow absolute -top-20 -right-20 h-64 w-64 rounded-full bg-red-600/5 blur-3xl" />
            <div className="animate-float-slow-reverse absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-600/5 blur-3xl" />

            <div className="relative z-10 container mx-auto px-6">
                <div className="mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-20">
                        <FadeInLeft>
                            <div>
                                <SectionBadge
                                    text="Sobre nosotros"
                                    icon={Building2}
                                />
                                <h2 className="mb-6 text-4xl leading-tight font-bold text-gray-900 md:text-5xl lg:text-6xl">
                                    Nuestra{' '}
                                    <span className="relative text-red-600">
                                        Organización
                                        <span className="animate-pulse-slow absolute -bottom-2 left-0 h-1 w-full rounded-full bg-red-600/30" />
                                    </span>
                                </h2>
                                <div className="space-y-4 text-lg leading-relaxed text-gray-600">
                                    {data?.contenido
                                        ?.split('\n')
                                        .map((p: string, i: number) => (
                                            <p
                                                key={i}
                                                className="animate-fade-in"
                                                style={{
                                                    animationDelay: `${i * 200}ms`,
                                                }}
                                            >
                                                {p}
                                            </p>
                                        )) || (
                                        <>
                                            <p className="animate-fade-in">
                                                La Cámara Oficial Española es
                                                una asociación civil sin fines
                                                de lucro reconocida oficialmente
                                                por el Estado Español.
                                            </p>
                                            <p
                                                className="animate-fade-in"
                                                style={{
                                                    animationDelay: '200ms',
                                                }}
                                            >
                                                Nuestra misión es fomentar y
                                                promover las relaciones
                                                comerciales, económicas y
                                                culturales entre España y
                                                Bolivia.
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </FadeInLeft>

                        <FadeInRight>
                            <div className="group relative">
                                <div className="aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl">
                                    <img
                                        src={imagenUrl}
                                        alt="Organización"
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                </div>
                                <div className="animate-spin-slow absolute -top-6 -right-6 h-32 w-32 rounded-full border-2 border-red-600/20" />
                                <div className="animate-float-slow absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-red-600/5" />
                            </div>
                        </FadeInRight>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-slow-reverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(20px) rotate(-5deg); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        .animate-float-slow-reverse {
          animation: float-slow-reverse 8s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
        </section>
    );
}

// ============================================
// NOSOTROS CON ANIMACIONES
// ============================================
function AboutSection({ data }: { data: Seccion }) {
    const imagenUrl =
        data?.imagen ||
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop&q=80';

    return (
        <section className="relative overflow-hidden bg-gray-50 py-24 md:py-32">
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-red-600/30 to-transparent" />

            <div className="relative z-10 container mx-auto px-6">
                <div className="mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-20">
                        <FadeInRight className="order-1 lg:order-2">
                            <div>
                                <SectionBadge
                                    text="Quiénes somos"
                                    icon={Users}
                                />
                                <h2 className="mb-6 text-4xl leading-tight font-bold text-gray-900 md:text-5xl lg:text-6xl">
                                    {data?.titulo || 'Nosotros'}
                                </h2>
                                <div className="space-y-4 text-lg leading-relaxed text-gray-600">
                                    {data?.contenido
                                        ?.split('\n')
                                        .map((p: string, i: number) => (
                                            <p
                                                key={i}
                                                className="animate-fade-in"
                                                style={{
                                                    animationDelay: `${i * 200}ms`,
                                                }}
                                            >
                                                {p}
                                            </p>
                                        )) || (
                                        <>
                                            <p className="animate-fade-in">
                                                Somos una institución que
                                                representa los intereses de
                                                empresas españolas y bolivianas,
                                                facilitando el intercambio
                                                comercial y la inversión.
                                            </p>
                                            <p
                                                className="animate-fade-in"
                                                style={{
                                                    animationDelay: '200ms',
                                                }}
                                            >
                                                Trabajamos para fortalecer los
                                                lazos entre ambos países y
                                                promover el desarrollo económico
                                                bilateral.
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </FadeInRight>

                        <FadeInLeft className="order-2 lg:order-1">
                            <div className="group relative">
                                <div className="aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl">
                                    <img
                                        src={imagenUrl}
                                        alt="Nosotros"
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                </div>
                                <div className="absolute -top-6 -left-6 h-32 w-32 rounded-full border-2 border-red-600/20" />
                            </div>
                        </FadeInLeft>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ============================================
// MISIÓN / VISIÓN CON ANIMACIONES
// ============================================
function PurposeSection({
    mision,
    vision,
}: {
    mision: Seccion;
    vision: Seccion;
}) {
    return (
        <section className="relative overflow-hidden bg-white py-24 md:py-32">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-600/5 via-transparent to-transparent" />

            <div className="relative z-10 container mx-auto px-6">
                <div className="mx-auto max-w-6xl">
                    <FadeInUp>
                        <div className="mb-16 text-center">
                            <SectionBadge text="Propósito" icon={Target} />
                            <h2 className="text-4xl font-bold text-gray-900 md:text-5xl">
                                Propósito{' '}
                                <span className="text-red-600">
                                    Institucional
                                </span>
                            </h2>
                            <p className="animate-pulse-slow mx-auto mt-4 max-w-2xl text-gray-500">
                                Nuestro compromiso con el desarrollo económico y
                                comercial entre España y Bolivia
                            </p>
                        </div>
                    </FadeInUp>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
                        <FadeInLeft delay={200}>
                            <div className="group rounded-2xl border border-gray-100 bg-gray-50 p-8 transition-all duration-500 hover:-translate-y-2 hover:border-red-600/20 hover:shadow-2xl md:p-10">
                                <div className="flex items-start gap-6">
                                    <div className="flex-shrink-0">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600/10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-red-600">
                                            <Target className="h-7 w-7 text-red-600 transition-colors duration-300 group-hover:text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="mb-3 text-2xl font-bold text-gray-900 transition-colors group-hover:text-red-600">
                                            {mision?.titulo || 'Misión'}
                                        </h3>
                                        <p className="leading-relaxed text-gray-600">
                                            {mision?.contenido ||
                                                'Potenciar el desarrollo comercial de empresas españolas y bolivianas, creando oportunidades de negocio y facilitando la internacionalización.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </FadeInLeft>

                        <FadeInRight delay={300}>
                            <div className="group rounded-2xl border border-gray-100 bg-gray-50 p-8 transition-all duration-500 hover:-translate-y-2 hover:border-red-600/20 hover:shadow-2xl md:p-10">
                                <div className="flex items-start gap-6">
                                    <div className="flex-shrink-0">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600/10 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6 group-hover:bg-red-600">
                                            <Eye className="h-7 w-7 text-red-600 transition-colors duration-300 group-hover:text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="mb-3 text-2xl font-bold text-gray-900 transition-colors group-hover:text-red-600">
                                            {vision?.titulo || 'Visión'}
                                        </h3>
                                        <p className="leading-relaxed text-gray-600">
                                            {vision?.contenido ||
                                                'Constituirnos en un referente institucional para las relaciones comerciales entre Bolivia y España, impulsando la inversión y el desarrollo sostenible.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </FadeInRight>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ============================================
// ESTATUTOS CON ANIMACIONES
// ============================================
function StatutesSection({ data }: { data: Seccion }) {
    const imagenUrl =
        data?.imagen ||
        'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=600&fit=crop&q=80';

    return (
        <section className="relative overflow-hidden bg-gray-50 py-24 md:py-32">
            <div className="animate-float-slow absolute -top-40 -right-40 h-80 w-80 rounded-full bg-red-600/5 blur-3xl" />

            <div className="relative z-10 container mx-auto px-6">
                <div className="mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-20">
                        <FadeInLeft>
                            <div>
                                <SectionBadge
                                    text="Documentación"
                                    icon={FileCheck}
                                />
                                <h2 className="mb-6 text-4xl leading-tight font-bold text-gray-900 md:text-5xl lg:text-6xl">
                                    {data?.titulo || 'Estatutos'}
                                </h2>
                                <p className="mb-8 text-lg leading-relaxed text-gray-600">
                                    {data?.contenido ||
                                        'Conoce la normativa que rige nuestra institución y los principios que nos guían en el desarrollo de nuestras actividades.'}
                                </p>
                                {data?.pdf_url && (
                                    <a
                                        href={data.pdf_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group relative inline-flex items-center gap-4 overflow-hidden rounded-full bg-red-600 px-8 py-4 font-medium text-white transition-all duration-300 hover:scale-105 hover:bg-red-700 hover:shadow-xl"
                                    >
                                        <span className="relative z-10 flex items-center gap-4">
                                            <FileText className="h-5 w-5" />
                                            <span>Descargar Estatutos</span>
                                            <Download className="h-5 w-5 transition-transform group-hover:translate-y-1" />
                                        </span>
                                        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-red-500 via-white/20 to-red-500 transition-transform duration-1000 group-hover:translate-x-full" />
                                    </a>
                                )}
                            </div>
                        </FadeInLeft>

                        <FadeInRight>
                            <div className="relative">
                                <div className="aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl">
                                    <img
                                        src={imagenUrl}
                                        alt="Estatutos"
                                        className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                                    />
                                </div>
                                <div className="animate-spin-slow absolute -right-6 -bottom-6 h-32 w-32 rounded-full border-2 border-red-600/20" />
                            </div>
                        </FadeInRight>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ============================================
// DIRECTORIO CON ANIMACIONES
// ============================================
function DirectorySection({ data }: { data: Directivo[] }) {
    return (
        <section
            id="directorio"
            className="relative overflow-hidden bg-white py-24 md:py-32"
        >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-red-600/5 via-transparent to-transparent" />

            <div className="relative z-10 container mx-auto px-6">
                <div className="mx-auto max-w-6xl">
                    <FadeInUp>
                        <div className="mb-16 text-center">
                            <SectionBadge
                                text="Equipo directivo"
                                icon={Users}
                            />
                            <h2 className="text-4xl leading-tight font-bold text-gray-900 md:text-5xl lg:text-6xl">
                                Nuestro{' '}
                                <span className="text-red-600">Directorio</span>
                            </h2>
                            <p className="animate-pulse-slow mx-auto mt-4 max-w-2xl text-gray-500">
                                Profesionales comprometidos con el desarrollo
                                económico y comercial
                            </p>
                        </div>
                    </FadeInUp>

                    {data && data.length > 0 ? (
                        <StaggerGrid columns={3}>
                            {data.map((persona) => (
                                <div
                                    key={persona.id}
                                    className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-500 hover:-translate-y-2 hover:border-red-600/30 hover:shadow-2xl"
                                >
                                    <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                                        {persona.imagen ? (
                                            <img
                                                src={persona.imagen}
                                                alt={persona.nombre}
                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <span className="text-6xl font-bold text-gray-300 transition-transform duration-300 group-hover:scale-110">
                                                    {persona.nombre
                                                        .split(' ')
                                                        .map((n) => n[0])
                                                        .join('')
                                                        .slice(0, 3)}
                                                </span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                    </div>
                                    <div className="p-6">
                                        <h3 className="mb-1 text-lg leading-tight font-bold text-gray-900 transition-colors group-hover:text-red-600">
                                            {persona.nombre}
                                        </h3>
                                        <p className="flex items-center gap-2 text-sm font-semibold text-red-600">
                                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-600" />
                                            {persona.cargo}
                                        </p>
                                        {persona.empresa && (
                                            <p className="mt-2 flex items-center gap-2 text-sm text-gray-400">
                                                <Building2 className="h-4 w-4" />
                                                {persona.empresa}
                                            </p>
                                        )}
                                    </div>
                                    <div className="absolute top-0 right-0 left-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-red-600 to-red-400 transition-transform duration-500 group-hover:scale-x-100" />
                                </div>
                            ))}
                        </StaggerGrid>
                    ) : (
                        <div className="animate-fade-in rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 py-20 text-center">
                            <Users className="animate-float-slow mx-auto mb-4 h-16 w-16 text-gray-300" />
                            <h3 className="mb-2 text-xl font-semibold text-gray-700">
                                Próximamente
                            </h3>
                            <p className="text-gray-400">
                                Estamos actualizando nuestro directorio
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

// ============================================
// PÁGINA PRINCIPAL
// ============================================
export default function CamaraPage({ data }: { data: CamaraData }) {
    return (
        <PublicLayout>
            <SeccionesDelModulo lugar="arriba" />
            <InstitutionalSection data={data?.nuestra_organizacion} />
            <AboutSection data={data?.nosotros} />
            <PurposeSection mision={data?.mision} vision={data?.vision} />
            <StatutesSection data={data?.estatutos} />
            <DirectorySection data={data?.directorio || []} />
            <SeccionesDelModulo lugar="abajo" />
        </PublicLayout>
    );
}
