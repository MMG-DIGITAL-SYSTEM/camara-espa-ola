import { Head, router, useForm } from '@inertiajs/react';
import {
    ExternalLink,
    ImagePlus,
    Newspaper,
    Pencil,
    Plus,
    Search,
    Star,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { DataTable, Paginacion } from '@/components/admin/data-table';
import type { Columna, Paginado } from '@/components/admin/data-table';
import { EditorTexto } from '@/components/admin/editor/editor-texto';
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
import { Skeleton } from '@/components/ui/skeleton';
import { peticionJson } from '@/lib/http';
import { destroy, index, show, store, update } from '@/routes/admin/noticias';

type Opcion = { id: number; nombre: string };

type NoticiaFila = {
    id: number;
    titulo: string;
    slug: string | null;
    imagen: string | null;
    estado: string | null;
    estado_id: number | null;
    visibilidad: string | null;
    destacada: boolean;
    categorias: string[];
    fecha: string | null;
    url: string | null;
};

type NoticiaCompleta = {
    id: number;
    titulo: string;
    slug: string;
    extracto: string | null;
    descripcion: string;
    imagen: string | null;
    fecha_publicacion: string;
    fecha_evento: string | null;
    estado_id: number;
    visibilidad_id: number;
    destacada: boolean;
    categorias: number[];
};

type Props = {
    noticias: Paginado<NoticiaFila>;
    catalogos: {
        estados: Opcion[];
        visibilidades: Opcion[];
        categorias: Opcion[];
    };
    filtros: { buscar?: string; estado?: string };
};

/** Fecha y hora en el formato que espera <input type="datetime-local">. */
function ahora(): string {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());

    return d.toISOString().slice(0, 16);
}

function Formulario({
    noticia,
    catalogos,
    onCerrar,
}: {
    noticia: NoticiaCompleta | null;
    catalogos: Props['catalogos'];
    onCerrar: () => void;
}) {
    const esEdicion = noticia !== null;
    const [selectorAbierto, setSelectorAbierto] = useState(false);

    const formulario = useForm({
        titulo: noticia?.titulo ?? '',
        slug: noticia?.slug ?? '',
        extracto: noticia?.extracto ?? '',
        descripcion: noticia?.descripcion ?? '',
        imagen: noticia?.imagen ?? '',
        fecha_publicacion: noticia?.fecha_publicacion ?? ahora(),
        fecha_evento: noticia?.fecha_evento ?? '',
        estado_id: String(noticia?.estado_id ?? catalogos.estados[0]?.id ?? ''),
        visibilidad_id: String(
            noticia?.visibilidad_id ?? catalogos.visibilidades[0]?.id ?? '',
        ),
        destacada: noticia?.destacada ?? false,
        categorias: noticia?.categorias ?? [],
    });

    const alternarCategoria = (id: number) => {
        formulario.setData(
            'categorias',
            formulario.data.categorias.includes(id)
                ? formulario.data.categorias.filter((c) => c !== id)
                : [...formulario.data.categorias, id],
        );
    };

    return (
        <form
            onSubmit={(evento) => {
                evento.preventDefault();
                formulario.submit(esEdicion ? update(noticia.id) : store(), {
                    preserveScroll: true,
                    onSuccess: onCerrar,
                });
            }}
            className="space-y-4"
        >
            <div className="grid gap-2">
                <Label htmlFor="titulo">Título</Label>
                <Input
                    id="titulo"
                    value={formulario.data.titulo}
                    onChange={(evento) =>
                        formulario.setData('titulo', evento.target.value)
                    }
                    required
                    autoFocus
                />
                <InputError message={formulario.errors.titulo} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="slug">
                    Dirección
                    <span className="ml-1 font-normal text-muted-foreground">
                        (se genera del título si la dejas vacía)
                    </span>
                </Label>
                <Input
                    id="slug"
                    value={formulario.data.slug}
                    onChange={(evento) =>
                        formulario.setData('slug', evento.target.value)
                    }
                    placeholder="mi-noticia"
                />
                <InputError message={formulario.errors.slug} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="extracto">
                    Entradilla
                    <span className="ml-1 font-normal text-muted-foreground">
                        (lo que se ve en los listados)
                    </span>
                </Label>
                <textarea
                    id="extracto"
                    rows={2}
                    value={formulario.data.extracto}
                    onChange={(evento) =>
                        formulario.setData('extracto', evento.target.value)
                    }
                    className="w-full resize-y rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <InputError message={formulario.errors.extracto} />
            </div>

            <div className="grid gap-2">
                <Label>Contenido</Label>
                <EditorTexto
                    valor={formulario.data.descripcion}
                    onCambio={(html) => formulario.setData('descripcion', html)}
                />
                <InputError message={formulario.errors.descripcion} />
            </div>

            <div className="grid gap-2">
                <Label>Imagen</Label>
                {formulario.data.imagen && (
                    <div className="overflow-hidden rounded-md border bg-muted">
                        <img
                            src={formulario.data.imagen}
                            alt=""
                            className="aspect-video w-full object-contain"
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
                        aria-label="Imagen de la noticia"
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
                    <Label htmlFor="fecha_publicacion">
                        Fecha de publicación
                    </Label>
                    <Input
                        id="fecha_publicacion"
                        type="datetime-local"
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

                <div className="grid gap-2">
                    <Label htmlFor="fecha_evento">
                        Fecha del evento
                        <span className="ml-1 font-normal text-muted-foreground">
                            (opcional)
                        </span>
                    </Label>
                    <Input
                        id="fecha_evento"
                        type="datetime-local"
                        value={formulario.data.fecha_evento}
                        onChange={(evento) =>
                            formulario.setData(
                                'fecha_evento',
                                evento.target.value,
                            )
                        }
                    />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="visibilidad_id">Visibilidad</Label>
                    <Select
                        value={formulario.data.visibilidad_id}
                        onValueChange={(valor) =>
                            formulario.setData('visibilidad_id', valor)
                        }
                    >
                        <SelectTrigger id="visibilidad_id">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {catalogos.visibilidades.map((v) => (
                                <SelectItem key={v.id} value={String(v.id)}>
                                    {v.nombre}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {catalogos.categorias.length > 0 && (
                <div className="grid gap-2">
                    <Label>Categorías</Label>
                    <div className="flex flex-wrap gap-3">
                        {catalogos.categorias.map((categoria) => (
                            <label
                                key={categoria.id}
                                className="flex items-center gap-2 text-sm"
                            >
                                <Checkbox
                                    checked={formulario.data.categorias.includes(
                                        categoria.id,
                                    )}
                                    onCheckedChange={() =>
                                        alternarCategoria(categoria.id)
                                    }
                                />
                                {categoria.nombre}
                            </label>
                        ))}
                    </div>
                </div>
            )}

            <label className="flex items-center gap-2 text-sm">
                <Checkbox
                    checked={formulario.data.destacada}
                    onCheckedChange={(marcado) =>
                        formulario.setData('destacada', marcado === true)
                    }
                />
                Destacar esta noticia
            </label>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCerrar}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={formulario.processing}>
                    {esEdicion ? 'Guardar cambios' : 'Crear noticia'}
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

export default function NoticiasIndex({ noticias, catalogos, filtros }: Props) {
    const [buscar, setBuscar] = useState(filtros.buscar ?? '');
    const [dialogoAbierto, setDialogoAbierto] = useState(false);
    const [editando, setEditando] = useState<NoticiaCompleta | null>(null);
    const [cargando, setCargando] = useState(false);
    const [aEliminar, setAEliminar] = useState<NoticiaFila | null>(null);

    const abrirNueva = () => {
        setEditando(null);
        setDialogoAbierto(true);
    };

    const abrirEdicion = (fila: NoticiaFila) => {
        setCargando(true);
        setDialogoAbierto(true);

        // El cuerpo completo se pide aparte: el listado solo trae lo que pinta.
        peticionJson<NoticiaCompleta>(show(fila.id).url, 'GET')
            .then(setEditando)
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

    const columnas: Columna<NoticiaFila>[] = [
        {
            clave: 'titulo',
            titulo: 'Noticia',
            render: (fila) => (
                <div className="flex min-w-0 items-center gap-3">
                    <span className="size-10 shrink-0 overflow-hidden rounded-md bg-muted">
                        {fila.imagen ? (
                            <img
                                src={fila.imagen}
                                alt=""
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="flex h-full items-center justify-center">
                                <Newspaper className="size-4 text-muted-foreground" />
                            </span>
                        )}
                    </span>
                    <span className="min-w-0">
                        <span className="flex items-center gap-1.5">
                            <span className="truncate font-medium">
                                {fila.titulo}
                            </span>
                            {fila.destacada && (
                                <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />
                            )}
                        </span>
                        {fila.categorias.length > 0 && (
                            <span className="truncate text-xs text-muted-foreground">
                                {fila.categorias.join(', ')}
                            </span>
                        )}
                    </span>
                </div>
            ),
        },
        {
            clave: 'estado',
            titulo: 'Estado',
            render: (fila) => (
                <div className="flex flex-wrap items-center gap-1.5">
                    <Badge
                        variant={
                            fila.estado === 'Publicada'
                                ? 'secondary'
                                : 'outline'
                        }
                    >
                        {fila.estado ?? '—'}
                    </Badge>
                    {fila.visibilidad && fila.visibilidad !== 'Pública' && (
                        <span className="text-xs text-muted-foreground">
                            {fila.visibilidad}
                        </span>
                    )}
                </div>
            ),
        },
        {
            clave: 'fecha',
            titulo: 'Publicación',
            ocultarEnMovil: true,
            render: (fila) => fila.fecha ?? '—',
        },
    ];

    return (
        <>
            <Head title="Noticias" />

            <PageHeader
                titulo="Noticias"
                descripcion="Lo que se publica en la sección de noticias del sitio."
                acciones={
                    <Button onClick={abrirNueva}>
                        <Plus className="size-4" />
                        Nueva noticia
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
                        placeholder="Buscar por título o entradilla"
                        className="pl-9"
                        aria-label="Buscar noticias"
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
                filas={noticias.data}
                vacio={
                    <EmptyState
                        icono={Newspaper}
                        titulo="Todavía no hay noticias"
                        descripcion="Publica la primera y aparecerá en el sitio."
                        accion={
                            <Button onClick={abrirNueva}>
                                <Plus className="size-4" />
                                Nueva noticia
                            </Button>
                        }
                    />
                }
                acciones={(fila) => (
                    <div className="flex justify-end gap-1">
                        {fila.url && fila.estado === 'Publicada' && (
                            <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                aria-label={`Ver ${fila.titulo} en el sitio`}
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
                            aria-label={`Editar ${fila.titulo}`}
                        >
                            <Pencil className="size-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setAEliminar(fila)}
                            aria-label={`Eliminar ${fila.titulo}`}
                            className="text-muted-foreground hover:text-destructive"
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                )}
            />

            <Paginacion
                links={noticias.links}
                from={noticias.from}
                to={noticias.to}
                total={noticias.total}
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
                            {editando ? 'Editar noticia' : 'Nueva noticia'}
                        </DialogTitle>
                        <DialogDescription>
                            Solo aparece en el sitio si está publicada y su
                            visibilidad es pública.
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
                            key={editando?.id ?? 'nueva'}
                            noticia={editando}
                            catalogos={catalogos}
                            onCerrar={() => setDialogoAbierto(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                abierto={aEliminar !== null}
                onAbiertoChange={(abierto) => !abierto && setAEliminar(null)}
                titulo="Eliminar noticia"
                descripcion={`«${aEliminar?.titulo ?? ''}» dejará de estar disponible en el sitio.`}
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

NoticiasIndex.layout = {
    migas: [{ titulo: 'Contenido' }, { titulo: 'Noticias' }],
};
