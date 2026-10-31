import { Head, router, useForm } from '@inertiajs/react';
import { ImagePlus, Plus, UserRound } from 'lucide-react';
import { useState } from 'react';
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
import { destroy, reordenar, store, update } from '@/routes/admin/directivos';

type Directivo = {
    id: number;
    nombre: string;
    cargo: string | null;
    empresa: string | null;
    imagen: string | null;
    imagen_url: string | null;
    orden: number;
    activo: boolean;
};

function Formulario({
    directivo,
    onCerrar,
}: {
    directivo: Directivo | null;
    onCerrar: () => void;
}) {
    const esEdicion = directivo !== null;
    const [selectorAbierto, setSelectorAbierto] = useState(false);

    const formulario = useForm({
        nombre: directivo?.nombre ?? '',
        cargo: directivo?.cargo ?? '',
        empresa: directivo?.empresa ?? '',
        imagen: directivo?.imagen ?? '',
        activo: directivo?.activo ?? true,
    });

    return (
        <form
            onSubmit={(evento) => {
                evento.preventDefault();
                formulario.submit(esEdicion ? update(directivo.id) : store(), {
                    preserveScroll: true,
                    onSuccess: onCerrar,
                });
            }}
            className="space-y-4"
        >
            <div className="grid gap-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                    id="nombre"
                    value={formulario.data.nombre}
                    onChange={(evento) =>
                        formulario.setData('nombre', evento.target.value)
                    }
                    required
                    autoFocus
                />
                <InputError message={formulario.errors.nombre} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="cargo">Cargo</Label>
                    <Input
                        id="cargo"
                        value={formulario.data.cargo}
                        onChange={(evento) =>
                            formulario.setData('cargo', evento.target.value)
                        }
                        placeholder="Presidente"
                    />
                    <InputError message={formulario.errors.cargo} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="empresa">Empresa</Label>
                    <Input
                        id="empresa"
                        value={formulario.data.empresa}
                        onChange={(evento) =>
                            formulario.setData('empresa', evento.target.value)
                        }
                    />
                    <InputError message={formulario.errors.empresa} />
                </div>
            </div>

            <div className="grid gap-2">
                <Label>Fotografía</Label>
                {formulario.data.imagen && (
                    <div className="size-24 overflow-hidden rounded-lg border bg-muted">
                        <img
                            src={formulario.data.imagen}
                            alt=""
                            className="h-full w-full object-cover"
                        />
                    </div>
                )}
                <div className="flex gap-2">
                    <Input
                        value={formulario.data.imagen}
                        onChange={(evento) =>
                            formulario.setData('imagen', evento.target.value)
                        }
                        className="flex-1"
                        aria-label="Fotografía"
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

            <label className="flex items-center gap-2 text-sm">
                <Checkbox
                    checked={formulario.data.activo}
                    onCheckedChange={(marcado) =>
                        formulario.setData('activo', marcado === true)
                    }
                />
                Mostrar en el directorio
            </label>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCerrar}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={formulario.processing}>
                    {esEdicion ? 'Guardar cambios' : 'Añadir al directorio'}
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

export default function DirectivosIndex({
    directivos,
}: {
    directivos: Directivo[];
}) {
    const [dialogoAbierto, setDialogoAbierto] = useState(false);
    const [editando, setEditando] = useState<Directivo | null>(null);
    const [aEliminar, setAEliminar] = useState<Directivo | null>(null);

    const abrir = (directivo: Directivo | null) => {
        setEditando(directivo);
        setDialogoAbierto(true);
    };

    return (
        <>
            <Head title="Directivos" />

            <PageHeader
                titulo="Directorio"
                descripcion="Las personas que aparecen en el bloque «Directorio». Arrastra para cambiar el orden."
                acciones={
                    <Button onClick={() => abrir(null)}>
                        <Plus className="size-4" />
                        Añadir persona
                    </Button>
                }
            />

            <ListaOrdenable
                elementos={directivos}
                rutaReordenar={reordenar().url}
                etiquetaDe={(directivo) => directivo.nombre}
                onEditar={abrir}
                onEliminar={setAEliminar}
                vacio={
                    <EmptyState
                        icono={UserRound}
                        titulo="El directorio está vacío"
                        descripcion="Añade a las personas que quieras mostrar en La Cámara."
                        accion={
                            <Button onClick={() => abrir(null)}>
                                <Plus className="size-4" />
                                Añadir persona
                            </Button>
                        }
                    />
                }
            >
                {(directivo) => (
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="size-9 shrink-0 overflow-hidden rounded-full bg-muted">
                            {directivo.imagen_url ? (
                                <img
                                    src={directivo.imagen_url}
                                    alt=""
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span className="flex h-full items-center justify-center">
                                    <UserRound className="size-4 text-muted-foreground" />
                                </span>
                            )}
                        </span>
                        <span className="min-w-0">
                            <span className="block truncate font-medium">
                                {directivo.nombre}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                                {[directivo.cargo, directivo.empresa]
                                    .filter(Boolean)
                                    .join(' · ') || '—'}
                            </span>
                        </span>
                    </div>
                )}
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
                            {editando
                                ? 'Editar persona'
                                : 'Añadir al directorio'}
                        </DialogTitle>
                        <DialogDescription>
                            Aparece en el bloque «Directorio» de cualquier
                            página.
                        </DialogDescription>
                    </DialogHeader>

                    <Formulario
                        key={editando?.id ?? 'nuevo'}
                        directivo={editando}
                        onCerrar={() => setDialogoAbierto(false)}
                    />
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                abierto={aEliminar !== null}
                onAbiertoChange={(abierto) => !abierto && setAEliminar(null)}
                titulo="Retirar del directorio"
                descripcion={`${aEliminar?.nombre ?? ''} dejará de aparecer en el sitio.`}
                textoConfirmar="Retirar"
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

DirectivosIndex.layout = {
    migas: [{ titulo: 'Contenido' }, { titulo: 'Directivos' }],
};
