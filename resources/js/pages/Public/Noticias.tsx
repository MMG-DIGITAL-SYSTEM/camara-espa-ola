// resources/js/pages/Public/Noticias/index.tsx
import { Link } from '@inertiajs/react';
import { Calendar, ChevronRight, Sparkles, Eye } from 'lucide-react';
import { useCallback, useState, useEffect, useRef } from 'react';
import { ContadorMeGusta } from '@/components/public/boton-me-gusta';
import { ImagenSinRecorte } from '@/components/public/imagen-sin-recorte';
import { SeccionesDelModulo } from '@/components/public/secciones-del-modulo';
import PublicLayout from '@/layouts/PublicLayout';
import { textoPlano } from '@/lib/utils';

// ============================================
// TIPOS
// ============================================
interface Categoria {
    id: number;
    nombre: string;
    slug?: string;
}

interface Noticia {
    id: number;
    titulo: string;
    descripcion: string;
    extracto: string | null;
    imagen: string | null;
    fecha_publicacion: string;
    fecha_evento: string | null;
    destacada: boolean;
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
            {Array.isArray(children) &&
                children.map((child, index) => (
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
// COMPONENTES
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
            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium transition-all duration-300 hover:scale-105 ${colorClass}`}
        >
            {children}
        </span>
    );
}

// ============================================
// FILTRO DE CATEGORÍAS
// ============================================
function FiltroCategorias({
    categorias,
    categoriaSeleccionada,
    onCategoriaChange,
}: {
    categorias: Categoria[];
    categoriaSeleccionada: string | null;
    onCategoriaChange: (categoria: string | null) => void;
}) {
    return (
        <div className="mb-8 flex flex-wrap justify-center gap-2">
            <button
                onClick={() => onCategoriaChange(null)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    categoriaSeleccionada === null
                        ? 'bg-red-600 text-white shadow-md'
                        : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-100'
                }`}
            >
                TODO
            </button>
            {categorias.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => onCategoriaChange(cat.nombre)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                        categoriaSeleccionada === cat.nombre
                            ? 'bg-red-600 text-white shadow-md'
                            : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    {cat.nombre}
                </button>
            ))}
        </div>
    );
}

// ============================================
// NOTICIA CARD
// ============================================
function NoticiaCard({ noticia, index }: { noticia: Noticia; index: number }) {
    const [isHovered, setIsHovered] = useState(false);
    const imagenUrl =
        noticia.imagen ||
        'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&h=400&fit=crop&q=80';

    return (
        <div
            className="group animate-fade-in relative"
            style={{ animationDelay: `${index * 100}ms` }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link
                href={`/noticias/${noticia.slug}`}
                className="relative block overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-red-600/30 hover:shadow-2xl"
            >
                <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    <ImagenSinRecorte
                        src={imagenUrl}
                        alt={noticia.titulo}
                        className="transition-transform duration-700 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                    {noticia.destacada && (
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 text-xs font-medium text-white shadow-lg">
                            <Sparkles className="h-3 w-3" />
                            Destacada
                        </div>
                    )}

                    <div
                        className={`absolute top-3 right-3 transition-all duration-500 ${isHovered ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                            <Eye className="h-4 w-4 text-white" />
                        </div>
                    </div>

                    <div className="absolute top-0 right-0 left-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-red-600 to-red-400 transition-transform duration-500 group-hover:scale-x-100" />
                </div>

                <div className="p-5">
                    {noticia.categorias && noticia.categorias.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-1.5">
                            {noticia.categorias.map((cat) => (
                                <TagChip key={cat.id}>{cat.nombre}</TagChip>
                            ))}
                        </div>
                    )}

                    <div className="mb-2 flex items-center gap-1.5 text-sm text-gray-500">
                        <Calendar className="h-4 w-4 text-red-600" />
                        <span className="font-medium">
                            {formatDate(noticia.fecha_publicacion)}
                        </span>
                    </div>

                    <h3 className="mb-2 line-clamp-2 text-lg leading-tight font-bold text-gray-900 transition-colors group-hover:text-red-600">
                        {noticia.titulo}
                    </h3>

                    <p className="line-clamp-3 text-sm leading-relaxed text-gray-600">
                        {noticia.extracto ||
                            truncateText(noticia.descripcion, 150)}
                    </p>

                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                        <div className="flex items-center text-sm font-medium text-red-600 transition-transform duration-300 group-hover:translate-x-1">
                            <span>Leer más</span>
                            <ChevronRight className="ml-1 h-4 w-4" />
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                            <ContadorMeGusta
                                total={noticia.me_gusta_count}
                                leGusta={noticia.le_gusta}
                            />
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}

// ============================================
// PÁGINA PRINCIPAL
// ============================================
export default function NoticiasPage() {
    const [noticias, setNoticias] = useState<Noticia[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<
        string | null
    >(null);
    const [loading, setLoading] = useState(false);
    const [loadingCategorias, setLoadingCategorias] = useState(true);

    // Cargar categorías
    useEffect(() => {
        const cargarCategorias = async () => {
            try {
                const response = await fetch('/api/noticias/categorias');
                const result = await response.json();
                console.log('🏷️ Categorías cargadas:', result);

                if (result.success) {
                    setCategorias(result.data);
                }
            } catch (error) {
                console.error('Error cargando categorías:', error);
            } finally {
                setLoadingCategorias(false);
            }
        };

        cargarCategorias();
    }, []);

    // Función para cargar noticias
    const cargarNoticias = useCallback(async (categoria: string | null) => {
        setLoading(true);

        try {
            const url = categoria
                ? `/api/noticias?categoria=${encodeURIComponent(categoria)}`
                : '/api/noticias';

            console.log('🔍 Cargando noticias con URL:', url);

            const response = await fetch(url);
            const result = await response.json();
            console.log('📦 Noticias cargadas:', result);

            if (result.success) {
                setNoticias(result.data);
            } else {
                setNoticias([]);
            }
        } catch (error) {
            console.error('Error cargando noticias:', error);
            setNoticias([]);
        } finally {
            setLoading(false);
        }
    }, []);

    /*
     * Carga inicial desde la API. Los cargadores ponen su propio estado de
     * «cargando» nada más entrar, y la regla lo lee como un setState
     * síncrono dentro del efecto. Es un uso legítimo: aplazarlo solo para
     * callar al linter añadiría indirección sin cambiar nada observable.
     */
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        cargarNoticias(null);
    }, [cargarNoticias]);

    // Función para cambiar categoría y recargar
    const handleCategoriaChange = (categoria: string | null) => {
        console.log('🔄 Cambiando categoría a:', categoria);
        setCategoriaSeleccionada(categoria);
        cargarNoticias(categoria);
    };

    if (loading && noticias.length === 0) {
        return (
            <PublicLayout>
                <div className="container mx-auto px-6 py-12">
                    <div className="animate-pulse">
                        <div className="mx-auto mb-8 h-12 w-1/3 rounded bg-gray-200" />
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {[...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-64 rounded-xl bg-gray-200"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
            <SeccionesDelModulo lugar="arriba" />

            <section className="bg-white py-16 md:py-20">
                <div className="container mx-auto px-6">
                    <div className="mx-auto max-w-6xl">
                        {/* Contador */}
                        <FadeInUp delay={200}>
                            <div className="mb-6 flex items-center justify-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600/10">
                                    <Sparkles className="h-6 w-6 text-red-600" />
                                </div>
                                <div>
                                    <span className="text-2xl font-bold text-gray-900">
                                        {noticias.length}
                                    </span>
                                    <span className="ml-2 text-gray-500">
                                        noticias encontradas
                                    </span>
                                    {categoriaSeleccionada && (
                                        <span className="ml-1 text-gray-500">
                                            en "{categoriaSeleccionada}"
                                        </span>
                                    )}
                                </div>
                            </div>
                        </FadeInUp>

                        {/* Filtro de categorías */}
                        {!loadingCategorias && categorias.length > 0 && (
                            <FadeInUp delay={300}>
                                <FiltroCategorias
                                    categorias={categorias}
                                    categoriaSeleccionada={
                                        categoriaSeleccionada
                                    }
                                    onCategoriaChange={handleCategoriaChange}
                                />
                            </FadeInUp>
                        )}

                        {/* Grid de noticias */}
                        {loading ? (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {[...Array(6)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-64 animate-pulse rounded-xl bg-gray-200"
                                    />
                                ))}
                            </div>
                        ) : noticias.length > 0 ? (
                            <StaggerGrid columns={3}>
                                {noticias.map((noticia, index) => (
                                    <NoticiaCard
                                        key={noticia.id}
                                        noticia={noticia}
                                        index={index}
                                    />
                                ))}
                            </StaggerGrid>
                        ) : (
                            <FadeInUp>
                                <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white py-16 text-center">
                                    <div className="animate-float mb-4 text-7xl text-gray-300">
                                        📰
                                    </div>
                                    <h3 className="mb-2 text-xl font-semibold text-gray-700">
                                        No hay noticias
                                    </h3>
                                    <p className="text-gray-500">
                                        {categoriaSeleccionada
                                            ? `No hay noticias en la categoría "${categoriaSeleccionada}"`
                                            : 'Próximamente se publicarán nuevas noticias.'}
                                    </p>
                                </div>
                            </FadeInUp>
                        )}
                    </div>
                </div>
            </section>

            <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
            <SeccionesDelModulo lugar="abajo" />
        </PublicLayout>
    );
}
