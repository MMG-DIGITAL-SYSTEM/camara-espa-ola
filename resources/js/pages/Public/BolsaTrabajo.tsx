// resources/js/pages/Public/BolsaTrabajo.tsx
import { Head, Link, router } from '@inertiajs/react';
import {
    BriefcaseBusiness,
    ChevronRight,
    Clock,
    MapPin,
    Search,
} from 'lucide-react';
import { useState } from 'react';
import { BloqueHero } from '@/blocks/componentes/estructura';
import type { Paginado } from '@/components/admin/data-table';
import { LogoEmpresa } from '@/components/bolsa-trabajo/logo-empresa';
import type { OfertaResumen } from '@/components/bolsa-trabajo/logo-empresa';
import { SeccionesDelModulo } from '@/components/public/secciones-del-modulo';
import PublicLayout from '@/layouts/PublicLayout';
import { bolsaTrabajo } from '@/routes';
import { show } from '@/routes/bolsa-trabajo';

const HERO = {
    antetitulo: 'Empleo en las empresas asociadas',
    titulo: 'Bolsa de',
    titulo_destacado: 'trabajo',
    subtitulo: 'Oportunidades publicadas por nuestros socios',
    imagen: 'https://i.pinimg.com/1200x/cd/6b/2b/cd6b2b07b9b964399591a81460354cac.jpg',
    alineacion: 'centro' as const,
};

type Opcion = { valor: string; etiqueta: string };

type Props = {
    ofertas: Paginado<OfertaResumen>;
    opciones: { modalidades: Opcion[]; jornadas: Opcion[] };
    filtros: { buscar?: string; modalidad?: string; jornada?: string };
};

function TarjetaOferta({ oferta }: { oferta: OfertaResumen }) {
    return (
        <Link
            href={show(oferta.id).url}
            className="group flex h-full flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-red-600/20 hover:shadow-xl"
        >
            <div className="flex items-start gap-4">
                <LogoEmpresa empresa={oferta.empresa} />
                <div className="min-w-0">
                    <h2 className="text-lg leading-snug font-bold text-gray-900 group-hover:text-red-600">
                        {oferta.titulo}
                    </h2>
                    <p className="truncate text-sm text-gray-500">
                        {oferta.empresa.nombre}
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs font-medium">
                <span className="rounded-full bg-red-50 px-3 py-1 text-red-700">
                    {oferta.modalidad}
                </span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                    {oferta.jornada}
                </span>
                {oferta.area && (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                        {oferta.area}
                    </span>
                )}
            </div>

            <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-gray-100 pt-4 text-sm text-gray-500">
                {oferta.ubicacion && (
                    <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {oferta.ubicacion}
                    </span>
                )}
                {oferta.publicada && (
                    <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        {oferta.publicada}
                    </span>
                )}
                <ChevronRight className="ml-auto h-4 w-4 text-red-600 transition-transform group-hover:translate-x-1" />
            </div>
        </Link>
    );
}

function Filtros({ opciones, filtros }: Omit<Props, 'ofertas'>) {
    const [buscar, setBuscar] = useState(filtros.buscar ?? '');

    const filtrar = (cambios: Partial<Props['filtros']>) => {
        router.get(
            bolsaTrabajo().url,
            { ...filtros, buscar: buscar || undefined, ...cambios },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const clasesSelect =
        'rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-red-600';

    return (
        <form
            onSubmit={(evento) => {
                evento.preventDefault();
                filtrar({});
            }}
            className="mb-10 flex flex-col gap-3 md:flex-row"
        >
            <label className="relative flex-1">
                <span className="sr-only">Buscar ofertas</span>
                <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                    value={buscar}
                    onChange={(evento) => setBuscar(evento.target.value)}
                    placeholder="Puesto, área, ciudad o empresa"
                    className="w-full rounded-full border border-gray-200 bg-white py-2.5 pr-4 pl-11 text-sm outline-none focus:border-red-600"
                />
            </label>

            <select
                aria-label="Modalidad"
                value={filtros.modalidad ?? ''}
                onChange={(evento) =>
                    filtrar({ modalidad: evento.target.value || undefined })
                }
                className={clasesSelect}
            >
                <option value="">Cualquier modalidad</option>
                {opciones.modalidades.map((opcion) => (
                    <option key={opcion.valor} value={opcion.valor}>
                        {opcion.etiqueta}
                    </option>
                ))}
            </select>

            <select
                aria-label="Jornada"
                value={filtros.jornada ?? ''}
                onChange={(evento) =>
                    filtrar({ jornada: evento.target.value || undefined })
                }
                className={clasesSelect}
            >
                <option value="">Cualquier jornada</option>
                {opciones.jornadas.map((opcion) => (
                    <option key={opcion.valor} value={opcion.valor}>
                        {opcion.etiqueta}
                    </option>
                ))}
            </select>

            <button
                type="submit"
                className="rounded-full bg-red-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
                Buscar
            </button>
        </form>
    );
}

function Paginacion({ links }: { links: Paginado<unknown>['links'] }) {
    if (links.length <= 3) {
        return null;
    }

    return (
        <nav
            aria-label="Paginación"
            className="mt-12 flex flex-wrap justify-center gap-2"
        >
            {links.map((enlace, indice) =>
                enlace.url ? (
                    <Link
                        key={indice}
                        href={enlace.url}
                        preserveScroll
                        className={`min-w-10 rounded-full px-4 py-2 text-center text-sm transition-colors ${
                            enlace.active
                                ? 'bg-red-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-red-50'
                        }`}
                        dangerouslySetInnerHTML={{ __html: enlace.label }}
                    />
                ) : (
                    <span
                        key={indice}
                        className="min-w-10 px-4 py-2 text-center text-sm text-gray-300"
                        dangerouslySetInnerHTML={{ __html: enlace.label }}
                    />
                ),
            )}
        </nav>
    );
}

export default function BolsaTrabajoPage({
    ofertas,
    opciones,
    filtros,
}: Props) {
    const hayFiltros = Boolean(
        filtros.buscar || filtros.modalidad || filtros.jornada,
    );

    return (
        <PublicLayout>
            <Head title="Bolsa de trabajo" />
            <SeccionesDelModulo lugar="arriba" />

            <BloqueHero datos={HERO} />

            <section className="bg-gray-50 py-16 md:py-20">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="mb-10 text-center md:mb-12">
                        <div className="mb-4 flex items-center justify-center gap-3">
                            <span className="h-px w-10 bg-red-600" />
                            <BriefcaseBusiness className="h-5 w-5 text-red-600" />
                            <span className="h-px w-10 bg-red-600" />
                        </div>
                        <h2 className="text-3xl font-bold tracking-wide text-gray-900 uppercase md:text-4xl">
                            Ofertas{' '}
                            <span className="text-red-600">vigentes</span>
                        </h2>
                    </div>

                    <Filtros opciones={opciones} filtros={filtros} />

                    {ofertas.data.length === 0 ? (
                        <div className="mx-auto max-w-lg rounded-2xl border-2 border-dashed border-gray-200 bg-white px-6 py-14 text-center">
                            <BriefcaseBusiness className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                            <h2 className="text-lg font-semibold text-gray-800">
                                {hayFiltros
                                    ? 'Ninguna oferta coincide con tu búsqueda'
                                    : 'Por ahora no hay ofertas publicadas'}
                            </h2>
                            <p className="mt-1 text-gray-500">
                                {hayFiltros
                                    ? 'Prueba con otros términos o quita algún filtro.'
                                    : 'Vuelve pronto: nuestros socios publican nuevas oportunidades con frecuencia.'}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {ofertas.data.map((oferta) => (
                                    <TarjetaOferta
                                        key={oferta.id}
                                        oferta={oferta}
                                    />
                                ))}
                            </div>
                            <Paginacion links={ofertas.links} />
                        </>
                    )}
                </div>
            </section>

            <SeccionesDelModulo lugar="abajo" />
        </PublicLayout>
    );
}
