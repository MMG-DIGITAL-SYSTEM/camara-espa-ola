import { Head, router, useForm } from '@inertiajs/react';
import {
    Building2,
    CheckCircle2,
    Eye,
    Inbox,
    Search,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { DataTable, Paginacion } from '@/components/admin/data-table';
import type { Columna, Paginado } from '@/components/admin/data-table';
import { EmptyState } from '@/components/admin/empty-state';
import { PageHeader } from '@/components/admin/page-header';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { peticionJson } from '@/lib/http';
import { cn } from '@/lib/utils';
import {
    aprobar,
    destroy,
    index,
    show,
    update,
} from '@/routes/admin/solicitudes';

type Opcion = { valor: string; etiqueta: string };

type SolicitudFila = {
    id: number;
    empresa: string;
    nit: string | null;
    correo: string;
    ciudad: string | null;
    estado: string;
    recibida: string | null;
};

type SolicitudCompleta = {
    id: number;
    nombre_razon_social: string;
    representante_legal: string;
    escritura_constitucion: string | null;
    fecha: string | null;
    nit: string | null;
    direccion: string;
    ciudad: string | null;
    telefono: string;
    fax: string | null;
    casilla: string | null;
    correo_electronico: string;
    pagina_web: string | null;
    representante_camara: string;
    cargo: string | null;
    servicios_productos: string | null;
    estado: string;
    comentarios: string | null;
    recibida: string | null;
    revisor: string | null;
    fecha_revision: string | null;
    socio: { id: number; nombre: string; url: string } | null;
};

type Props = {
    solicitudes: Paginado<SolicitudFila>;
    estados: Opcion[];
    pendientes: number;
    filtros: { buscar?: string; estado?: string };
};

const APROBADA = 'aprobada';

/** Color de cada estado: lo pendiente salta a la vista, lo resuelto no. */
const TONO_ESTADO: Record<string, string> = {
    pendiente:
        'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200',
    en_revision:
        'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-200',
    requiere_cambios:
        'border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-200',
    aprobada:
        'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200',
    rechazada: 'text-muted-foreground',
};

function EstadoBadge({
    estado,
    estados,
}: {
    estado: string;
    estados: Opcion[];
}) {
    return (
        <Badge variant="outline" className={cn(TONO_ESTADO[estado])}>
            {estados.find((opcion) => opcion.valor === estado)?.etiqueta ??
                estado}
        </Badge>
    );
}

function Dato({
    etiqueta,
    valor,
    ancho = false,
}: {
    etiqueta: string;
    valor: React.ReactNode;
    ancho?: boolean;
}) {
    return (
        <div className={cn('min-w-0', ancho && 'sm:col-span-2')}>
            <dt className="text-xs text-muted-foreground">{etiqueta}</dt>
            <dd className="text-sm break-words whitespace-pre-line">
                {valor || '—'}
            </dd>
        </div>
    );
}

function Revision({
    solicitud,
    estados,
    onCerrar,
}: {
    solicitud: SolicitudCompleta;
    estados: Opcion[];
    onCerrar: () => void;
}) {
    const aprobada = solicitud.estado === APROBADA;
    const [aprobando, setAprobando] = useState(false);

    const formulario = useForm({
        estado: aprobada ? 'pendiente' : solicitud.estado,
        comentarios: solicitud.comentarios ?? '',
    });

    return (
        <div className="space-y-5">
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                <Dato
                    etiqueta="Razón social"
                    valor={solicitud.nombre_razon_social}
                    ancho
                />
                <Dato etiqueta="NIT" valor={solicitud.nit} />
                <Dato
                    etiqueta="Escritura de constitución"
                    valor={
                        [solicitud.escritura_constitucion, solicitud.fecha]
                            .filter(Boolean)
                            .join(' · ') || null
                    }
                />
                <Dato
                    etiqueta="Representante legal"
                    valor={solicitud.representante_legal}
                />
                <Dato
                    etiqueta="Representante ante la Cámara"
                    valor={[solicitud.representante_camara, solicitud.cargo]
                        .filter(Boolean)
                        .join(' — ')}
                />
                <Dato
                    etiqueta="Correo"
                    valor={
                        <a
                            href={`mailto:${solicitud.correo_electronico}`}
                            className="text-primary underline-offset-4 hover:underline"
                        >
                            {solicitud.correo_electronico}
                        </a>
                    }
                />
                <Dato
                    etiqueta="Teléfono / Fax"
                    valor={[solicitud.telefono, solicitud.fax]
                        .filter(Boolean)
                        .join(' · ')}
                />
                <Dato
                    etiqueta="Dirección"
                    valor={[solicitud.direccion, solicitud.ciudad]
                        .filter(Boolean)
                        .join(', ')}
                />
                <Dato etiqueta="Casilla" valor={solicitud.casilla} />
                <Dato
                    etiqueta="Página web"
                    valor={
                        solicitud.pagina_web && (
                            <a
                                href={solicitud.pagina_web}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary underline-offset-4 hover:underline"
                            >
                                {solicitud.pagina_web}
                            </a>
                        )
                    }
                    ancho
                />
                <Dato
                    etiqueta="Servicios y productos"
                    valor={solicitud.servicios_productos}
                    ancho
                />
            </dl>

            <p className="text-xs text-muted-foreground">
                Recibida el {solicitud.recibida}
                {solicitud.revisor &&
                    ` · Última revisión de ${solicitud.revisor} el ${solicitud.fecha_revision}`}
            </p>

            <Separator />

            {aprobada ? (
                <div className="space-y-3">
                    <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                        <div>
                            Solicitud aprobada.
                            {solicitud.socio && (
                                <>
                                    {' '}
                                    Socio creado:{' '}
                                    <a
                                        href={solicitud.socio.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="font-medium underline underline-offset-4"
                                    >
                                        {solicitud.socio.nombre}
                                    </a>
                                    . Complétalo en «Socios» (logo, rubro…).
                                </>
                            )}
                        </div>
                    </div>
                    {solicitud.comentarios && (
                        <Dato
                            etiqueta="Notas internas"
                            valor={solicitud.comentarios}
                        />
                    )}
                    <DialogFooter>
                        <Button type="button" onClick={onCerrar}>
                            Cerrar
                        </Button>
                    </DialogFooter>
                </div>
            ) : (
                <form
                    onSubmit={(evento) => {
                        evento.preventDefault();
                        formulario.submit(update(solicitud.id), {
                            preserveScroll: true,
                            onSuccess: onCerrar,
                        });
                    }}
                    className="space-y-4"
                >
                    <div className="grid gap-2 sm:max-w-xs">
                        <Label htmlFor="estado">Estado</Label>
                        <Select
                            value={formulario.data.estado}
                            onValueChange={(valor) =>
                                formulario.setData('estado', valor)
                            }
                        >
                            <SelectTrigger id="estado">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {estados
                                    .filter(
                                        (opcion) => opcion.valor !== APROBADA,
                                    )
                                    .map((opcion) => (
                                        <SelectItem
                                            key={opcion.valor}
                                            value={opcion.valor}
                                        >
                                            {opcion.etiqueta}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                        <InputError message={formulario.errors.estado} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="comentarios">
                            Notas internas
                            <span className="ml-1 font-normal text-muted-foreground">
                                (no las ve la empresa)
                            </span>
                        </Label>
                        <textarea
                            id="comentarios"
                            rows={3}
                            value={formulario.data.comentarios}
                            onChange={(evento) =>
                                formulario.setData(
                                    'comentarios',
                                    evento.target.value,
                                )
                            }
                            className="w-full resize-y rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        <InputError message={formulario.errors.comentarios} />
                    </div>

                    <DialogFooter className="gap-2 sm:justify-between">
                        <Button
                            type="button"
                            variant="secondary"
                            disabled={aprobando || formulario.processing}
                            onClick={() => {
                                setAprobando(true);
                                router.post(
                                    aprobar(solicitud.id),
                                    {
                                        comentarios:
                                            formulario.data.comentarios,
                                    },
                                    {
                                        preserveScroll: true,
                                        onSuccess: onCerrar,
                                        onFinish: () => setAprobando(false),
                                    },
                                );
                            }}
                        >
                            <CheckCircle2 className="size-4" />
                            Aprobar y crear socio
                        </Button>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCerrar}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={formulario.processing || aprobando}
                            >
                                Guardar revisión
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            )}
        </div>
    );
}

export default function SolicitudesIndex({
    solicitudes,
    estados,
    pendientes,
    filtros,
}: Props) {
    const [buscar, setBuscar] = useState(filtros.buscar ?? '');
    const [dialogoAbierto, setDialogoAbierto] = useState(false);
    const [abierta, setAbierta] = useState<SolicitudCompleta | null>(null);
    const [cargando, setCargando] = useState(false);
    const [aEliminar, setAEliminar] = useState<SolicitudFila | null>(null);

    const abrir = (fila: SolicitudFila) => {
        setCargando(true);
        setDialogoAbierto(true);

        peticionJson<SolicitudCompleta>(show(fila.id).url, 'GET')
            .then(setAbierta)
            .catch(() => setDialogoAbierto(false))
            .finally(() => setCargando(false));
    };

    const filtrar = (cambios: Record<string, string | undefined>) => {
        router.get(
            index().url,
            { buscar, estado: filtros.estado, ...cambios },
            { preserveState: true, replace: true },
        );
    };

    const columnas: Columna<SolicitudFila>[] = [
        {
            clave: 'empresa',
            titulo: 'Empresa',
            render: (fila) => (
                <button
                    type="button"
                    onClick={() => abrir(fila)}
                    className="min-w-0 text-left"
                >
                    <span className="block truncate font-medium hover:underline">
                        {fila.empresa}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                        {[fila.nit && `NIT ${fila.nit}`, fila.correo]
                            .filter(Boolean)
                            .join(' · ')}
                    </span>
                </button>
            ),
        },
        {
            clave: 'ciudad',
            titulo: 'Ciudad',
            ocultarEnMovil: true,
            render: (fila) => (
                <span className="text-sm">{fila.ciudad ?? '—'}</span>
            ),
        },
        {
            clave: 'recibida',
            titulo: 'Recibida',
            ocultarEnMovil: true,
            render: (fila) => (
                <span className="text-sm whitespace-nowrap text-muted-foreground">
                    {fila.recibida}
                </span>
            ),
        },
        {
            clave: 'estado',
            titulo: 'Estado',
            render: (fila) => (
                <EstadoBadge estado={fila.estado} estados={estados} />
            ),
        },
    ];

    return (
        <>
            <Head title="Solicitudes de afiliación" />

            <PageHeader
                titulo="Solicitudes de afiliación"
                descripcion={
                    pendientes === 1
                        ? 'Hay 1 solicitud pendiente de revisar.'
                        : `Hay ${pendientes} solicitudes pendientes de revisar.`
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
                        placeholder="Buscar por empresa, NIT o correo"
                        className="pl-9"
                        aria-label="Buscar solicitudes"
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
                    <SelectTrigger className="w-48">
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

            <DataTable
                columnas={columnas}
                filas={solicitudes.data}
                vacio={
                    <EmptyState
                        icono={Inbox}
                        titulo="No hay solicitudes"
                        descripcion="Las que envíen las empresas desde el formulario «Afíliate» aparecerán aquí."
                    />
                }
                acciones={(fila) => (
                    <div className="flex justify-end gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => abrir(fila)}
                            aria-label={`Revisar ${fila.empresa}`}
                        >
                            <Eye className="size-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setAEliminar(fila)}
                            aria-label={`Eliminar ${fila.empresa}`}
                            className="text-muted-foreground hover:text-destructive"
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                )}
            />

            <Paginacion
                links={solicitudes.links}
                from={solicitudes.from}
                to={solicitudes.to}
                total={solicitudes.total}
            />

            <Dialog
                open={dialogoAbierto}
                onOpenChange={(abierto) => {
                    setDialogoAbierto(abierto);

                    if (!abierto) {
                        setAbierta(null);
                    }
                }}
            >
                <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex flex-wrap items-center gap-2">
                            <Building2 className="size-5 text-muted-foreground" />
                            {abierta?.nombre_razon_social ?? 'Solicitud'}
                            {abierta && (
                                <EstadoBadge
                                    estado={abierta.estado}
                                    estados={estados}
                                />
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            Al aprobarla se crea el socio, activo desde hoy, con
                            estos datos y su representante como contacto.
                        </DialogDescription>
                    </DialogHeader>

                    {cargando || !abierta ? (
                        <div className="space-y-3">
                            {Array.from({ length: 6 }).map((_, indice) => (
                                <Skeleton
                                    key={indice}
                                    className="h-10 w-full"
                                />
                            ))}
                        </div>
                    ) : (
                        <Revision
                            key={abierta.id}
                            solicitud={abierta}
                            estados={estados}
                            onCerrar={() => setDialogoAbierto(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                abierto={aEliminar !== null}
                onAbiertoChange={(abierto) => !abierto && setAEliminar(null)}
                titulo="Eliminar solicitud"
                descripcion={`Se eliminará la solicitud de «${aEliminar?.empresa ?? ''}». Si ya fue aprobada, el socio se conserva.`}
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

SolicitudesIndex.layout = {
    migas: [{ titulo: 'Comunidad' }, { titulo: 'Solicitudes de afiliación' }],
};
