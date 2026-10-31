import { Head, router, useForm } from '@inertiajs/react';
import {
    FileText,
    FolderOpen,
    Globe2,
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
import { destroy, index, store, update } from '@/routes/admin/fichas-pais';

type Ficha = {
    id: number;
    pais: string;
    titulo: string;
    descripcion: string | null;
    /** Lo que se guarda: ruta del disco o URL completa. */
    pdf_url: string | null;
    /** Dirección lista para abrir. */
    pdf: string | null;
    fecha_publicacion: string | null;
    orden: number;
    activo: boolean;
};

type Props = {
    fichas: Paginado<Ficha>;
    filtros: { buscar?: string };
};

function hoy(): string {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());

    return d.toISOString().slice(0, 10);
}

function Formulario({
    ficha,
    onCerrar,
}: {
    ficha: Ficha | null;
    onCerrar: () => void;
}) {
    const esEdicion = ficha !== null;
    const [selectorAbierto, setSelectorAbierto] = useState(false);

    const formulario = useForm({
        pais: ficha?.pais ?? '',
        titulo: ficha?.titulo ?? '',
        descripcion: ficha?.descripcion ?? '',
        pdf_url: ficha?.pdf_url ?? '',
        fecha_publicacion: ficha?.fecha_publicacion ?? hoy(),
        orden: ficha?.orden ?? 0,
        activo: ficha?.activo ?? true,
    });

    return (
        <form
            onSubmit={(evento) => {
                evento.preventDefault();
                formulario.submit(esEdicion ? update(ficha.id) : store(), {
                    preserveScroll: true,
                    onSuccess: onCerrar,
                });
            }}
            className="space-y-4"
        >
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="pais">País</Label>
                    <Input
                        id="pais"
                        value={formulario.data.pais}
                        onChange={(evento) => {
                            const pais = evento.target.value;

                            // Mientras el título siga siendo el sugerido, se
                            // actualiza con el país.
                            formulario.setData((datos) => ({
                                ...datos,
                                pais,
                                titulo:
                                    datos.titulo === '' ||
                                    datos.titulo === `Ficha país: ${datos.pais}`
                                        ? `Ficha país: ${pais}`
                                        : datos.titulo,
                            }));
                        }}
                        placeholder="España"
                        required
                        autoFocus
                    />
                    <InputError message={formulario.errors.pais} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="fecha_publicacion">
                        Fecha de publicación
                    </Label>
                    <Input
                        id="fecha_publicacion"
                        type="date"
                        value={formulario.data.fecha_publicacion}
                        onChange={(evento) =>
                            formulario.setData(
                                'fecha_publicacion',
                                evento.target.value,
                            )
                        }
                        required
                    />
                    <InputError message={formulario.errors.fecha_publicacion} />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="titulo">Título</Label>
                <Input
                    id="titulo"
                    value={formulario.data.titulo}
                    onChange={(evento) =>
                        formulario.setData('titulo', evento.target.value)
                    }
                    required
                />
                <InputError message={formulario.errors.titulo} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <textarea
                    id="descripcion"
                    rows={3}
                    value={formulario.data.descripcion}
                    onChange={(evento) =>
                        formulario.setData('descripcion', evento.target.value)
                    }
                    placeholder="Datos económicos, comercio bilateral, oportunidades…"
                    className="w-full resize-y rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <InputError message={formulario.errors.descripcion} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="pdf_url">PDF</Label>
                <div className="flex gap-2">
                    <Input
                        id="pdf_url"
                        value={formulario.data.pdf_url}
                        onChange={(evento) =>
                            formulario.setData('pdf_url', evento.target.value)
                        }
                        placeholder="Elige de la biblioteca o pega una dirección"
                        className="flex-1"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setSelectorAbierto(true)}
                        aria-label="Elegir de la biblioteca"
                    >
                        <FolderOpen className="size-4" />
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                    Sube el PDF en la biblioteca (botón de la carpeta) y
                    elígelo.
                </p>
                <InputError message={formulario.errors.pdf_url} />
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
                    {esEdicion ? 'Guardar cambios' : 'Crear ficha'}
                </Button>
            </DialogFooter>

            <SelectorDeMedios
                abierto={selectorAbierto}
                onAbiertoChange={setSelectorAbierto}
                soloImagenes={false}
                onElegir={(medio) => formulario.setData('pdf_url', medio.url)}
            />
        </form>
    );
}

export default function FichasPaisIndex({ fichas, filtros }: Props) {
    const [buscar, setBuscar] = useState(filtros.buscar ?? '');
    const [dialogoAbierto, setDialogoAbierto] = useState(false);
    const [editando, setEditando] = useState<Ficha | null>(null);
    const [aEliminar, setAEliminar] = useState<Ficha | null>(null);

    const abrir = (ficha: Ficha | null) => {
        setEditando(ficha);
        setDialogoAbierto(true);
    };

    const columnas: Columna<Ficha>[] = [
        {
            clave: 'pais',
            titulo: 'Ficha',
            render: (fila) => (
                <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted">
                        <Globe2 className="size-4 text-muted-foreground" />
                    </span>
                    <span className="min-w-0">
                        <span className="block truncate font-medium">
                            {fila.pais}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                            {fila.titulo}
                        </span>
                    </span>
                </div>
            ),
        },
        {
            clave: 'pdf',
            titulo: 'PDF',
            ocultarEnMovil: true,
            render: (fila) =>
                fila.pdf ? (
                    <a
                        href={fila.pdf}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
                    >
                        <FileText className="size-3.5" />
                        Abrir
                    </a>
                ) : (
                    <span className="text-sm text-muted-foreground">
                        Sin PDF
                    </span>
                ),
        },
        {
            clave: 'fecha_publicacion',
            titulo: 'Publicada',
            ocultarEnMovil: true,
            render: (fila) => (
                <span className="text-sm whitespace-nowrap text-muted-foreground">
                    {fila.fecha_publicacion ?? '—'}
                </span>
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
            <Head title="Fichas país" />

            <PageHeader
                titulo="Fichas país"
                descripcion="Resúmenes de mercado que se descargan en PDF desde el sitio."
                acciones={
                    <Button onClick={() => abrir(null)}>
                        <Plus className="size-4" />
                        Nueva ficha
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
                    placeholder="Buscar por país o título"
                    className="pl-9"
                    aria-label="Buscar fichas"
                />
            </form>

            <DataTable
                columnas={columnas}
                filas={fichas.data}
                vacio={
                    <EmptyState
                        icono={Globe2}
                        titulo="Todavía no hay fichas país"
                        descripcion="Crea la primera y aparecerá en la página «Fichas país» del sitio."
                        accion={
                            <Button onClick={() => abrir(null)}>
                                <Plus className="size-4" />
                                Nueva ficha
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
                            aria-label={`Editar ${fila.pais}`}
                        >
                            <Pencil className="size-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setAEliminar(fila)}
                            aria-label={`Eliminar ${fila.pais}`}
                            className="text-muted-foreground hover:text-destructive"
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                )}
            />

            <Paginacion
                links={fichas.links}
                from={fichas.from}
                to={fichas.to}
                total={fichas.total}
            />

            <Dialog open={dialogoAbierto} onOpenChange={setDialogoAbierto}>
                <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editando
                                ? 'Editar ficha país'
                                : 'Nueva ficha país'}
                        </DialogTitle>
                        <DialogDescription>
                            Solo aparece en el sitio si está marcada como
                            visible.
                        </DialogDescription>
                    </DialogHeader>

                    <Formulario
                        key={editando?.id ?? 'nueva'}
                        ficha={editando}
                        onCerrar={() => setDialogoAbierto(false)}
                    />
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                abierto={aEliminar !== null}
                onAbiertoChange={(abierto) => !abierto && setAEliminar(null)}
                titulo="Eliminar ficha país"
                descripcion={`La ficha de «${aEliminar?.pais ?? ''}» dejará de aparecer en el sitio.`}
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

FichasPaisIndex.layout = {
    migas: [{ titulo: 'Recursos' }, { titulo: 'Fichas país' }],
};
