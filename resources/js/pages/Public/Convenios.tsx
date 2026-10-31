// resources/js/pages/Public/Convenios.tsx
import { Head } from '@inertiajs/react';
import { ChevronRight, Handshake, Mail, RotateCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BloqueHero } from '@/blocks/componentes/estructura';
import { SeccionesDelModulo } from '@/components/public/secciones-del-modulo';
import PublicLayout from '@/layouts/PublicLayout';
import { peticionJson } from '@/lib/http';

const HERO = {
    antetitulo: 'Ventajas para nuestros asociados',
    titulo: 'Convenios',
    titulo_destacado: 'exclusivos',
    subtitulo: 'para nuestros socios',
    imagen: 'https://i.pinimg.com/1200x/cd/6b/2b/cd6b2b07b9b964399591a81460354cac.jpg',
    alineacion: 'centro' as const,
};

type Convenio = {
    id: number;
    nombre: string;
    descripcion: string;
    imagen: string | null;
    correo_contacto: string | null;
    pdf_url: string | null;
};

// ============================================
// TARJETA
// ============================================

/**
 * La imagen es la pieza promocional y lleva texto dentro: se muestra entera
 * (object-contain) en lugar de recortarla para llenar el hueco.
 */
function ConvenioCard({ convenio }: { convenio: Convenio }) {
    const [imagenRota, setImagenRota] = useState(false);
    const conImagen = convenio.imagen && !imagenRota;

    return (
        <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-red-600/20 hover:shadow-xl">
            <div className="relative flex aspect-4/3 items-center justify-center overflow-hidden bg-gray-50">
                {conImagen ? (
                    <img
                        src={convenio.imagen!}
                        alt={convenio.nombre}
                        loading="lazy"
                        onError={() => setImagenRota(true)}
                        className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-3 px-6 text-center text-gray-400">
                        <Handshake className="h-12 w-12" />
                        <span className="text-sm font-medium">
                            {convenio.nombre}
                        </span>
                    </div>
                )}
                <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-linear-to-r from-red-600 to-red-400 transition-transform duration-500 group-hover:scale-x-100" />
            </div>

            <div className="flex flex-1 flex-col gap-4 p-6">
                <h2 className="text-lg leading-snug font-bold text-gray-900">
                    {convenio.nombre}
                </h2>

                <p className="text-sm leading-relaxed whitespace-pre-line text-gray-600">
                    {convenio.descripcion}
                </p>

                {convenio.correo_contacto && (
                    <div className="text-sm">
                        <p className="font-semibold text-gray-900">
                            Más información:
                        </p>
                        <a
                            href={`mailto:${convenio.correo_contacto}`}
                            className="mt-1 inline-flex items-center gap-2 break-all text-red-600 transition-colors hover:text-red-700 hover:underline"
                        >
                            <Mail className="h-4 w-4 shrink-0" />
                            {convenio.correo_contacto}
                        </a>
                    </div>
                )}

                {convenio.pdf_url && (
                    <div className="mt-auto border-t border-gray-100 pt-4">
                        <a
                            href={convenio.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/enlace inline-flex items-center gap-1 text-sm font-semibold text-red-600 transition-colors hover:text-red-700"
                        >
                            Detalle del convenio
                            <ChevronRight className="h-4 w-4 transition-transform group-hover/enlace:translate-x-1" />
                            <span className="sr-only">
                                {' '}
                                de {convenio.nombre} (PDF, se abre en una
                                pestaña nueva)
                            </span>
                        </a>
                    </div>
                )}
            </div>
        </article>
    );
}

// ============================================
// LISTADO
// ============================================
function ConveniosGrid({ convenios }: { convenios: Convenio[] }) {
    return (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {convenios.map((convenio) => (
                <ConvenioCard key={convenio.id} convenio={convenio} />
            ))}
        </div>
    );
}

function Esqueleto() {
    return (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, indice) => (
                <div
                    key={indice}
                    className="overflow-hidden rounded-2xl border border-gray-100 bg-white"
                >
                    <div className="aspect-4/3 animate-pulse bg-gray-100" />
                    <div className="space-y-3 p-6">
                        <div className="h-5 w-2/3 animate-pulse rounded bg-gray-200" />
                        <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
                        <div className="h-4 w-5/6 animate-pulse rounded bg-gray-100" />
                        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ============================================
// PÁGINA
// ============================================
export default function ConveniosPage() {
    const [convenios, setConvenios] = useState<Convenio[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(false);
    const [intento, setIntento] = useState(0);

    useEffect(() => {
        let vigente = true;

        peticionJson<{ data: Convenio[] }>('/api/convenios', 'GET')
            .then((respuesta) => {
                if (vigente) {
                    setConvenios(respuesta.data);
                    setError(false);
                }
            })
            .catch(() => vigente && setError(true))
            .finally(() => vigente && setCargando(false));

        return () => {
            vigente = false;
        };
    }, [intento]);

    const reintentar = () => {
        setCargando(true);
        setError(false);
        setIntento((n) => n + 1);
    };

    return (
        <PublicLayout>
            <Head title="Convenios" />
            <SeccionesDelModulo lugar="arriba" />

            {/* Mismo hero con imagen que la portada y La Cámara. */}
            <BloqueHero datos={HERO} />

            <section className="bg-gray-50 py-16 md:py-20">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="mb-10 text-center md:mb-12">
                        <div className="mb-4 flex items-center justify-center gap-3">
                            <span className="h-px w-10 bg-red-600" />
                            <Handshake className="h-5 w-5 text-red-600" />
                            <span className="h-px w-10 bg-red-600" />
                        </div>
                        <h2 className="text-3xl font-bold tracking-wide text-gray-900 uppercase md:text-4xl">
                            Nuestros{' '}
                            <span className="text-red-600">convenios</span>
                        </h2>
                    </div>

                    {cargando ? (
                        <Esqueleto />
                    ) : error ? (
                        <div className="mx-auto max-w-lg rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center">
                            <h2 className="text-lg font-semibold text-gray-800">
                                No pudimos cargar los convenios
                            </h2>
                            <p className="mt-1 text-gray-500">
                                Revisa tu conexión e inténtalo de nuevo.
                            </p>
                            <button
                                type="button"
                                onClick={reintentar}
                                className="mt-6 inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-red-700"
                            >
                                <RotateCw className="h-4 w-4" />
                                Reintentar
                            </button>
                        </div>
                    ) : convenios.length === 0 ? (
                        <div className="mx-auto max-w-lg rounded-2xl border-2 border-dashed border-gray-200 bg-white px-6 py-14 text-center">
                            <Handshake className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                            <h2 className="text-lg font-semibold text-gray-800">
                                Pronto publicaremos nuevos convenios
                            </h2>
                            <p className="mt-1 text-gray-500">
                                Por ahora no hay convenios vigentes.
                            </p>
                        </div>
                    ) : (
                        <ConveniosGrid convenios={convenios} />
                    )}
                </div>
            </section>

            <SeccionesDelModulo lugar="abajo" />
        </PublicLayout>
    );
}
