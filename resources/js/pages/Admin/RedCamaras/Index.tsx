import { Head, router, useForm } from '@inertiajs/react';
import {
    ExternalLink,
    ImagePlus,
    Network,
    Pencil,
    Plus,
    Search,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { DataTable, Paginacion } from '@/components/admin/data-table';
import type { Columna, Paginado } from '@/components/admin/data-table';
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
import { Separator } from '@/components/ui/separator';
import { destroy, index, store, update } from '@/routes/admin/red-camaras';

type Camara = {
    id: number;
    nombre: string;
    pais: string;
    ciudad: string | null;
    direccion: string | null;
    telefono: string | null;
    correo: string | null;
    pagina_web: string | null;
    /** Lo que se guarda: ruta del disco o URL completa. */
    logo: string | null;
    /** Dirección lista para pintar. */
    logo_url: string | null;
    orden: number;
    activo: boolean;
};

type Props = {
    camaras: Paginado<Camara>;
    filtros: { buscar?: string };
};

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
    camara,
    onCerrar,
}: {
    camara: Camara | null;
    onCerrar: () => void;
}) {
    const esEdicion = camara !== null;
    const [selectorAbierto, setSelectorAbierto] = useState(false);

    const formulario = useForm({
        nombre: camara?.nombre ?? '',
        pais: camara?.pais ?? '',
        ciudad: camara?.ciudad ?? '',
        direccion: camara?.direccion ?? '',
        telefono: camara?.telefono ?? '',
        correo: camara?.correo ?? '',
        pagina_web: camara?.pagina_web ?? '',
        logo: camara?.logo ?? '',
        orden: camara?.orden ?? 0,
        activo: camara?.activo ?? true,
    });

    // Vista previa: una ruta del disco se muestra desde /storage.
    const vistaLogo = formulario.data.logo
        ? /^https?:\/\//.test(formulario.data.logo)
            ? formulario.data.logo
            : `/storage/${formulario.data.logo}`
        : null;

    const campo = (
        clave: Exclude<keyof typeof formulario.data, 'activo' | 'orden'>,
    ) => ({
        id: clave,
        valor: formulario.data[clave],
        onCambio: (valor: string) => formulario.setData(clave, valor),
        error: formulario.errors[clave],
    });

    return (
        <form
            onSubmit={(evento) => {
                evento.preventDefault();
                formulario.submit(esEdicion ? update(camara.id) : store(), {
                    preserveScroll: true,
                    onSuccess: onCerrar,
                });
            }}
            className="space-y-4"
        >
            <CampoTexto
                {...campo('nombre')}
                etiqueta="Nombre de la cámara"
                placeholder="Cámara Oficial de Comercio de España en…"
                required
                autoFocus
            />

            <div className="grid gap-4 sm:grid-cols-2">
                <CampoTexto {...campo('pais')} etiqueta="País" required />
                <CampoTexto {...campo('ciudad')} etiqueta="Ciudad" />
            </div>

            <div className="grid gap-2">
                <Label>Logo</Label>
                {vistaLogo && (
                    <div className="w-40 overflow-hidden rounded-md border bg-muted p-2">
                        <img
                            src={vistaLogo}
                            alt=""
                            className="h-16 w-full object-contain"
                        />
                    </div>
                )}
                <div className="flex gap-2">
                    <Input
                        value={formulario.data.logo}
                        onChange={(evento) =>
                            formulario.setData('logo', evento.target.value)
                        }
                        placeholder="Elige de la biblioteca o pega una dirección"
                        className="flex-1"
                        aria-label="Logo de la cámara"
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
                <InputError message={formulario.errors.logo} />
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
                <CampoTexto
                    {...campo('pagina_web')}
                    etiqueta="Sitio web"
                    type="url"
                    placeholder="https://…"
                />
                <CampoTexto
                    {...campo('correo')}
                    etiqueta="Correo"
                    type="email"
                />
                <CampoTexto {...campo('telefono')} etiqueta="Teléfono" />
                <CampoTexto {...campo('direccion')} etiqueta="Dirección" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="orden">Orden en el listado</Label>
                    <Input
                        id="orden"
                        type="number"
                        min={0}
                        value={formulario.data.orden}
                        onChange={(evento) =>
                            formulario.setData(
                                'orden',
                                Number(evento.target.value),
                            )
                        }
                    />
                    <InputError message={formulario.errors.orden} />
                </div>

                <label className="flex items-center gap-2 self-end pb-2 text-sm">
                    <Checkbox
                        checked={formulario.data.activo}
                        onCheckedChange={(marcado) =>
                            formulario.setData('activo', marcado === true)
                        }
                    />
                    Visible en el sitio
                </label>
            </div>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCerrar}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={formulario.processing}>
                    {esEdicion ? 'Guardar cambios' : 'Añadir cámara'}
                </Button>
            </DialogFooter>

            <SelectorDeMedios
                abierto={selectorAbierto}
                onAbiertoChange={setSelectorAbierto}
                onElegir={(medio) => formulario.setData('logo', medio.url)}
            />
        </form>
    );
}

export default function RedCamarasIndex({ camaras, filtros }: Props) {
    const [buscar, setBuscar] = useState(filtros.buscar ?? '');
    const [dialogoAbierto, setDialogoAbierto] = useState(false);
    const [editando, setEditando] = useState<Camara | null>(null);
    const [aEliminar, setAEliminar] = useState<Camara | null>(null);

    const abrir = (camara: Camara | null) => {
        setEditando(camara);
        setDialogoAbierto(true);
    };

    const columnas: Columna<Camara>[] = [
        {
            clave: 'nombre',
            titulo: 'Cámara',
            render: (fila) => (
                <div className="flex min-w-0 items-center gap-3">
                    <span className="size-10 shrink-0 overflow-hidden rounded-md border bg-muted">
                        {fila.logo_url ? (
                            <img
                                src={fila.logo_url}
                                alt=""
                                className="h-full w-full object-contain p-0.5"
                            />
                        ) : (
                            <span className="flex h-full items-center justify-center">
                                <Network className="size-4 text-muted-foreground" />
                            </span>
                        )}
                    </span>
                    <span className="min-w-0">
                        <span className="block truncate font-medium">
                            {fila.nombre}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                            {[fila.ciudad, fila.pais]
                                .filter(Boolean)
                                .join(', ')}
                        </span>
                    </span>
                </div>
            ),
        },
        {
            clave: 'pagina_web',
            titulo: 'Sitio web',
            ocultarEnMovil: true,
            render: (fila) =>
                fila.pagina_web ? (
                    <a
                        href={fila.pagina_web}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex max-w-56 items-center gap-1 truncate text-sm text-primary underline-offset-4 hover:underline"
                    >
                        <ExternalLink className="size-3.5 shrink-0" />
                        <span className="truncate">
                            {fila.pagina_web.replace(/^https?:\/\//, '')}
                        </span>
                    </a>
                ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                ),
        },
        {
            clave: 'activo',
            titulo: 'Estado',
            render: (fila) => (
                <Badge variant={fila.activo ? 'secondary' : 'outline'}>
                    {fila.activo ? 'Visible' : 'Oculta'}
                </Badge>
            ),
        },
    ];

    return (
        <>
            <Head title="Red de cámaras" />

            <PageHeader
                titulo="Red de cámaras"
                descripcion="Las cámaras de comercio que aparecen en la página «Red de cámaras»."
                acciones={
                    <Button onClick={() => abrir(null)}>
                        <Plus className="size-4" />
                        Nueva cámara
                    </Button>
                }
            />

            <form
                onSubmit={(evento) => {
                    evento.preventDefault();
                    router.get(
                        index().url,
                        { buscar },
                        { preserveState: true, replace: true },
                    );
                }}
                className="relative mb-4 sm:max-w-xs"
            >
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={buscar}
                    onChange={(evento) => setBuscar(evento.target.value)}
                    placeholder="Buscar por nombre, país o ciudad"
                    className="pl-9"
                    aria-label="Buscar cámaras"
                />
            </form>

            <DataTable
                columnas={columnas}
                filas={camaras.data}
                vacio={
                    <EmptyState
                        icono={Network}
                        titulo="Todavía no hay cámaras en la red"
                        descripcion="Añade la primera y aparecerá en la página «Red de cámaras» del sitio."
                        accion={
                            <Button onClick={() => abrir(null)}>
                                <Plus className="size-4" />
                                Nueva cámara
                            </Button>
                        }
                    />
                }
                acciones={(fila) => (
                    <div className="flex justify-end gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => abrir(fila)}
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
                links={camaras.links}
                from={camaras.from}
                to={camaras.to}
                total={camaras.total}
            />

            <Dialog open={dialogoAbierto} onOpenChange={setDialogoAbierto}>
                <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editando ? 'Editar cámara' : 'Nueva cámara'}
                        </DialogTitle>
                        <DialogDescription>
                            Solo aparece en el sitio si está marcada como
                            visible.
                        </DialogDescription>
                    </DialogHeader>

                    <Formulario
                        key={editando?.id ?? 'nueva'}
                        camara={editando}
                        onCerrar={() => setDialogoAbierto(false)}
                    />
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                abierto={aEliminar !== null}
                onAbiertoChange={(abierto) => !abierto && setAEliminar(null)}
                titulo="Eliminar cámara"
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

RedCamarasIndex.layout = {
    migas: [{ titulo: 'Recursos' }, { titulo: 'Red de cámaras' }],
};
