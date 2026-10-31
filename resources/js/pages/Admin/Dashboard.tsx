import { Deferred, Head, Link, usePage } from '@inertiajs/react';
import {
    BriefcaseBusiness,
    Building2,
    CalendarDays,
    ExternalLink,
    FileStack,
    History,
    Inbox,
    Mail,
    Newspaper,
    Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PublicacionesChart } from '@/components/admin/publicaciones-chart';
import type { PuntoMensual } from '@/components/admin/publicaciones-chart';
import { StatCard } from '@/components/admin/stat-card';
import type { TonoTarjeta } from '@/components/admin/stat-card';
import { Skeleton } from '@/components/ui/skeleton';
import { index as actividades } from '@/routes/admin/actividades';
import { index as bolsaTrabajo } from '@/routes/admin/bolsa-trabajo';
import { index as noticias } from '@/routes/admin/noticias';
import { index as paginas } from '@/routes/admin/paginas';

type Metrica = { valor: number; detalle: string };

type Props = {
    metricas: Record<string, Metrica>;
    publicacionesPorMes: PuntoMensual[];
    actividadReciente?: {
        tabla: string;
        accion: string;
        usuario: string;
        cuando: string;
    }[];
};

const TARJETAS = [
    { clave: 'socios', titulo: 'Socios', icono: Building2, tono: 'esmeralda' },
    { clave: 'noticias', titulo: 'Noticias', icono: Newspaper, tono: 'azul' },
    {
        clave: 'actividades',
        titulo: 'Actividades',
        icono: CalendarDays,
        tono: 'violeta',
    },
    { clave: 'servicios', titulo: 'Servicios', icono: Sparkles, tono: 'ambar' },
    {
        clave: 'solicitudes',
        titulo: 'Solicitudes',
        icono: Inbox,
        tono: 'rojo',
        alerta: true,
    },
    {
        clave: 'mensajes',
        titulo: 'Mensajes',
        icono: Mail,
        tono: 'cian',
        alerta: true,
    },
] as const satisfies readonly {
    clave: string;
    titulo: string;
    icono: LucideIcon;
    tono: TonoTarjeta;
    alerta?: boolean;
}[];

const ATAJOS = [
    { titulo: 'Editar páginas', href: paginas().url, icono: FileStack },
    { titulo: 'Noticias', href: noticias().url, icono: Newspaper },
    { titulo: 'Actividades', href: actividades().url, icono: CalendarDays },
    {
        titulo: 'Bolsa de trabajo',
        href: bolsaTrabajo().url,
        icono: BriefcaseBusiness,
    },
];

function saludo(): string {
    const hora = new Date().getHours();

    if (hora < 13) {
        return 'Buenos días';
    }

    return hora < 20 ? 'Buenas tardes' : 'Buenas noches';
}

/**
 * Bienvenida del panel: saludo, fecha y atajos a lo que más se edita.
 */
function Bienvenida() {
    const nombre = usePage().props.auth.user?.name?.split(' ')[0];
    const hoy = new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });

    return (
        <section className="degradado-marca relative mb-6 overflow-hidden rounded-3xl p-6 text-white shadow-xl shadow-marca/20 md:p-8">
            <div
                aria-hidden
                className="absolute -top-24 -right-16 size-72 rounded-full bg-white/10 blur-2xl"
            />
            <div
                aria-hidden
                className="absolute -bottom-28 left-1/3 size-72 rounded-full bg-indigo-900/30 blur-3xl"
            />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-sm font-medium text-white/80 capitalize">
                        {hoy}
                    </p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
                        {saludo()}
                        {nombre ? `, ${nombre}` : ''} 👋
                    </h1>
                    <p className="mt-2 max-w-xl text-sm text-white/85">
                        Esto es lo que hay publicado en la web de la Cámara y lo
                        que está pendiente de atender.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {ATAJOS.map(({ titulo, href, icono: Icono }) => (
                        <Link
                            key={href}
                            href={href}
                            prefetch
                            className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium ring-1 ring-white/25 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white hover:text-marca"
                        >
                            <Icono className="size-4" />
                            {titulo}
                        </Link>
                    ))}
                    <a
                        href="/"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-gray-950/25 px-4 py-2 text-sm font-medium ring-1 ring-white/20 transition-all hover:-translate-y-0.5 hover:bg-gray-950/40"
                    >
                        <ExternalLink className="size-4" />
                        Ver el sitio
                    </a>
                </div>
            </div>
        </section>
    );
}

const ACCIONES: Record<string, string> = {
    INSERT: 'creó',
    UPDATE: 'actualizó',
    DELETE: 'eliminó',
};

function FeedActividad({
    registros,
}: {
    registros: Props['actividadReciente'];
}) {
    if (!registros?.length) {
        return (
            <p className="py-8 text-center text-sm text-muted-foreground">
                Todavía no hay movimientos registrados.
            </p>
        );
    }

    return (
        <ol className="space-y-3">
            {registros.map((registro, indice) => (
                <li
                    key={`${registro.tabla}-${registro.cuando}-${indice}`}
                    className="flex items-start gap-3 text-sm"
                >
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-marca" />
                    <span className="min-w-0 flex-1">
                        <span className="font-medium">{registro.usuario}</span>{' '}
                        <span className="text-muted-foreground">
                            {ACCIONES[registro.accion] ?? registro.accion} un
                            registro en{' '}
                        </span>
                        <span className="font-medium">{registro.tabla}</span>
                        <span className="block text-xs text-muted-foreground">
                            {registro.cuando}
                        </span>
                    </span>
                </li>
            ))}
        </ol>
    );
}

export default function Dashboard({
    metricas,
    publicacionesPorMes,
    actividadReciente,
}: Props) {
    return (
        <>
            <Head title="Panel" />

            <Bienvenida />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {TARJETAS.map(({ clave, titulo, icono, tono, ...resto }) => {
                    const metrica = metricas[clave];
                    const alerta = 'alerta' in resto && resto.alerta;

                    return (
                        <StatCard
                            key={clave}
                            titulo={titulo}
                            valor={metrica?.valor ?? 0}
                            detalle={metrica?.detalle}
                            icono={icono}
                            tono={tono}
                            destacado={
                                Boolean(alerta) && (metrica?.valor ?? 0) > 0
                            }
                        />
                    );
                })}
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-5">
                <section className="rounded-2xl border bg-card p-5 shadow-sm lg:col-span-3">
                    <PublicacionesChart datos={publicacionesPorMes} />
                </section>

                <section className="rounded-2xl border bg-card p-5 shadow-sm lg:col-span-2">
                    <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                        <span className="flex size-7 items-center justify-center rounded-lg bg-violet-500/12 text-violet-600 dark:text-violet-300">
                            <History className="size-4" />
                        </span>
                        Actividad reciente
                    </h2>

                    <Deferred
                        data="actividadReciente"
                        fallback={
                            <div className="space-y-3">
                                {Array.from({ length: 5 }).map((_, indice) => (
                                    <div
                                        key={indice}
                                        className="flex items-start gap-3"
                                    >
                                        <Skeleton className="mt-1.5 size-1.5 rounded-full" />
                                        <div className="flex-1 space-y-1.5">
                                            <Skeleton className="h-3.5 w-3/4" />
                                            <Skeleton className="h-3 w-20" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        }
                    >
                        <FeedActividad registros={actividadReciente} />
                    </Deferred>
                </section>
            </div>
        </>
    );
}

Dashboard.layout = {
    migas: [{ titulo: 'Panel' }],
};
