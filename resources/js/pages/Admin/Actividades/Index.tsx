import { Head, router, useForm } from '@inertiajs/react';
import {
    CalendarDays,
    ExternalLink,
    ImagePlus,
    Paperclip,
    Pencil,
    Plus,
    Search,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import type { Campo } from '@/blocks/tipos';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { DataTable, Paginacion } from '@/components/admin/data-table';
import type { Columna, Paginado } from '@/components/admin/data-table';
import { CampoEditable } from '@/components/admin/editor/campo';
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
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { peticionJson } from '@/lib/http';
import {
    destroy,
    index,
    show,
    store,
    update,
} from '@/routes/admin/actividades';

type Opcion = { id: number; nombre: string };

type SeccionDeActividad = { titulo: string; contenido: string };
type ArchivoDeActividad = {
    nombre: string;
    archivo_url: string;
    tipo: string | null;
};

type ActividadFila = {
    id: number;
    titulo: string;
    imagen: string | null;
    estado: string | null;
    estado_id: number | null;
    visibilidad: string | null;
    categorias: string[];
    fecha_evento: string | null;
    es_proxima: boolean;
    secciones: number;
    archivos: number;
    url: string;
};

type ActividadCompleta = {
    id: number;
    titulo: string;
    descripcion: string;
    imagen: string | null;
    fecha_publicacion: string;
    fecha_evento: string;
    estado_id: number;
    visibilidad_id: number;
    autor_visible: string;
    categorias: number[];
    secciones: SeccionDeActividad[];
    archivos: ArchivoDeActividad[];
};

type Props = {
    actividades: Paginado<ActividadFila>;
    catalogos: {
        estados: Opcion[];
        visibilidades: Opcion[];
        categorias: Opcion[];
    };
    filtros: { buscar?: string; estado?: string };
};

/**
 * Las secciones y los archivos del detalle se editan con el mismo repetidor
 * que usa el constructor de páginas: son listas de la misma forma y no hay
 * razón para mantener dos controles que hacen lo mismo.
 */
const CAMPO_SECCIONES: Campo = {
    tipo: 'repetidor',
    clave: 'secciones',
    etiqueta: 'Secciones del detalle',
    titulo: 'titulo',
    maximo: 30,
    campos: [
        { tipo: 'texto', clave: 'titulo', etiqueta: 'Título' },
        { tipo: 'richtext', clave: 'contenido', etiqueta: 'Contenido' },
    ],
};

const CAMPO_ARCHIVOS: Campo = {
    tipo: 'repetidor',
    clave: 'archivos',
    etiqueta: 'Archivos descargables',
    titulo: 'nombre',
    maximo: 30,
    campos: [
        { tipo: 'texto', clave: 'nombre', etiqueta: 'Nombre visible' },
        {
            tipo: 'texto',
            clave: 'archivo_url',
            etiqueta: 'Ruta o dirección',
            placeholder: 'documentos/programa.pdf o https://…',
        },
        {
            tipo: 'texto',
            clave: 'tipo',
            etiqueta: 'Tipo',
            placeholder: 'pdf, docx…',
        },
    ],
};

/** Fecha y hora en el formato que espera <input type="datetime-local">. */
function ahora(): string {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());

    return d.toISOString().slice(0, 16);
}

function Formulario({
    actividad,
    catalogos,
    onCerrar,
}: {
    actividad: ActividadCompleta | null;
    catalogos: Props['catalogos'];
    onCerrar: () => void;
}) {
    const esEdicion = actividad !== null;
    const [selectorAbierto, setSelectorAbierto] = useState(false);

    const formulario = useForm({
        titulo: actividad?.titulo ?? '',
        descripcion: actividad?.descripcion ?? '',
        imagen: actividad?.imagen ?? '',
        fecha_publicacion: actividad?.fecha_publicacion ?? ahora(),
        fecha_evento: actividad?.fecha_evento ?? ahora(),
        estado_id: String(
            actividad?.estado_id ?? catalogos.estados[0]?.id ?? '',
        ),
        visibilidad_id: String(
            actividad?.visibilidad_id ?? catalogos.visibilidades[0]?.id ?? '',
        ),
        autor_visible: actividad?.autor_visible ?? 'Cámara',
        categorias: actividad?.categorias ?? [],
        secciones: actividad?.secciones ?? [],
        archivos: actividad?.archivos ?? [],
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
                formulario.submit(esEdicion ? update(actividad.id) : store(), {
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
                <Label>Descripción</Label>
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
                        aria-label="Imagen de la actividad"
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
                    <Label htmlFor="fecha_evento">Fecha del evento</Label>
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
                        required
                    />
                    <InputError message={formulario.errors.fecha_evento} />
                </div>

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

            <div className="grid gap-2">
                <Label htmlFor="autor_visible">Organiza</Label>
                <Input
                    id="autor_visible"
                    value={formulario.data.autor_visible}
                    onChange={(evento) =>
                        formulario.setData('autor_visible', evento.target.value)
                    }
                    placeholder="Cámara"
                />
                <InputError message={formulario.errors.autor_visible} />
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

            <Separator />

            <p className="text-xs text-muted-foreground">
                Lo que sigue solo aparece en la página de detalle de la
                actividad, no en el listado.
            </p>

            <CampoEditable
                campo={CAMPO_SECCIONES}
                idCampo="actividad-secciones"
                valor={formulario.data.secciones}
                onCambio={(valor) =>
                    formulario.setData(
                        'secciones',
                        valor as SeccionDeActividad[],
                    )
                }
            />

            <CampoEditable
                campo={CAMPO_ARCHIVOS}
                idCampo="actividad-archivos"
                valor={formulario.data.archivos}
                onCambio={(valor) =>
                    formulario.setData(
                        'archivos',
                        valor as ArchivoDeActividad[],
                    )
                }
            />

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCerrar}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={formulario.processing}>
                    {esEdicion ? 'Guardar cambios' : 'Crear actividad'}
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

export default function ActividadesIndex({
    actividades,
    catalogos,
    filtros,
}: Props) {
    const [buscar, setBuscar] = useState(filtros.buscar ?? '');
    const [dialogoAbierto, setDialogoAbierto] = useState(false);
    const [editando, setEditando] = useState<ActividadCompleta | null>(null);
    const [cargando, setCargando] = useState(false);
    const [aEliminar, setAEliminar] = useState<ActividadFila | null>(null);

    const abrirNueva = () => {
        setEditando(null);
        setDialogoAbierto(true);
    };

    const abrirEdicion = (fila: ActividadFila) => {
        setCargando(true);
        setDialogoAbierto(true);

        // El detalle completo se pide aparte: el listado solo trae lo que pinta.
        peticionJson<ActividadCompleta>(show(fila.id).url, 'GET')
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

    const columnas: Columna<ActividadFila>[] = [
        {
            clave: 'titulo',
            titulo: 'Actividad',
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
                                <CalendarDays className="size-4 text-muted-foreground" />
                            </span>
                        )}
                    </span>
                    <span className="min-w-0">
                        <span className="block truncate font-medium">
                            {fila.titulo}
                        </span>
                        <span className="flex items-center gap-2 text-xs text-muted-foreground">
                            {fila.categorias.length > 0 && (
                                <span className="truncate">
                                    {fila.categorias.join(', ')}
                                </span>
                            )}
                            {fila.archivos > 0 && (
                                <span className="flex shrink-0 items-center gap-0.5">
                                    <Paperclip className="size-3" />
                                    {fila.archivos}
                                </span>
                            )}
                        </span>
                    </span>
                </div>
            ),
        },
        {
            clave: 'fecha_evento',
            titulo: 'Se celebra',
            render: (fila) => (
                <div className="flex items-center gap-2">
                    <span>{fila.fecha_evento ?? '—'}</span>
                    {fila.es_proxima && (
                        <Badge variant="secondary" className="shrink-0">
                            Próxima
                        </Badge>
                    )}
                </div>
            ),
        },
        {
            clave: 'estado',
            titulo: 'Estado',
            ocultarEnMovil: true,
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
    ];

    return (
        <>
            <Head title="Actividades" />

            <PageHeader
                titulo="Actividades"
                descripcion="Los eventos que se anuncian en la agenda del sitio."
                acciones={
                    <Button onClick={abrirNueva}>
                        <Plus className="size-4" />
                        Nueva actividad
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
                        placeholder="Buscar por título o descripción"
                        className="pl-9"
                        aria-label="Buscar actividades"
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
                filas={actividades.data}
                vacio={
                    <EmptyState
                        icono={CalendarDays}
                        titulo="Todavía no hay actividades"
                        descripcion="Crea la primera y aparecerá en la agenda del sitio."
                        accion={
                            <Button onClick={abrirNueva}>
                                <Plus className="size-4" />
                                Nueva actividad
                            </Button>
                        }
                    />
                }
                acciones={(fila) => (
                    <div className="flex justify-end gap-1">
                        {fila.estado === 'Publicada' && (
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
                links={actividades.links}
                from={actividades.from}
                to={actividades.to}
                total={actividades.total}
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
                            {editando ? 'Editar actividad' : 'Nueva actividad'}
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
                            actividad={editando}
                            catalogos={catalogos}
                            onCerrar={() => setDialogoAbierto(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                abierto={aEliminar !== null}
                onAbiertoChange={(abierto) => !abierto && setAEliminar(null)}
                titulo="Eliminar actividad"
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

ActividadesIndex.layout = {
    migas: [{ titulo: 'Contenido' }, { titulo: 'Actividades' }],
};
