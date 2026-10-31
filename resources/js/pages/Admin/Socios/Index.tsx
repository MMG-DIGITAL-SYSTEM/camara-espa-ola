import { Head, router, useForm } from '@inertiajs/react';
import {
    Building2,
    ExternalLink,
    ImagePlus,
    Pencil,
    Plus,
    Search,
    Star,
    Trash2,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import type { Campo } from '@/blocks/tipos';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { DataTable, Paginacion } from '@/components/admin/data-table';
import type { Columna, Paginado } from '@/components/admin/data-table';
import { CampoEditable } from '@/components/admin/editor/campo';
import { EmptyState } from '@/components/admin/empty-state';
import { SelectorDeMedios } from '@/components/admin/medios/selector-de-medios';
import { PageHeader } from '@/components/admin/page-header';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { destroy, index, show, store, update } from '@/routes/admin/socios';

type Opcion = { id: number; nombre: string };

type ContactoDeSocio = {
    nombre: string;
    cargo: string | null;
    telefono: string | null;
    correo_electronico: string | null;
};

type SocioFila = {
    id: number;
    nombre: string;
    nit: string | null;
    imagen: string | null;
    categoria: string | null;
    estado: string | null;
    destacado: boolean;
    contactos: number;
    url: string;
};

type SocioCompleto = {
    id: number;
    nombre: string;
    slug: string;
    nit: string | null;
    descripcion: string | null;
    imagen: string | null;
    sitio_web: string | null;
    telefono1: string | null;
    telefono2: string | null;
    correo_electronico: string | null;
    direccion: string | null;
    categoria_id: number | null;
    estado_id: number | null;
    fecha_afiliacion: string | null;
    destacado: boolean;
    orden: number;
    contactos: ContactoDeSocio[];
};

type Props = {
    socios: Paginado<SocioFila>;
    catalogos: {
        categorias: Opcion[];
        estados: Opcion[];
    };
    filtros: { buscar?: string; categoria?: string; estado?: string };
};

/** Valor del selector de rubro que abre el campo para escribir uno nuevo. */
const RUBRO_NUEVO = 'nuevo';
const SIN_RUBRO = 'ninguno';

/**
 * Los contactos se editan con el mismo repetidor que las secciones de una
 * actividad: son una lista corta y ordenable de la misma forma.
 */
const CAMPO_CONTACTOS: Campo = {
    tipo: 'repetidor',
    clave: 'contactos',
    etiqueta: 'Personas de contacto',
    titulo: 'nombre',
    maximo: 30,
    campos: [
        { tipo: 'texto', clave: 'nombre', etiqueta: 'Nombre' },
        {
            tipo: 'texto',
            clave: 'cargo',
            etiqueta: 'Cargo',
            placeholder: 'Gerente general',
        },
        { tipo: 'texto', clave: 'telefono', etiqueta: 'Teléfono' },
        {
            tipo: 'texto',
            clave: 'correo_electronico',
            etiqueta: 'Correo',
            placeholder: 'nombre@empresa.com',
        },
    ],
};

function hoy(): string {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());

    return d.toISOString().slice(0, 10);
}

/** Primer error que el servidor haya devuelto para algún contacto. */
function errorDeContactos(errores: Record<string, string>): string | undefined {
    return Object.entries(errores).find(([clave]) =>
        clave.startsWith('contactos'),
    )?.[1];
}

function CampoTexto({
    id,
    etiqueta,
    valor,
    onCambio,
    error,
    ...resto
}: {
    id: string;
    etiqueta: string;
    valor: string;
    onCambio: (valor: string) => void;
    error?: string;
} & Omit<React.ComponentProps<typeof Input>, 'id' | 'value' | 'onChange'>) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{etiqueta}</Label>
            <Input
                id={id}
                value={valor}
                onChange={(evento) => onCambio(evento.target.value)}
                {...resto}
            />
            <InputError message={error} />
        </div>
    );
}

function Formulario({
    socio,
    catalogos,
    onCerrar,
}: {
    socio: SocioCompleto | null;
    catalogos: Props['catalogos'];
    onCerrar: () => void;
}) {
    const esEdicion = socio !== null;
    const [selectorAbierto, setSelectorAbierto] = useState(false);

    const estadoActivo = catalogos.estados.find((e) => e.nombre === 'Activo');

    const formulario = useForm({
        nombre: socio?.nombre ?? '',
        slug: socio?.slug ?? '',
        nit: socio?.nit ?? '',
        descripcion: socio?.descripcion ?? '',
        imagen: socio?.imagen ?? '',
        sitio_web: socio?.sitio_web ?? '',
        telefono1: socio?.telefono1 ?? '',
        telefono2: socio?.telefono2 ?? '',
        correo_electronico: socio?.correo_electronico ?? '',
        direccion: socio?.direccion ?? '',
        categoria_id: socio?.categoria_id ? String(socio.categoria_id) : '',
        categoria_nueva: '',
        estado_id: String(
            socio?.estado_id ??
                estadoActivo?.id ??
                catalogos.estados[0]?.id ??
                '',
        ),
        fecha_afiliacion: socio?.fecha_afiliacion ?? hoy(),
        destacado: socio?.destacado ?? false,
        orden: socio?.orden ?? 0,
        contactos: socio?.contactos ?? [],
    });

    const [rubro, setRubro] = useState(
        formulario.data.categoria_id || SIN_RUBRO,
    );

    const elegirRubro = (valor: string) => {
        setRubro(valor);
        formulario.setData((datos) => ({
            ...datos,
            categoria_id:
                valor === RUBRO_NUEVO || valor === SIN_RUBRO ? '' : valor,
            categoria_nueva: '',
        }));
    };

    const campo = (clave: keyof typeof formulario.data) => ({
        id: clave,
        valor: String(formulario.data[clave] ?? ''),
        onCambio: (valor: string) => formulario.setData(clave, valor),
        error: formulario.errors[clave],
    });

    return (
        <form
            onSubmit={(evento) => {
                evento.preventDefault();
                formulario.submit(esEdicion ? update(socio.id) : store(), {
                    preserveScroll: true,
                    onSuccess: onCerrar,
                });
            }}
            className="space-y-4"
        >
            <CampoTexto
                {...campo('nombre')}
                etiqueta="Nombre de la empresa"
                required
                autoFocus
            />

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="slug">
                        Dirección
                        <span className="ml-1 font-normal text-muted-foreground">
                            (opcional)
                        </span>
                    </Label>
                    <Input
                        id="slug"
                        value={formulario.data.slug}
                        onChange={(evento) =>
                            formulario.setData('slug', evento.target.value)
                        }
                        placeholder="se genera del nombre"
                    />
                    <InputError message={formulario.errors.slug} />
                </div>

                <CampoTexto {...campo('nit')} etiqueta="NIT" />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <textarea
                    id="descripcion"
                    rows={4}
                    value={formulario.data.descripcion}
                    onChange={(evento) =>
                        formulario.setData('descripcion', evento.target.value)
                    }
                    className="w-full resize-y rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <InputError message={formulario.errors.descripcion} />
            </div>

            <div className="grid gap-2">
                <Label>Logo</Label>
                {formulario.data.imagen && (
                    <div className="w-40 overflow-hidden rounded-md border bg-muted p-2">
                        <img
                            src={formulario.data.imagen}
                            alt=""
                            className="h-16 w-full object-contain"
                        />
                    </div>
                )}
                <div className="flex gap-2">
                    <Input
                        value={formulario.data.imagen}
                        onChange={(evento) =>
                            formulario.setData('imagen', evento.target.value)
                        }
                        placeholder="Elige de la biblioteca o pega una dirección"
                        className="flex-1"
                        aria-label="Logo del socio"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setSelectorAbierto(true)}
                        aria-label="Elegir de la biblioteca"
                    >
                        <ImagePlus className="size-4" />
                    </Button>
                </div>
                <InputError message={formulario.errors.imagen} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="categoria_id">Rubro</Label>
                    <Select value={rubro} onValueChange={elegirRubro}>
                        <SelectTrigger id="categoria_id">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={SIN_RUBRO}>Sin rubro</SelectItem>
                            {catalogos.categorias.map((categoria) => (
                                <SelectItem
                                    key={categoria.id}
                                    value={String(categoria.id)}
                                >
                                    {categoria.nombre}
                                </SelectItem>
                            ))}
                            <SelectItem value={RUBRO_NUEVO}>
                                + Nuevo rubro…
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    {rubro === RUBRO_NUEVO && (
                        <Input
                            value={formulario.data.categoria_nueva}
                            onChange={(evento) =>
                                formulario.setData(
                                    'categoria_nueva',
                                    evento.target.value,
                                )
                            }
                            placeholder="Nombre del rubro"
                            aria-label="Nombre del rubro nuevo"
                            autoFocus
                        />
                    )}
                    <InputError
                        message={
                            formulario.errors.categoria_id ??
                            formulario.errors.categoria_nueva
                        }
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="estado_id">Estado</Label>
                    <Select
                        value={formulario.data.estado_id}
                        onValueChange={(valor) =>
                            formulario.setData('estado_id', valor)
                        }
                    >
                        <SelectTrigger id="estado_id">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {catalogos.estados.map((estado) => (
                                <SelectItem
                                    key={estado.id}
                                    value={String(estado.id)}
                                >
                                    {estado.nombre}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={formulario.errors.estado_id} />
                </div>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
                <CampoTexto
                    {...campo('sitio_web')}
                    etiqueta="Sitio web"
                    type="url"
                    placeholder="https://…"
                />
                <CampoTexto
                    {...campo('correo_electronico')}
                    etiqueta="Correo"
                    type="email"
                />
                <CampoTexto {...campo('telefono1')} etiqueta="Teléfono" />
                <CampoTexto {...campo('telefono2')} etiqueta="Celular" />
            </div>

            <CampoTexto {...campo('direccion')} etiqueta="Dirección postal" />

            <div className="grid gap-4 sm:grid-cols-2">
                <CampoTexto
                    {...campo('fecha_afiliacion')}
                    etiqueta="Fecha de afiliación"
                    type="date"
                    required
                />
                <CampoTexto
                    {...campo('orden')}
                    etiqueta="Orden en el listado"
                    type="number"
                    min={0}
                />
            </div>

            <label className="flex items-center gap-2 text-sm">
                <Checkbox
                    checked={formulario.data.destacado}
                    onCheckedChange={(marcado) =>
                        formulario.setData('destacado', marcado === true)
                    }
                />
                Destacar este socio
            </label>

            <Separator />

            <CampoEditable
                campo={CAMPO_CONTACTOS}
                idCampo="socio-contactos"
                valor={formulario.data.contactos}
                onCambio={(valor) =>
                    formulario.setData('contactos', valor as ContactoDeSocio[])
                }
            />
            <InputError message={errorDeContactos(formulario.errors)} />

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCerrar}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={formulario.processing}>
                    {esEdicion ? 'Guardar cambios' : 'Crear socio'}
                </Button>
            </DialogFooter>

            <SelectorDeMedios
                abierto={selectorAbierto}
                onAbiertoChange={setSelectorAbierto}
                onElegir={(medio) => formulario.setData('imagen', medio.url)}
            />
        </form>
    );
}

export default function SociosIndex({ socios, catalogos, filtros }: Props) {
    const [buscar, setBuscar] = useState(filtros.buscar ?? '');
    const [dialogoAbierto, setDialogoAbierto] = useState(false);
    const [editando, setEditando] = useState<SocioCompleto | null>(null);
    const [cargando, setCargando] = useState(false);
    const [aEliminar, setAEliminar] = useState<SocioFila | null>(null);

    const abrirNuevo = () => {
        setEditando(null);
        setDialogoAbierto(true);
    };

    const abrirEdicion = (fila: SocioFila) => {
        setCargando(true);
        setDialogoAbierto(true);

        // El detalle completo se pide aparte: el listado solo trae lo que pinta.
        peticionJson<SocioCompleto>(show(fila.id).url, 'GET')
            .then(setEditando)
            .catch(() => setDialogoAbierto(false))
            .finally(() => setCargando(false));
    };

    const filtrar = (cambios: Record<string, string | undefined>) => {
        router.get(
            index().url,
            {
                buscar,
                categoria: filtros.categoria,
                estado: filtros.estado,
                ...cambios,
            },
            { preserveState: true, replace: true },
        );
    };

    const columnas: Columna<SocioFila>[] = [
        {
            clave: 'nombre',
            titulo: 'Socio',
            render: (fila) => (
                <div className="flex min-w-0 items-center gap-3">
                    <span className="size-10 shrink-0 overflow-hidden rounded-md border bg-muted">
                        {fila.imagen ? (
                            <img
                                src={fila.imagen}
                                alt=""
                                className="h-full w-full object-contain p-0.5"
                            />
                        ) : (
                            <span className="flex h-full items-center justify-center">
                                <Building2 className="size-4 text-muted-foreground" />
                            </span>
                        )}
                    </span>
                    <span className="min-w-0">
                        <span className="flex items-center gap-1.5 font-medium">
                            <span className="truncate">{fila.nombre}</span>
                            {fila.destacado && (
                                <Star
                                    className="size-3.5 shrink-0 fill-amber-400 text-amber-400"
                                    aria-label="Destacado"
                                />
                            )}
                        </span>
                        <span className="flex items-center gap-2 text-xs text-muted-foreground">
                            {fila.nit && <span>NIT {fila.nit}</span>}
                            {fila.contactos > 0 && (
                                <span className="flex shrink-0 items-center gap-0.5">
                                    <Users className="size-3" />
                                    {fila.contactos}
                                </span>
                            )}
                        </span>
                    </span>
                </div>
            ),
        },
        {
            clave: 'categoria',
            titulo: 'Rubro',
            ocultarEnMovil: true,
            render: (fila) => (
                <span className="text-sm">{fila.categoria ?? '—'}</span>
            ),
        },
        {
            clave: 'estado',
            titulo: 'Estado',
            render: (fila) => (
                <Badge
                    variant={fila.estado === 'Activo' ? 'secondary' : 'outline'}
                >
                    {fila.estado ?? '—'}
                </Badge>
            ),
        },
    ];

    return (
        <>
            <Head title="Socios" />

            <PageHeader
                titulo="Socios"
                descripcion="Las empresas afiliadas que aparecen en el sitio."
                acciones={
                    <Button onClick={abrirNuevo}>
                        <Plus className="size-4" />
                        Nuevo socio
                    </Button>
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
                        placeholder="Buscar por nombre o NIT"
                        className="pl-9"
                        aria-label="Buscar socios"
                    />
                </form>

                <Select
                    value={filtros.categoria ?? 'todos'}
                    onValueChange={(valor) =>
                        filtrar({
                            categoria: valor === 'todos' ? undefined : valor,
                        })
                    }
                >
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Todos los rubros" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todos">Todos los rubros</SelectItem>
                        {catalogos.categorias.map((categoria) => (
                            <SelectItem
                                key={categoria.id}
                                value={String(categoria.id)}
                            >
                                {categoria.nombre}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={filtros.estado ?? 'todos'}
                    onValueChange={(valor) =>
                        filtrar({
                            estado: valor === 'todos' ? undefined : valor,
                        })
                    }
                >
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todos">Todos los estados</SelectItem>
                        {catalogos.estados.map((estado) => (
                            <SelectItem
                                key={estado.id}
                                value={String(estado.id)}
                            >
                                {estado.nombre}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <DataTable
                columnas={columnas}
                filas={socios.data}
                vacio={
                    <EmptyState
                        icono={Building2}
                        titulo="Todavía no hay socios"
                        descripcion="Crea el primero y aparecerá en la página de socios del sitio."
                        accion={
                            <Button onClick={abrirNuevo}>
                                <Plus className="size-4" />
                                Nuevo socio
                            </Button>
                        }
                    />
                }
                acciones={(fila) => (
                    <div className="flex justify-end gap-1">
                        {fila.estado === 'Activo' && (
                            <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                aria-label={`Ver ${fila.nombre} en el sitio`}
                            >
                                <a
                                    href={fila.url}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <ExternalLink className="size-4" />
                                </a>
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => abrirEdicion(fila)}
                            aria-label={`Editar ${fila.nombre}`}
                        >
                            <Pencil className="size-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setAEliminar(fila)}
                            aria-label={`Eliminar ${fila.nombre}`}
                            className="text-muted-foreground hover:text-destructive"
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                )}
            />

            <Paginacion
                links={socios.links}
                from={socios.from}
                to={socios.to}
                total={socios.total}
            />

            <Dialog
                open={dialogoAbierto}
                onOpenChange={(abierto) => {
                    setDialogoAbierto(abierto);

                    if (!abierto) {
                        setEditando(null);
                    }
                }}
            >
                <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editando ? 'Editar socio' : 'Nuevo socio'}
                        </DialogTitle>
                        <DialogDescription>
                            Solo aparece en el sitio si su estado es «Activo».
                        </DialogDescription>
                    </DialogHeader>

                    {cargando ? (
                        <div className="space-y-3">
                            {Array.from({ length: 5 }).map((_, indice) => (
                                <Skeleton
                                    key={indice}
                                    className="h-10 w-full"
                                />
                            ))}
                        </div>
                    ) : (
                        <Formulario
                            key={editando?.id ?? 'nuevo'}
                            socio={editando}
                            catalogos={catalogos}
                            onCerrar={() => setDialogoAbierto(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                abierto={aEliminar !== null}
                onAbiertoChange={(abierto) => !abierto && setAEliminar(null)}
                titulo="Eliminar socio"
                descripcion={`«${aEliminar?.nombre ?? ''}» dejará de aparecer en el sitio.`}
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

SociosIndex.layout = {
    migas: [{ titulo: 'Comunidad' }, { titulo: 'Socios' }],
};
