// resources/js/pages/Public/Socios.tsx
import { Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    ArrowUpDown,
    Building2,
    ChevronDown,
    LayoutGrid,
    List,
    Loader2,
    Mail,
    MapPin,
    Phone,
    RotateCw,
    Search,
    SlidersHorizontal,
    Star,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SeccionesDelModulo } from '@/components/public/secciones-del-modulo';
import PublicLayout from '@/layouts/PublicLayout';

// ============================================
// TIPOS
// ============================================
interface Categoria {
    id: number;
    nombre: string;
    total: number;
}

interface Socio {
    id: number;
    nombre: string;
    slug: string;
    descripcion: string | null;
    logo: string | null;
    categoria: string | null;
    destacado: boolean;
    pagina_web: string | null;
    telefono: string | null;
    correo: string | null;
    direccion: string | null;
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
            <span className="text-3xl font-bold text-gray-400">
                {iniciales}
            </span>
        </div>
    );
}


// ============================================
// FILTROS DEL DIRECTORIO
// ============================================
type Orden = 'relevancia' | 'nombre' | 'nombre_desc' | 'recientes' | 'antiguos';

const ORDENES: { valor: Orden; etiqueta: string }[] = [
    { valor: 'relevancia', etiqueta: 'Recomendados' },
    { valor: 'nombre', etiqueta: 'Nombre (A–Z)' },
    { valor: 'nombre_desc', etiqueta: 'Nombre (Z–A)' },
    { valor: 'recientes', etiqueta: 'Afiliación más reciente' },
    { valor: 'antiguos', etiqueta: 'Mayor antigüedad' },
];

type Filtros = {
    buscar: string;
    categoria: number | null;
    orden: Orden;
};

type Vista = 'cuadricula' | 'lista';

/**
 * Los filtros viven en la URL para que una búsqueda se pueda compartir o
 * recuperar con «atrás». Se leen de la URL de Inertia, que existe también al
 * renderizar en el servidor.
 */
function filtrosDesdeUrl(url: string): Filtros {
    const parametros = new URL(url, 'http://localhost').searchParams;
    const categoria = Number(parametros.get('sector'));
    const orden = parametros.get('orden') as Orden | null;

    return {
        buscar: parametros.get('buscar') ?? '',
        categoria:
            Number.isInteger(categoria) && categoria > 0 ? categoria : null,
        orden: ORDENES.some((o) => o.valor === orden)
            ? (orden as Orden)
            : 'relevancia',
    };
}

function sincronizarUrl(filtros: Filtros) {
    const url = new URL(window.location.href);
    const valores: Record<string, string | null> = {
        buscar: filtros.buscar.trim() || null,
        sector: filtros.categoria ? String(filtros.categoria) : null,
        orden: filtros.orden !== 'relevancia' ? filtros.orden : null,
    };

    Object.entries(valores).forEach(([clave, valor]) =>
        valor
            ? url.searchParams.set(clave, valor)
            : url.searchParams.delete(clave),
    );

    // Se conserva el estado de la entrada: Inertia guarda ahí la página.
    window.history.replaceState(window.history.state, '', url);
}

function useDebounce<T>(valor: T, espera: number): T {
    const [aplicado, setAplicado] = useState(valor);

    useEffect(() => {
        const temporizador = setTimeout(() => setAplicado(valor), espera);

        return () => clearTimeout(temporizador);
    }, [valor, espera]);

    return aplicado;
}

/**
 * Desplegable nativo con el aspecto del resto de la barra: en móvil abre el
 * selector del sistema, que es más cómodo que una lista a medida.
 */
function Desplegable({
    etiqueta,
    icono: Icono,
    valor,
    onCambio,
    activo = false,
    className = '',
    children,
}: {
    etiqueta: string;
    icono: typeof Search;
    valor: string;
    onCambio: (valor: string) => void;
    activo?: boolean;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <label className={`relative block ${className}`}>
            <span className="sr-only">{etiqueta}</span>
            <Icono
                className={`pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 ${
                    activo ? 'text-red-600' : 'text-gray-400'
                }`}
            />
            <select
                value={valor}
                onChange={(evento) => onCambio(evento.target.value)}
                className={`h-12 w-full cursor-pointer appearance-none truncate rounded-xl border pr-10 pl-11 text-sm font-medium transition-colors focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none ${
                    activo
                        ? 'border-red-300 bg-red-50 text-red-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
            >
                {children}
            </select>
            <ChevronDown
                className={`pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 ${
                    activo ? 'text-red-600' : 'text-gray-400'
                }`}
            />
        </label>
    );
}

function BarraDeFiltros({
    buscar,
    onBuscar,
    categorias,
    categoria,
    onCategoria,
    orden,
    onOrden,
    vista,
    onVista,
}: {
    buscar: string;
    onBuscar: (valor: string) => void;
    categorias: Categoria[];
    categoria: number | null;
    onCategoria: (valor: number | null) => void;
    orden: Orden;
    onOrden: (valor: Orden) => void;
    vista: Vista;
    onVista: (valor: Vista) => void;
}) {
    // Solo sectores con socios, salvo el elegido: si llegó por la URL y se
    // quedó vacío, el desplegable debe seguir mostrándolo.
    const sectores = categorias.filter(
        (sector) => sector.total > 0 || sector.id === categoria,
    );

    return (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                    type="search"
                    value={buscar}
                    onChange={(evento) => onBuscar(evento.target.value)}
                    placeholder="Buscar empresa por nombre o actividad…"
                    aria-label="Buscar socios"
                    className="h-12 w-full rounded-xl border border-gray-200 bg-white pr-11 pl-12 text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
                />
                {buscar && (
                    <button
                        type="button"
                        onClick={() => onBuscar('')}
                        aria-label="Borrar búsqueda"
                        className="absolute top-1/2 right-3 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] lg:flex">
                <Desplegable
                    etiqueta="Sector"
                    icono={SlidersHorizontal}
                    valor={categoria ? String(categoria) : ''}
                    onCambio={(valor) =>
                        onCategoria(valor ? Number(valor) : null)
                    }
                    activo={categoria !== null}
                    className="lg:w-64"
                >
                    <option value="">Todos los sectores</option>
                    {sectores.map((sector) => (
                        <option key={sector.id} value={sector.id}>
                            {sector.nombre} ({sector.total})
                        </option>
                    ))}
                </Desplegable>

                <Desplegable
                    etiqueta="Ordenar por"
                    icono={ArrowUpDown}
                    valor={orden}
                    onCambio={(valor) => onOrden(valor as Orden)}
                    className="lg:w-60"
                >
                    {ORDENES.map((opcion) => (
                        <option key={opcion.valor} value={opcion.valor}>
                            {opcion.etiqueta}
                        </option>
                    ))}
                </Desplegable>

                <div
                    role="group"
                    aria-label="Tipo de vista"
                    className="hidden h-12 shrink-0 items-center rounded-xl border border-gray-200 bg-white p-1 sm:flex"
                >
                    {(
                        [
                            ['cuadricula', LayoutGrid, 'Ver en cuadrícula'],
                            ['lista', List, 'Ver en lista'],
                        ] as const
                    ).map(([valor, Icono, etiqueta]) => (
                        <button
                            key={valor}
                            type="button"
                            onClick={() => onVista(valor)}
                            aria-label={etiqueta}
                            aria-pressed={vista === valor}
                            className={`flex h-full w-10 items-center justify-center rounded-lg transition-colors ${
                                vista === valor
                                    ? 'bg-red-600 text-white'
                                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                        >
                            <Icono className="h-4 w-4" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ============================================
// TARJETAS DE SOCIO
// ============================================
function LogoDeSocio({
    socio,
    className,
}: {
    socio: Socio;
    className: string;
}) {
    return (
        <div
            className={`relative flex items-center justify-center overflow-hidden bg-linear-to-br from-gray-50 to-white ${className}`}
        >
            {socio.logo ? (
                <img
                    src={socio.logo}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-contain p-5 transition-transform duration-500 group-hover:scale-105"
                />
            ) : (
                <LogoPlaceholder nombre={socio.nombre} />
            )}
        </div>
    );
}

function DatosDeContacto({ socio }: { socio: Socio }) {
    const datos = [
        socio.telefono && {
            icono: Phone,
            texto: socio.telefono,
            href: `tel:${socio.telefono.replace(/[^\d+]/g, '')}`,
        },
        socio.correo && {
            icono: Mail,
            texto: socio.correo,
            href: `mailto:${socio.correo}`,
        },
    ].filter(Boolean) as { icono: typeof Phone; texto: string; href: string }[];

    if (datos.length === 0) {
        return null;
    }

    return (
        <ul className="space-y-1.5 text-sm text-gray-600">
            {datos.map(({ icono: Icono, texto, href }) => (
                <li key={href}>
                    {/* Por encima del enlace que cubre la tarjeta. */}
                    <a
                        href={href}
                        className="relative z-10 inline-flex max-w-full items-center gap-2 transition-colors hover:text-red-600"
                    >
                        <Icono className="h-4 w-4 shrink-0 text-red-600" />
                        <span className="truncate">{texto}</span>
                    </a>
                </li>
            ))}
        </ul>
    );
}

function EtiquetaSector({ nombre }: { nombre: string }) {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold tracking-wide text-red-700 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
            {nombre}
        </span>
    );
}

function EtiquetaDestacado() {
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-900/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            <Star className="h-3 w-3 fill-red-500 text-red-500" />
            Destacado
        </span>
    );
}

/**
 * Toda la tarjeta lleva al perfil mediante un enlace estirado sobre ella; los
 * enlaces de contacto quedan por encima para poder llamar o escribir directo.
 */
function TarjetaSocio({ socio }: { socio: Socio }) {
    return (
        <article className="group animate-fade-in relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 focus-within:ring-2 focus-within:ring-red-500 hover:-translate-y-1 hover:border-red-600/30 hover:shadow-xl">
            <div className="absolute top-0 right-0 left-0 z-10 h-1 origin-left scale-x-0 bg-linear-to-r from-red-600 to-red-400 transition-transform duration-500 group-hover:scale-x-100" />

            <div className="relative">
                <LogoDeSocio socio={socio} className="aspect-[16/10]" />
                {socio.destacado && (
                    <div className="absolute top-3 left-3">
                        <EtiquetaDestacado />
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col gap-3 border-t border-gray-100 p-5">
                {socio.categoria && (
                    <div>
                        <EtiquetaSector nombre={socio.categoria} />
                    </div>
                )}

                <h3 className="line-clamp-2 text-base leading-snug font-bold text-gray-900 transition-colors group-hover:text-red-600">
                    <Link
                        href={`/socios/${socio.slug}`}
                        className="after:absolute after:inset-0 focus:outline-none"
                    >
                        {socio.nombre}
                    </Link>
                </h3>

                {socio.descripcion && (
                    <p className="line-clamp-3 text-sm leading-relaxed text-gray-500">
                        {socio.descripcion}
                    </p>
                )}

                <div className="mt-auto flex flex-col gap-4 pt-2">
                    <DatosDeContacto socio={socio} />

                    <span className="flex items-center gap-1 text-sm font-semibold text-red-600">
                        Ver perfil
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                </div>
            </div>
        </article>
    );
}

function FilaSocio({ socio }: { socio: Socio }) {
    return (
        <article className="group animate-fade-in relative flex items-stretch overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 focus-within:ring-2 focus-within:ring-red-500 hover:border-red-600/30 hover:shadow-lg">
            <div className="absolute top-0 bottom-0 left-0 z-10 w-1 origin-top scale-y-0 bg-red-600 transition-transform duration-300 group-hover:scale-y-100" />

            <LogoDeSocio
                socio={socio}
                className="w-32 shrink-0 border-r border-gray-100 md:w-48"
            />

            <div className="flex min-w-0 flex-1 flex-col gap-4 p-5 md:flex-row md:items-center md:gap-8">
                <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        {socio.categoria && (
                            <EtiquetaSector nombre={socio.categoria} />
                        )}
                        {socio.destacado && <EtiquetaDestacado />}
                    </div>
                    <h3 className="text-lg leading-snug font-bold text-gray-900 transition-colors group-hover:text-red-600">
                        <Link
                            href={`/socios/${socio.slug}`}
                            className="after:absolute after:inset-0 focus:outline-none"
                        >
                            {socio.nombre}
                        </Link>
                    </h3>
                    {socio.descripcion && (
                        <p className="line-clamp-2 text-sm leading-relaxed text-gray-500">
                            {socio.descripcion}
                        </p>
                    )}
                </div>

                <div className="flex shrink-0 flex-col gap-3 md:w-64">
                    <DatosDeContacto socio={socio} />
                    {socio.direccion && (
                        <p className="flex items-start gap-2 text-sm text-gray-500">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                            <span className="line-clamp-2">
                                {socio.direccion}
                            </span>
                        </p>
                    )}
                </div>

                <ArrowRight className="hidden h-5 w-5 shrink-0 text-gray-300 transition-all group-hover:translate-x-1 group-hover:text-red-600 md:block" />
            </div>
        </article>
    );
}

function EsqueletoTarjetas({ vista }: { vista: Vista }) {
    if (vista === 'lista') {
        return (
            <div className="space-y-4">
                {[...Array(4)].map((_, indice) => (
                    <div
                        key={indice}
                        className="flex h-36 overflow-hidden rounded-2xl border border-gray-100 bg-white"
                    >
                        <div className="w-32 animate-pulse bg-gray-100 md:w-48" />
                        <div className="flex-1 space-y-3 p-5">
                            <div className="h-5 w-24 animate-pulse rounded-full bg-gray-100" />
                            <div className="h-5 w-2/3 animate-pulse rounded bg-gray-200" />
                            <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, indice) => (
                <div
                    key={indice}
                    className="overflow-hidden rounded-2xl border border-gray-100 bg-white"
                >
                    <div className="aspect-[16/10] animate-pulse bg-gray-100" />
                    <div className="space-y-3 border-t border-gray-100 p-5">
                        <div className="h-5 w-24 animate-pulse rounded-full bg-gray-100" />
                        <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
                        <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
                        <div className="h-4 w-5/6 animate-pulse rounded bg-gray-100" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ============================================
// PÁGINA PRINCIPAL
// ============================================
type Respuesta = {
    success: boolean;
    data: Socio[];
    meta: { current_page: number; last_page: number; total: number };
};

export default function SociosPage() {
    const { url } = usePage();
    const [filtrosIniciales] = useState(() => filtrosDesdeUrl(url));

    const [buscar, setBuscar] = useState(filtrosIniciales.buscar);
    const [categoria, setCategoria] = useState(filtrosIniciales.categoria);
    const [orden, setOrden] = useState(filtrosIniciales.orden);
    const [vista, setVista] = useState<Vista>('cuadricula');
    const buscarAplicado = useDebounce(buscar, 350);

    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [socios, setSocios] = useState<Socio[]>([]);
    const [pagina, setPagina] = useState(1);
    const [ultimaPagina, setUltimaPagina] = useState(1);
    const [total, setTotal] = useState(0);
    const [cargando, setCargando] = useState(true);
    const [cargandoMas, setCargandoMas] = useState(false);
    const [error, setError] = useState(false);
    const [intento, setIntento] = useState(0);
    const peticionRef = useRef<AbortController | null>(null);

    const pedir = useCallback(
        async (numeroPagina: number): Promise<Respuesta> => {
            peticionRef.current?.abort();
            const controlador = new AbortController();
            peticionRef.current = controlador;

            const parametros = new URLSearchParams({
                page: String(numeroPagina),
            });

            if (buscarAplicado.trim()) {
                parametros.set('buscar', buscarAplicado.trim());
            }

            if (categoria) {
                parametros.set('categoria', String(categoria));
            }

            if (orden !== 'relevancia') {
                parametros.set('orden', orden);
            }

            const respuesta = await fetch(`/api/socios?${parametros}`, {
                signal: controlador.signal,
                headers: { Accept: 'application/json' },
            });

            if (!respuesta.ok) {
                throw new Error(`HTTP ${respuesta.status}`);
            }

            return respuesta.json();
        },
        [buscarAplicado, categoria, orden],
    );

    useEffect(() => {
        fetch('/api/socios/categorias', {
            headers: { Accept: 'application/json' },
        })
            .then((respuesta) => respuesta.json())
            .then((resultado) => {
                if (resultado.success) {
                    setCategorias(resultado.data);
                }
            })
            .catch(() => {
                // Sin sectores el directorio sigue funcionando con la búsqueda.
            });
    }, []);

    /*
     * Cada cambio de filtro vuelve a la primera página. Marcar «cargando» al
     * entrar es un setState síncrono dentro del efecto, pero es justo lo que
     * se quiere: la cuadrícula anterior se sustituye por el esqueleto.
     */
    useEffect(() => {
        sincronizarUrl({ buscar: buscarAplicado, categoria, orden });
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCargando(true);
        setError(false);

        pedir(1)
            .then((resultado) => {
                setSocios(resultado.data);
                setPagina(resultado.meta.current_page);
                setUltimaPagina(resultado.meta.last_page);
                setTotal(resultado.meta.total);
                setCargando(false);
            })
            .catch((excepcion: Error) => {
                if (excepcion.name !== 'AbortError') {
                    setError(true);
                    setCargando(false);
                }
            });
    }, [pedir, buscarAplicado, categoria, orden, intento]);

    const cargarMas = () => {
        setCargandoMas(true);

        pedir(pagina + 1)
            .then((resultado) => {
                setSocios((anteriores) => [...anteriores, ...resultado.data]);
                setPagina(resultado.meta.current_page);
                setUltimaPagina(resultado.meta.last_page);
            })
            .catch(() => {
                // Se puede volver a pulsar el botón.
            })
            .finally(() => setCargandoMas(false));
    };

    const nombreSector = categorias.find((c) => c.id === categoria)?.nombre;
    const hayFiltros = buscarAplicado.trim() !== '' || categoria !== null;

    const limpiarFiltros = () => {
        setBuscar('');
        setCategoria(null);
    };

    return (
        <PublicLayout>
            <SeccionesDelModulo lugar="arriba" />

            <section
                id="socios"
                className="scroll-mt-20 bg-gray-50 py-14 md:py-20"
            >
                <div className="container mx-auto px-6">
                    <FadeInUp>
                        <div className="mb-10 flex flex-col gap-2 md:mb-12">
                            <div className="flex items-center gap-3">
                                <span className="h-px w-10 bg-red-600" />
                                <span className="text-sm font-medium tracking-[0.2em] text-red-600 uppercase">
                                    Directorio
                                </span>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
                                Encuentra a nuestros{' '}
                                <span className="text-red-600">socios</span>
                            </h2>
                            <p className="max-w-2xl text-gray-500">
                                Busca por nombre o filtra por sector para
                                contactar con las empresas que forman parte de
                                la Cámara.
                            </p>
                        </div>
                    </FadeInUp>

                    <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
                        <BarraDeFiltros
                            buscar={buscar}
                            onBuscar={setBuscar}
                            categorias={categorias}
                            categoria={categoria}
                            onCategoria={setCategoria}
                            orden={orden}
                            onOrden={setOrden}
                            vista={vista}
                            onVista={setVista}
                        />
                    </div>

                    <div
                        className="mb-6 flex min-h-8 flex-wrap items-center justify-between gap-3"
                        aria-live="polite"
                    >
                        <p className="text-sm text-gray-600">
                            {cargando ? (
                                'Buscando empresas…'
                            ) : (
                                <>
                                    <span className="font-bold text-gray-900">
                                        {total}
                                    </span>{' '}
                                    {total === 1
                                        ? 'empresa encontrada'
                                        : 'empresas encontradas'}
                                    {nombreSector && (
                                        <>
                                            {' '}
                                            en{' '}
                                            <span className="font-semibold text-gray-900">
                                                {nombreSector}
                                            </span>
                                        </>
                                    )}
                                    {buscarAplicado.trim() && (
                                        <>
                                            {' '}
                                            para «
                                            <span className="font-semibold text-gray-900">
                                                {buscarAplicado.trim()}
                                            </span>
                                            »
                                        </>
                                    )}
                                </>
                            )}
                        </p>

                        {hayFiltros && (
                            <button
                                type="button"
                                onClick={limpiarFiltros}
                                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                            >
                                <X className="h-4 w-4" />
                                Limpiar filtros
                            </button>
                        )}
                    </div>

                    {cargando ? (
                        <EsqueletoTarjetas vista={vista} />
                    ) : error ? (
                        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center">
                            <Building2 className="mx-auto mb-4 h-14 w-14 text-gray-300" />
                            <h3 className="text-lg font-semibold text-gray-800">
                                No pudimos cargar el directorio
                            </h3>
                            <p className="mt-1 text-gray-500">
                                Revisa tu conexión e inténtalo de nuevo.
                            </p>
                            <button
                                type="button"
                                onClick={() => setIntento((n) => n + 1)}
                                className="mt-6 inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-red-700"
                            >
                                <RotateCw className="h-4 w-4" />
                                Reintentar
                            </button>
                        </div>
                    ) : socios.length === 0 ? (
                        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white px-6 py-16 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                                <Search className="h-7 w-7 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">
                                {hayFiltros
                                    ? 'Ninguna empresa coincide con tu búsqueda'
                                    : 'Todavía no hay socios publicados'}
                            </h3>
                            {hayFiltros && (
                                <>
                                    <p className="mt-1 text-gray-500">
                                        Prueba con otro nombre o con otro
                                        sector.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={limpiarFiltros}
                                        className="mt-6 inline-flex items-center gap-2 rounded-full border border-red-200 px-6 py-2.5 font-medium text-red-600 transition-colors hover:bg-red-50"
                                    >
                                        Ver todos los socios
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <>
                            {vista === 'cuadricula' ? (
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {socios.map((socio) => (
                                        <TarjetaSocio
                                            key={socio.id}
                                            socio={socio}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {socios.map((socio) => (
                                        <FilaSocio
                                            key={socio.id}
                                            socio={socio}
                                        />
                                    ))}
                                </div>
                            )}

                            <div className="mt-12 flex flex-col items-center gap-4">
                                <p className="text-sm text-gray-500">
                                    Mostrando {socios.length} de {total}{' '}
                                    empresas
                                </p>
                                <div className="h-1 w-48 overflow-hidden rounded-full bg-gray-200">
                                    <div
                                        className="h-full rounded-full bg-red-600 transition-all duration-500"
                                        style={{
                                            width: `${(socios.length / Math.max(total, 1)) * 100}%`,
                                        }}
                                    />
                                </div>
                                {pagina < ultimaPagina && (
                                    <button
                                        type="button"
                                        onClick={cargarMas}
                                        disabled={cargandoMas}
                                        className="group mt-2 inline-flex items-center gap-2 rounded-full bg-red-600 px-8 py-3 font-medium text-white transition-all duration-300 hover:bg-red-700 hover:shadow-xl disabled:cursor-wait disabled:opacity-70"
                                    >
                                        {cargandoMas ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Cargando…
                                            </>
                                        ) : (
                                            <>
                                                Ver más empresas
                                                <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </section>

            <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out both;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in { animation: none; }
        }
      `}</style>
            <SeccionesDelModulo lugar="abajo" />
        </PublicLayout>
    );
}
