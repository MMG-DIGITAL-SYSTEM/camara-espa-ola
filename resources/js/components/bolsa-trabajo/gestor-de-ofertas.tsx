import { router, useForm } from '@inertiajs/react';
import {
    BriefcaseBusiness,
    ExternalLink,
    Pencil,
    Plus,
    Search,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { DataTable, Paginacion } from '@/components/admin/data-table';
import type { Columna, Paginado } from '@/components/admin/data-table';
import { EditorTexto } from '@/components/admin/editor/editor-texto';
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
import { Skeleton } from '@/components/ui/skeleton';
import { peticionJson } from '@/lib/http';
import type { RouteDefinition } from '@/wayfinder';

export type Opcion = { valor: string; etiqueta: string };

export type OpcionesOferta = {
    estados: Opcion[];
    modalidades: Opcion[];
    jornadas: Opcion[];
};

export type OfertaFila = {
    id: number;
    titulo: string;
    empresa: string | null;
    ubicacion: string | null;
    modalidad: string;
    jornada: string;
    estado: string;
    estado_etiqueta: string;
    vencida: boolean;
    fecha_cierre: string | null;
    actualizada: string | null;
    url: string | null;
};

type OfertaCompleta = {
    id: number;
    socio_id: number;
    titulo: string;
    descripcion: string;
    area: string | null;
    ubicacion: string | null;
    modalidad: string;
    jornada: string;
    salario: string | null;
    vacantes: number;
    correo_postulacion: string | null;
    enlace_postulacion: string | null;
    fecha_cierre: string | null;
    estado: string;
};

type Socio = { id: number; nombre: string };

/**
 * Rutas de Wayfinder del lado que monta el gestor: el panel o el portal.
 */
export type RutasDeOfertas = {
    index: () => { url: string };
    show: (id: number) => { url: string };
    store: () => RouteDefinition<'post'>;
    update: (id: number) => RouteDefinition<'patch'>;
    destroy: (id: number) => RouteDefinition<'delete'>;
};

const COLOR_ESTADO: Record<string, string> = {
    publicada: 'bg-emerald-500',
    borrador: 'bg-amber-400',
    cerrada: 'bg-muted-foreground/40',
};

function Formulario({
    oferta,
    opciones,
    socios,
    rutas,
    onCerrar,
}: {
    oferta: OfertaCompleta | null;
    opciones: OpcionesOferta;
    socios?: Socio[];
    rutas: RutasDeOfertas;
    onCerrar: () => void;
}) {
    const esEdicion = oferta !== null;

    const formulario = useForm({
        socio_id: oferta?.socio_id ? String(oferta.socio_id) : '',
        titulo: oferta?.titulo ?? '',
        descripcion: oferta?.descripcion ?? '',
        area: oferta?.area ?? '',
        ubicacion: oferta?.ubicacion ?? '',
        modalidad: oferta?.modalidad ?? opciones.modalidades[0]?.valor ?? '',
        jornada: oferta?.jornada ?? opciones.jornadas[0]?.valor ?? '',
        salario: oferta?.salario ?? '',
        vacantes: String(oferta?.vacantes ?? 1),
        correo_postulacion: oferta?.correo_postulacion ?? '',
        enlace_postulacion: oferta?.enlace_postulacion ?? '',
        fecha_cierre: oferta?.fecha_cierre ?? '',
        estado: oferta?.estado ?? 'publicada',
    });

    const campoDeTexto = (
        clave:
            | 'titulo'
            | 'area'
            | 'ubicacion'
            | 'salario'
            | 'correo_postulacion'
            | 'enlace_postulacion',
        etiqueta: string,
        extra: React.InputHTMLAttributes<HTMLInputElement> = {},
    ) => (
        <div className="grid gap-2">
            <Label htmlFor={clave}>{etiqueta}</Label>
            <Input
                id={clave}
                value={formulario.data[clave]}
                onChange={(evento) =>
                    formulario.setData(clave, evento.target.value)
                }
                {...extra}
            />
            <InputError message={formulario.errors[clave]} />
        </div>
    );

    const selector = (
        clave: 'modalidad' | 'jornada' | 'estado',
        etiqueta: string,
        lista: Opcion[],
    ) => (
        <div className="grid gap-2">
            <Label htmlFor={clave}>{etiqueta}</Label>
            <Select
                value={formulario.data[clave]}
                onValueChange={(valor) => formulario.setData(clave, valor)}
            >
                <SelectTrigger id={clave}>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {lista.map((opcion) => (
                        <SelectItem key={opcion.valor} value={opcion.valor}>
                            {opcion.etiqueta}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <InputError message={formulario.errors[clave]} />
        </div>
    );

    return (
        <form
            onSubmit={(evento) => {
                evento.preventDefault();
                formulario.submit(
                    esEdicion ? rutas.update(oferta.id) : rutas.store(),
                    { preserveScroll: true, onSuccess: onCerrar },
                );
            }}
            className="space-y-4"
        >
            {socios && (
                <div className="grid gap-2">
                    <Label htmlFor="socio_id">Empresa</Label>
                    <Select
                        value={formulario.data.socio_id}
                        onValueChange={(valor) =>
                            formulario.setData('socio_id', valor)
                        }
                    >
                        <SelectTrigger id="socio_id">
                            <SelectValue placeholder="Elige el socio que publica" />
                        </SelectTrigger>
                        <SelectContent>
                            {socios.map((socio) => (
                                <SelectItem
                                    key={socio.id}
                                    value={String(socio.id)}
                                >
                                    {socio.nombre}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={formulario.errors.socio_id} />
                </div>
            )}

            {campoDeTexto('titulo', 'Puesto', {
                required: true,
                autoFocus: true,
            })}

            <div className="grid gap-4 sm:grid-cols-2">
                {campoDeTexto('area', 'Área', {
                    placeholder: 'Administración',
                })}
                {campoDeTexto('ubicacion', 'Ubicación', {
                    placeholder: 'Santa Cruz',
                })}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                {selector('modalidad', 'Modalidad', opciones.modalidades)}
                {selector('jornada', 'Jornada', opciones.jornadas)}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                {campoDeTexto('salario', 'Salario (opcional)', {
                    placeholder: 'A convenir',
                })}
                <div className="grid gap-2">
                    <Label htmlFor="vacantes">Vacantes</Label>
                    <Input
                        id="vacantes"
                        type="number"
                        min={1}
                        max={999}
                        value={formulario.data.vacantes}
                        onChange={(evento) =>
                            formulario.setData('vacantes', evento.target.value)
                        }
                        required
                    />
                    <InputError message={formulario.errors.vacantes} />
                </div>
            </div>

            <div className="grid gap-2">
                <Label>Descripción, funciones y requisitos</Label>
                <EditorTexto
                    valor={formulario.data.descripcion}
                    onCambio={(html) => formulario.setData('descripcion', html)}
                />
                <InputError message={formulario.errors.descripcion} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                {campoDeTexto('correo_postulacion', 'Correo para postular', {
                    type: 'email',
                    placeholder: 'rrhh@empresa.com',
                })}
                {campoDeTexto('enlace_postulacion', 'O enlace para postular', {
                    type: 'url',
                    placeholder: 'https://',
                })}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="fecha_cierre">
                        Fecha de cierre
                        <span className="ml-1 font-normal text-muted-foreground">
                            (opcional)
                        </span>
                    </Label>
                    <Input
                        id="fecha_cierre"
                        type="date"
                        value={formulario.data.fecha_cierre}
                        onChange={(evento) =>
                            formulario.setData(
                                'fecha_cierre',
                                evento.target.value,
                            )
                        }
                    />
                    <InputError message={formulario.errors.fecha_cierre} />
                </div>
                {selector('estado', 'Estado', opciones.estados)}
            </div>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCerrar}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={formulario.processing}>
                    {esEdicion ? 'Guardar cambios' : 'Crear oferta'}
                </Button>
            </DialogFooter>
        </form>
    );
}

/**
 * Listado, filtros y formulario de ofertas. Lo montan tanto el panel (con
 * `socios`, para moderar las de todos) como el portal de empresas (sin él:
 * la oferta es siempre del socio de la cuenta).
 */
export function GestorDeOfertas({
    titulo,
    descripcion,
    ofertas,
    opciones,
    filtros,
    rutas,
    socios,
}: {
    titulo: string;
    descripcion: string;
    ofertas: Paginado<OfertaFila>;
    opciones: OpcionesOferta;
    filtros: { buscar?: string; estado?: string; socio?: string };
    rutas: RutasDeOfertas;
    socios?: Socio[];
}) {
    const [buscar, setBuscar] = useState(filtros.buscar ?? '');
    const [dialogoAbierto, setDialogoAbierto] = useState(false);
    const [editando, setEditando] = useState<OfertaCompleta | null>(null);
    const [cargando, setCargando] = useState(false);
    const [aEliminar, setAEliminar] = useState<OfertaFila | null>(null);

    const abrirNueva = () => {
        setEditando(null);
        setDialogoAbierto(true);
    };

    const abrirEdicion = (fila: OfertaFila) => {
        setCargando(true);
        setDialogoAbierto(true);

        // La descripción completa se pide aparte: el listado solo trae lo que pinta.
        peticionJson<OfertaCompleta>(rutas.show(fila.id).url, 'GET')
            .then(setEditando)
            .catch(() => setDialogoAbierto(false))
            .finally(() => setCargando(false));
    };

    const filtrar = (cambios: Record<string, string | undefined>) => {
        router.get(
            rutas.index().url,
            {
                buscar,
                estado: filtros.estado,
                socio: filtros.socio,
                ...cambios,
            },
            { preserveState: true, replace: true },
        );
    };

    const columnas: Columna<OfertaFila>[] = [
        {
            clave: 'titulo',
            titulo: 'Oferta',
            render: (fila) => (
                <div className="min-w-0">
                    <p className="truncate font-medium">{fila.titulo}</p>
                    <p className="truncate text-xs text-muted-foreground">
                        {[
                            socios ? fila.empresa : null,
                            fila.ubicacion,
                            fila.modalidad,
                            fila.jornada,
                        ]
                            .filter(Boolean)
                            .join(' · ')}
                    </p>
                </div>
            ),
        },
        {
            clave: 'estado',
            titulo: 'Estado',
            render: (fila) => (
                <span className="flex flex-wrap items-center gap-1.5">
                    <span
                        className={`size-1.5 rounded-full ${COLOR_ESTADO[fila.estado] ?? 'bg-muted-foreground/40'}`}
                    />
                    {fila.estado_etiqueta}
                    {fila.vencida && (
                        <Badge variant="outline" className="text-xs">
                            Vencida
                        </Badge>
                    )}
                </span>
            ),
        },
        {
            clave: 'fecha_cierre',
            titulo: 'Cierre',
            ocultarEnMovil: true,
            render: (fila) => fila.fecha_cierre ?? 'Sin fecha',
        },
        {
            clave: 'actualizada',
            titulo: 'Actualizada',
            ocultarEnMovil: true,
            render: (fila) => fila.actualizada ?? '—',
        },
    ];

    return (
        <>
            <PageHeader
                titulo={titulo}
                descripcion={descripcion}
                acciones={
                    <Button onClick={abrirNueva}>
                        <Plus className="size-4" />
                        Nueva oferta
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
                        placeholder={
                            socios
                                ? 'Buscar por puesto o empresa'
                                : 'Buscar por puesto'
                        }
                        className="pl-9"
                        aria-label="Buscar ofertas"
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
                        {opciones.estados.map((estado) => (
                            <SelectItem key={estado.valor} value={estado.valor}>
                                {estado.etiqueta}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {socios && (
                    <Select
                        value={filtros.socio ?? 'todos'}
                        onValueChange={(valor) =>
                            filtrar({
                                socio: valor === 'todos' ? undefined : valor,
                            })
                        }
                    >
                        <SelectTrigger className="w-56">
                            <SelectValue placeholder="Todas las empresas" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">
                                Todas las empresas
                            </SelectItem>
                            {socios.map((socio) => (
                                <SelectItem
                                    key={socio.id}
                                    value={String(socio.id)}
                                >
                                    {socio.nombre}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            <DataTable
                columnas={columnas}
                filas={ofertas.data}
                vacio={
                    <EmptyState
                        icono={BriefcaseBusiness}
                        titulo="Todavía no hay ofertas"
                        descripcion="Publica la primera y aparecerá en la bolsa de trabajo del sitio."
                        accion={
                            <Button onClick={abrirNueva}>
                                <Plus className="size-4" />
                                Nueva oferta
                            </Button>
                        }
                    />
                }
                acciones={(fila) => (
                    <div className="flex justify-end gap-1">
                        {fila.url && (
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
                links={ofertas.links}
                from={ofertas.from}
                to={ofertas.to}
                total={ofertas.total}
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
                            {editando ? 'Editar oferta' : 'Nueva oferta'}
                        </DialogTitle>
                        <DialogDescription>
                            Solo aparece en el sitio si está publicada y no ha
                            pasado su fecha de cierre.
                        </DialogDescription>
                    </DialogHeader>

                    {cargando ? (
                        <div className="space-y-3">
                            {Array.from({ length: 6 }).map((_, indice) => (
                                <Skeleton
                                    key={indice}
                                    className="h-10 w-full"
                                />
                            ))}
                        </div>
                    ) : (
                        <Formulario
                            key={editando?.id ?? 'nueva'}
                            oferta={editando}
                            opciones={opciones}
                            socios={socios}
                            rutas={rutas}
                            onCerrar={() => setDialogoAbierto(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                abierto={aEliminar !== null}
                onAbiertoChange={(abierto) => !abierto && setAEliminar(null)}
                titulo="Eliminar oferta"
                descripcion={`«${aEliminar?.titulo ?? ''}» dejará de aparecer en la bolsa de trabajo.`}
                textoConfirmar="Eliminar"
                onConfirmar={() => {
                    if (!aEliminar) {
                        return;
                    }

                    router.delete(rutas.destroy(aEliminar.id), {
                        preserveScroll: true,
                        onFinish: () => setAEliminar(null),
                    });
                }}
            />
        </>
    );
}
