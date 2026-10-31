import { Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    BriefcaseBusiness,
    Building2,
    LayoutGrid,
} from 'lucide-react';
import { urlDelLogo } from '@/lib/logo';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

const VENTAJAS = [
    {
        icono: Building2,
        titulo: 'Red de socios',
        texto: 'Empresas españolas y bolivianas conectadas en un mismo lugar.',
        tono: 'bg-emerald-400/15 text-emerald-300',
    },
    {
        icono: BriefcaseBusiness,
        titulo: 'Bolsa de trabajo',
        texto: 'Las empresas asociadas publican sus ofertas de empleo.',
        tono: 'bg-amber-400/15 text-amber-300',
    },
    {
        icono: LayoutGrid,
        titulo: 'Panel de gestión',
        texto: 'Noticias, actividades y páginas del sitio, al día.',
        tono: 'bg-sky-400/15 text-sky-300',
    },
];

/**
 * Pantallas de acceso con la identidad del panel: a la izquierda la marca
 * sobre el azul noche de la barra lateral, a la derecha el formulario.
 */
export default function AuthMarcaLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { ajustes } = usePage().props;
    const logo = urlDelLogo(ajustes.sitio_logo);

    return (
        <div className="grid min-h-svh lg:grid-cols-[1.05fr_1fr]">
            {/* ---------- Marca ---------- */}
            <aside className="relative hidden overflow-hidden bg-linear-to-br from-panel-alto to-panel p-12 text-panel-foreground lg:flex lg:flex-col">
                <div
                    aria-hidden
                    className="degradado-marca absolute -top-32 -right-24 size-96 rounded-full opacity-40 blur-3xl"
                />
                <div
                    aria-hidden
                    className="absolute -bottom-40 -left-24 size-112 rounded-full bg-indigo-500/25 blur-3xl"
                />
                <div
                    aria-hidden
                    className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:22px_22px]"
                />

                <Link href={home()} className="relative w-fit">
                    <img
                        src={logo}
                        alt="Cámara Oficial Española de Comercio e Industria en Bolivia"
                        className="h-14 w-auto brightness-0 invert"
                    />
                </Link>

                <div className="relative my-auto max-w-lg py-12">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-white/85 ring-1 ring-white/15">
                        <span className="degradado-marca size-1.5 rounded-full" />
                        Área privada de la Cámara
                    </span>

                    <h2 className="mt-6 text-4xl leading-tight font-bold tracking-tight xl:text-5xl">
                        Conectamos oportunidades entre{' '}
                        <span className="degradado-marca bg-clip-text text-transparent">
                            España y Bolivia
                        </span>
                    </h2>

                    <ul className="mt-10 space-y-5">
                        {VENTAJAS.map(({ icono: Icono, titulo, texto, tono }) => (
                            <li key={titulo} className="flex gap-4">
                                <span
                                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-white/10 ${tono}`}
                                >
                                    <Icono className="size-5" />
                                </span>
                                <span>
                                    <span className="block font-semibold">
                                        {titulo}
                                    </span>
                                    <span className="block text-sm text-panel-muted">
                                        {texto}
                                    </span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                <p className="relative text-xs text-panel-muted">
                    © {new Date().getFullYear()} Cámara Oficial Española de
                    Comercio e Industria en Bolivia
                </p>
            </aside>

            {/* ---------- Formulario ---------- */}
            <main className="fondo-panel relative flex flex-col px-6 py-8 sm:px-10">
                <div className="flex items-center justify-between gap-4">
                    <Link href={home()} className="lg:invisible">
                        <img
                            src={logo}
                            alt="Cámara Oficial Española de Comercio e Industria en Bolivia"
                            className="h-10 w-auto dark:brightness-0 dark:invert"
                        />
                    </Link>
                    <Link
                        href={home()}
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" />
                        Volver al sitio
                    </Link>
                </div>

                <div className="my-auto w-full py-10">
                    <div className="mx-auto w-full max-w-md rounded-3xl border bg-card p-7 shadow-2xl shadow-black/5 sm:p-9 dark:shadow-black/30">
                        <div className="mb-7">
                            <span
                                aria-hidden
                                className="degradado-marca mb-5 block h-1.5 w-12 rounded-full"
                            />
                            <h1 className="text-2xl font-bold tracking-tight">
                                {title}
                            </h1>
                            {description && (
                                <p className="mt-1.5 text-sm text-muted-foreground">
                                    {description}
                                </p>
                            )}
                        </div>

                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
