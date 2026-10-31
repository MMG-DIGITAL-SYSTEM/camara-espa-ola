// resources/js/pages/Public/BolsaTrabajo/Show.tsx
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    BriefcaseBusiness,
    CalendarClock,
    Clock,
    ExternalLink,
    Mail,
    MapPin,
    Users,
    Wallet,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { LogoEmpresa } from '@/components/bolsa-trabajo/logo-empresa';
import type { OfertaResumen } from '@/components/bolsa-trabajo/logo-empresa';
import PublicLayout from '@/layouts/PublicLayout';
import { bolsaTrabajo } from '@/routes';
import { show as perfilDeSocio } from '@/routes/socios';

type OfertaDetalle = OfertaResumen & {
    descripcion: string;
    vacantes: number;
    correo_postulacion: string | null;
    enlace_postulacion: string | null;
};

function Dato({
    icono,
    etiqueta,
    children,
}: {
    icono: ReactNode;
    etiqueta: string;
    children: ReactNode;
}) {
    return (
        <div className="flex items-start gap-3">
            <span className="mt-0.5 text-red-600">{icono}</span>
            <div>
                <dt className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
                    {etiqueta}
                </dt>
                <dd className="text-gray-800">{children}</dd>
            </div>
        </div>
    );
}

export default function OfertaShow({ oferta }: { oferta: OfertaDetalle }) {
    return (
        <PublicLayout>
            <Head title={`${oferta.titulo} · Bolsa de trabajo`} />

            <section className="bg-gray-50 py-12 md:py-16">
                <div className="container mx-auto max-w-5xl px-4 md:px-6">
                    <Link
                        href={bolsaTrabajo().url}
                        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-red-600"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Volver a la bolsa de trabajo
                    </Link>

                    <header className="mb-8 flex flex-col gap-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center md:p-8">
                        <LogoEmpresa
                            empresa={oferta.empresa}
                            tamano="h-20 w-20"
                        />
                        <div className="min-w-0">
                            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
                                {oferta.titulo}
                            </h1>
                            <Link
                                href={perfilDeSocio(oferta.empresa.slug).url}
                                className="mt-1 inline-block font-medium text-red-600 hover:underline"
                            >
                                {oferta.empresa.nombre}
                            </Link>
                            <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium">
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
                        </div>
                    </header>

                    <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
                        <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
                            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                                <BriefcaseBusiness className="h-5 w-5 text-red-600" />
                                Descripción del puesto
                            </h2>
                            {/* Saneado en el servidor al guardar la oferta. */}
                            <div
                                className="prose max-w-none leading-relaxed text-gray-700"
                                dangerouslySetInnerHTML={{
                                    __html: oferta.descripcion,
                                }}
                            />
                        </article>

                        <aside className="space-y-6">
                            <dl className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                                {oferta.ubicacion && (
                                    <Dato
                                        icono={<MapPin className="h-4 w-4" />}
                                        etiqueta="Ubicación"
                                    >
                                        {oferta.ubicacion}
                                    </Dato>
                                )}
                                <Dato
                                    icono={<Users className="h-4 w-4" />}
                                    etiqueta="Vacantes"
                                >
                                    {oferta.vacantes}
                                </Dato>
                                {oferta.salario && (
                                    <Dato
                                        icono={<Wallet className="h-4 w-4" />}
                                        etiqueta="Salario"
                                    >
                                        {oferta.salario}
                                    </Dato>
                                )}
                                {oferta.publicada && (
                                    <Dato
                                        icono={<Clock className="h-4 w-4" />}
                                        etiqueta="Publicada"
                                    >
                                        {oferta.publicada}
                                    </Dato>
                                )}
                                {oferta.fecha_cierre && (
                                    <Dato
                                        icono={
                                            <CalendarClock className="h-4 w-4" />
                                        }
                                        etiqueta="Cierre"
                                    >
                                        {oferta.fecha_cierre}
                                    </Dato>
                                )}
                            </dl>

                            <div className="rounded-2xl bg-red-600 p-6 text-white shadow-sm">
                                <h2 className="text-lg font-bold">
                                    ¿Te interesa?
                                </h2>
                                <p className="mt-1 text-sm text-red-100">
                                    La postulación se gestiona directamente con
                                    la empresa.
                                </p>

                                <div className="mt-5 space-y-3">
                                    {oferta.enlace_postulacion && (
                                        <a
                                            href={oferta.enlace_postulacion}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                                        >
                                            Postular en su sitio
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    )}
                                    {oferta.correo_postulacion && (
                                        <a
                                            href={`mailto:${oferta.correo_postulacion}?subject=${encodeURIComponent(`Postulación: ${oferta.titulo}`)}`}
                                            className="flex items-center justify-center gap-2 rounded-full border border-white/40 px-5 py-2.5 text-sm font-semibold break-all text-white transition-colors hover:bg-white/10"
                                        >
                                            <Mail className="h-4 w-4 shrink-0" />
                                            {oferta.correo_postulacion}
                                        </a>
                                    )}
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
