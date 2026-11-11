import { Head, router } from '@inertiajs/react';
import {
    Check,
    ExternalLink,
    Globe,
    Mail,
    MessageSquareText,
    Search,
    Trash2,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { Paginacion } from '@/components/admin/data-table';
import type { Paginado } from '@/components/admin/data-table';
import { EmptyState } from '@/components/admin/empty-state';
import { PageHeader } from '@/components/admin/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { destroy, index, update } from '@/routes/admin/comentarios';

type Opcion = { valor: string; etiqueta: string };

type ComentarioFila = {
    id: number;
    nombre: string;
    correo: string;
    web: string | null;
    texto: string;
    estado: string;
    fecha: string | null;
    ip: string | null;
    revisor: string | null;
    en: { tipo: string; titulo: string; url: string } | null;
};

type Props = {
    comentarios: Paginado<ComentarioFila>;
    estados: Opcion[];
    pendientes: number;
    filtros: { buscar?: string; estado?: string };
};

const TONO_ESTADO: Record<string, string> = {
    pendiente:
        'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200',
    aprobado:
        'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200',
    rechazado: 'text-muted-foreground',
};

function iniciales(nombre: string): string {
    return nombre
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((parte) => parte[0]?.toUpperCase() ?? '')
        .join('');
}

function cambiarEstado(comentario: ComentarioFila, estado: string) {
    router.patch(update(comentario.id), { estado }, { preserveScroll: true });
}

export default function ComentariosIndex({
    comentarios,
    estados,
    pendientes,
    filtros,
}: Props) {
    const [buscar, setBuscar] = useState(filtros.buscar ?? '');
    const [aEliminar, setAEliminar] = useState<ComentarioFila | null>(null);

    const filtrar = (cambios: Record<string, string | undefined>) => {
        router.get(
            index().url,
            { buscar, estado: filtros.estado, ...cambios },
            { preserveState: true, replace: true },
        );
    };

    const etiquetaDe = (estado: string) =>
        estados.find((opcion) => opcion.valor === estado)?.etiqueta ?? estado;

    return (
        <>
            <Head title="Comentarios" />

            <PageHeader
                titulo="Comentarios"
                descripcion={
                    pendientes === 1
                        ? 'Hay 1 comentario esperando revisión. Solo los aprobados se ven en el sitio.'
                        : `Hay ${pendientes} comentarios esperando revisión. Solo los aprobados se ven en el sitio.`
                }
            />

            <div className="mb-4 flex flex-wrap items-center gap-2">
                <form
                    onSubmit={(evento) => {
                        evento.preventDefault();
                        filtrar({});
                    }}
                    className="relative flex-1 sm:max-w-xs"
                >
                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={buscar}
                        onChange={(evento) => setBuscar(evento.target.value)}
                        placeholder="Buscar por nombre, correo o texto"
                        className="pl-9"
                        aria-label="Buscar comentarios"
                    />
                </form>

                <Select
                    value={filtros.estado ?? 'todos'}
                    onValueChange={(valor) =>
                        filtrar({
                            estado: valor === 'todos' ? undefined : valor,
                        })
                    }
                >
                    <SelectTrigger className="w-44">
                        <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todos">Todos los estados</SelectItem>
                        {estados.map((opcion) => (
                            <SelectItem key={opcion.valor} value={opcion.valor}>
                                {opcion.etiqueta}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {comentarios.data.length === 0 ? (
                <div className="rounded-xl border bg-card">
                    <EmptyState
                        icono={MessageSquareText}
                        titulo="No hay comentarios"
                        descripcion="Los que dejen los visitantes en noticias y actividades aparecerán aquí para revisarlos."
                    />
                </div>
            ) : (
                <ul className="space-y-3">
                    {comentarios.data.map((comentario) => (
                        <li
                            key={comentario.id}
                            className={cn(
                                'rounded-xl border bg-card p-4',
                                comentario.estado === 'pendiente' &&
                                    'border-amber-200 dark:border-amber-900',
                            )}
                        >
                            <div className="flex flex-wrap items-start gap-3">
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                                    {iniciales(comentario.nombre)}
                                </span>

                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                        <span className="font-medium">
                                            {comentario.nombre}
                                        </span>
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                TONO_ESTADO[comentario.estado],
                                            )}
                                        >
                                            {etiquetaDe(comentario.estado)}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {comentario.fecha}
                                        </span>
                                    </div>

                                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                                        <a
                                            href={`mailto:${comentario.correo}`}
                                            className="inline-flex items-center gap-1 hover:text-foreground"
                                        >
                                            <Mail className="size-3" />
                                            {comentario.correo}
                                        </a>
                                        {comentario.web && (
                                            <a
                                                href={comentario.web}
                                                target="_blank"
                                                rel="noreferrer nofollow"
                                                className="inline-flex items-center gap-1 hover:text-foreground"
                                            >
                                                <Globe className="size-3" />
                                                {comentario.web.replace(
                                                    /^https?:\/\//,
                                                    '',
                                                )}
                                            </a>
                                        )}
                                        {comentario.ip && (
                                            <span>IP {comentario.ip}</span>
                                        )}
                                    </div>

                                    <p className="mt-3 text-sm break-words whitespace-pre-line">
                                        {comentario.texto}
                                    </p>

                                    <p className="mt-3 text-xs text-muted-foreground">
                                        {comentario.en ? (
                                            <>
                                                En{' '}
                                                {comentario.en.tipo.toLowerCase()}
                                                :{' '}
                                                <a
                                                    href={comentario.en.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 font-medium text-foreground underline-offset-4 hover:underline"
                                                >
                                                    {comentario.en.titulo}
                                                    <ExternalLink className="size-3" />
                                                </a>
                                            </>
                                        ) : (
                                            'La publicación ya no existe.'
                                        )}
                                        {comentario.revisor &&
                                            ` · Revisado por ${comentario.revisor}`}
                                    </p>
                                </div>

                                <div className="flex w-full justify-end gap-1 sm:w-auto">
                                    {comentario.estado !== 'aprobado' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                cambiarEstado(
                                                    comentario,
                                                    'aprobado',
                                                )
                                            }
                                        >
                                            <Check className="size-4" />
                                            Aprobar
                                        </Button>
                                    )}
                                    {comentario.estado !== 'rechazado' && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() =>
                                                cambiarEstado(
                                                    comentario,
                                                    'rechazado',
                                                )
                                            }
                                        >
                                            <X className="size-4" />
                                            Rechazar
                                        </Button>
                                    )}
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => setAEliminar(comentario)}
                                        aria-label={`Eliminar el comentario de ${comentario.nombre}`}
                                        className="text-muted-foreground hover:text-destructive"
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <Paginacion
                links={comentarios.links}
                from={comentarios.from}
                to={comentarios.to}
                total={comentarios.total}
            />

            <ConfirmDialog
                abierto={aEliminar !== null}
                onAbiertoChange={(abierto) => !abierto && setAEliminar(null)}
                titulo="Eliminar comentario"
                descripcion={`Se borrará el comentario de «${aEliminar?.nombre ?? ''}». Si ya estaba publicado, dejará de verse en el sitio.`}
                textoConfirmar="Eliminar"
                onConfirmar={() => {
                    if (!aEliminar) {
                        return;
                    }

                    router.delete(destroy(aEliminar.id), {
                        preserveScroll: true,
                        onFinish: () => setAEliminar(null),
                    });
                }}
            />
        </>
    );
}

ComentariosIndex.layout = {
    migas: [{ titulo: 'Comunidad' }, { titulo: 'Comentarios' }],
};
