import { Head, router, useForm } from '@inertiajs/react';
import { ImagePlus, Plus, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { IconoPorNombre } from '@/blocks/componentes/dinamicos';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { EmptyState } from '@/components/admin/empty-state';
import { ListaOrdenable } from '@/components/admin/lista-ordenable';
import { SelectorDeMedios } from '@/components/admin/medios/selector-de-medios';
import { PageHeader } from '@/components/admin/page-header';
import InputError from '@/components/input-error';
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
import { destroy, reordenar, store, update } from '@/routes/admin/servicios';

type Servicio = {
    id: number;
    titulo: string;
    contenido: string;
    icono: string | null;
    imagen: string | null;
    imagen_url: string | null;
    enlace: string | null;
    enlace_texto: string | null;
    orden: number;
    activo: boolean;
};

function Formulario({
    servicio,
    onCerrar,
}: {
    servicio: Servicio | null;
    onCerrar: () => void;
}) {
    const esEdicion = servicio !== null;
    const [selectorAbierto, setSelectorAbierto] = useState(false);

    const formulario = useForm({
        titulo: servicio?.titulo ?? '',
        contenido: servicio?.contenido ?? '',
        icono: servicio?.icono ?? '',
        imagen: servicio?.imagen ?? '',
        enlace: servicio?.enlace ?? '',
        enlace_texto: servicio?.enlace_texto ?? '',
        activo: servicio?.activo ?? true,
    });

    return (
        <form
            onSubmit={(evento) => {
                evento.preventDefault();
                formulario.submit(esEdicion ? update(servicio.id) : store(), {
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
                <Label htmlFor="contenido">Descripción</Label>
                <textarea
                    id="contenido"
                    rows={4}
                    value={formulario.data.contenido}
                    onChange={(evento) =>
                        formulario.setData('contenido', evento.target.value)
                    }
                    required
                    className="w-full resize-y rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <InputError message={formulario.errors.contenido} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="icono">
                    Icono
                    <span className="ml-1 font-normal text-muted-foreground">
                        (calendar, users, award, briefcase…)
                    </span>
                </Label>
                <div className="flex items-center gap-2">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-marca-suave text-marca">
                        <IconoPorNombre
                            nombre={formulario.data.icono}
                            className="size-4"
                        />
                    </span>
                    <Input
                        id="icono"
                        value={formulario.data.icono}
                        onChange={(evento) =>
                            formulario.setData('icono', evento.target.value)
                        }
                        placeholder="handshake"
                    />
                </div>
                <InputError message={formulario.errors.icono} />
            </div>

            <div className="grid gap-2">
                <Label>
                    Imagen
                    <span className="ml-1 font-normal text-muted-foreground">
                        (opcional)
                    </span>
                </Label>
                <div className="flex gap-2">
                    <Input
                        value={formulario.data.imagen}
                        onChange={(evento) =>
                            formulario.setData('imagen', evento.target.value)
                        }
                        className="flex-1"
                        aria-label="Imagen del servicio"
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
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="enlace">
                        Enlace del botón
                        <span className="ml-1 font-normal text-muted-foreground">
                            (opcional)
                        </span>
                    </Label>
                    <Input
                        id="enlace"
                        value={formulario.data.enlace}
                        onChange={(evento) =>
                            formulario.setData('enlace', evento.target.value)
                        }
                        placeholder="/convenios"
                    />
                    <InputError message={formulario.errors.enlace} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="enlace_texto">Texto del botón</Label>
                    <Input
                        id="enlace_texto"
                        value={formulario.data.enlace_texto}
                        onChange={(evento) =>
                            formulario.setData(
                                'enlace_texto',
                                evento.target.value,
                            )
                        }
                        placeholder="Ver más"
                        disabled={!formulario.data.enlace}
                    />
                    <InputError message={formulario.errors.enlace_texto} />
                </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
                <Checkbox
                    checked={formulario.data.activo}
                    onCheckedChange={(marcado) =>
                        formulario.setData('activo', marcado === true)
                    }
                />
                Mostrar en el sitio
            </label>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCerrar}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={formulario.processing}>
                    {esEdicion ? 'Guardar cambios' : 'Crear servicio'}
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

export default function ServiciosIndex({
    servicios,
}: {
    servicios: Servicio[];
}) {
    const [dialogoAbierto, setDialogoAbierto] = useState(false);
    const [editando, setEditando] = useState<Servicio | null>(null);
    const [aEliminar, setAEliminar] = useState<Servicio | null>(null);

    const abrir = (servicio: Servicio | null) => {
        setEditando(servicio);
        setDialogoAbierto(true);
    };

    return (
        <>
            <Head title="Servicios" />

            <PageHeader
                titulo="Servicios"
                descripcion="Lo que la Cámara ofrece a sus asociados. Arrastra para cambiar el orden en que se muestran."
                acciones={
                    <Button onClick={() => abrir(null)}>
                        <Plus className="size-4" />
                        Nuevo servicio
                    </Button>
                }
            />

            <ListaOrdenable
                elementos={servicios}
                rutaReordenar={reordenar().url}
                etiquetaDe={(servicio) => servicio.titulo}
                onEditar={abrir}
                onEliminar={setAEliminar}
                vacio={
                    <EmptyState
                        icono={Sparkles}
                        titulo="Todavía no hay servicios"
                        descripcion="Los servicios aparecen en la portada y en su propia página."
                        accion={
                            <Button onClick={() => abrir(null)}>
                                <Plus className="size-4" />
                                Nuevo servicio
                            </Button>
                        }
                    />
                }
            >
                {(servicio) => {
                    return (
                        <div className="flex min-w-0 items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-marca-suave text-marca">
                                <IconoPorNombre
                                    nombre={servicio.icono}
                                    className="size-4"
                                />
                            </span>
                            <span className="min-w-0">
                                <span className="block truncate font-medium">
                                    {servicio.titulo}
                                </span>
                                <span className="block truncate text-xs text-muted-foreground">
                                    {servicio.contenido}
                                </span>
                            </span>
                        </div>
                    );
                }}
            </ListaOrdenable>

            <Dialog
                open={dialogoAbierto}
                onOpenChange={(abierto) => {
                    setDialogoAbierto(abierto);

                    if (!abierto) {
                        setEditando(null);
                    }
                }}
            >
                <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editando ? 'Editar servicio' : 'Nuevo servicio'}
                        </DialogTitle>
                        <DialogDescription>
                            Aparece en el bloque «Servicios» de cualquier
                            página.
                        </DialogDescription>
                    </DialogHeader>

                    <Formulario
                        key={editando?.id ?? 'nuevo'}
                        servicio={editando}
                        onCerrar={() => setDialogoAbierto(false)}
                    />
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                abierto={aEliminar !== null}
                onAbiertoChange={(abierto) => !abierto && setAEliminar(null)}
                titulo="Eliminar servicio"
                descripcion={`«${aEliminar?.titulo ?? ''}» dejará de mostrarse en el sitio.`}
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

ServiciosIndex.layout = {
    migas: [{ titulo: 'Contenido' }, { titulo: 'Servicios' }],
};
