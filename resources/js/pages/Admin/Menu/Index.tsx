import { Head, router, useForm } from '@inertiajs/react';
import {
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Menu,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { EmptyState } from '@/components/admin/empty-state';
import { ListaOrdenable } from '@/components/admin/lista-ordenable';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { destroy, reordenar, store, update } from '@/routes/admin/menu';

type Ubicacion = 'principal' | 'pie';

type Entrada = {
    id: number;
    titulo: string;
    url: string | null;
    ubicacion: Ubicacion;
    padre_id: number | null;
    orden: number;
    activo: boolean;
    nueva_pestana: boolean;
};

type EntradaConHijos = Entrada & { hijos: Entrada[] };

type Destino = { url: string; titulo: string };

type Props = {
    menus: { principal: EntradaConHijos[]; pie: EntradaConHijos[] };
    destinos: Destino[];
};

/** Datos con los que se abre el formulario. */
type Borrador = {
    entrada: Entrada | null;
    ubicacion: Ubicacion;
    padreId: number | null;
};

const SIN_PADRE = 'ninguno';

function Formulario({
    borrador,
    padresPosibles,
    destinos,
    onCerrar,
}: {
    borrador: Borrador;
    padresPosibles: EntradaConHijos[];
    destinos: Destino[];
    onCerrar: () => void;
}) {
    const { entrada, ubicacion, padreId } = borrador;
    const esEdicion = entrada !== null;

    const formulario = useForm({
        ubicacion,
        titulo: entrada?.titulo ?? '',
        url: entrada?.url ?? '',
        padre_id: entrada?.padre_id ?? padreId,
        activo: entrada?.activo ?? true,
        nueva_pestana: entrada?.nueva_pestana ?? false,
    });

    // Una entrada que ya tiene subentradas no puede convertirse en subentrada.
    const tieneHijos = padresPosibles.some(
        (p) => p.id === entrada?.id && p.hijos.length > 0,
    );

    return (
        <form
            onSubmit={(evento) => {
                evento.preventDefault();
                formulario.submit(esEdicion ? update(entrada.id) : store(), {
                    preserveScroll: true,
                    onSuccess: onCerrar,
                });
            }}
            className="space-y-4"
        >
            <div className="grid gap-2">
                <Label htmlFor="titulo">Texto del enlace</Label>
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
                <Label htmlFor="url">
                    Dirección
                    <span className="ml-1 font-normal text-muted-foreground">
                        (déjala vacía si solo despliega un submenú)
                    </span>
                </Label>
                <Input
                    id="url"
                    list="destinos-del-sitio"
                    value={formulario.data.url ?? ''}
                    onChange={(evento) =>
                        formulario.setData('url', evento.target.value)
                    }
                    placeholder="/la-camara"
                />
                <datalist id="destinos-del-sitio">
                    {destinos.map((destino) => (
                        <option key={destino.url} value={destino.url}>
                            {destino.titulo}
                        </option>
                    ))}
                </datalist>
                <InputError message={formulario.errors.url} />
            </div>

            {formulario.data.ubicacion === 'principal' && !tieneHijos && (
                <div className="grid gap-2">
                    <Label htmlFor="padre_id">Depende de</Label>
                    <Select
                        value={
                            formulario.data.padre_id
                                ? String(formulario.data.padre_id)
                                : SIN_PADRE
                        }
                        onValueChange={(valor) =>
                            formulario.setData(
                                'padre_id',
                                valor === SIN_PADRE ? null : Number(valor),
                            )
                        }
                    >
                        <SelectTrigger id="padre_id">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={SIN_PADRE}>
                                Nada (entrada principal)
                            </SelectItem>
                            {padresPosibles
                                .filter((p) => p.id !== entrada?.id)
                                .map((padre) => (
                                    <SelectItem
                                        key={padre.id}
                                        value={String(padre.id)}
                                    >
                                        {padre.titulo}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                    <InputError message={formulario.errors.padre_id} />
                </div>
            )}

            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                        checked={formulario.data.activo}
                        onCheckedChange={(marcado) =>
                            formulario.setData('activo', marcado === true)
                        }
                    />
                    Mostrar en el sitio
                </label>

                <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                        checked={formulario.data.nueva_pestana}
                        onCheckedChange={(marcado) =>
                            formulario.setData(
                                'nueva_pestana',
                                marcado === true,
                            )
                        }
                    />
                    Abrir en una pestaña nueva
                </label>
            </div>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCerrar}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={formulario.processing}>
                    {esEdicion ? 'Guardar cambios' : 'Añadir al menú'}
                </Button>
            </DialogFooter>
        </form>
    );
}

function FilaDeMenu({ entrada }: { entrada: Entrada }) {
    return (
        <div className="min-w-0">
            <span className="flex items-center gap-1.5">
                <span className="truncate font-medium">{entrada.titulo}</span>
                {entrada.nueva_pestana && (
                    <ExternalLink className="size-3 shrink-0 text-muted-foreground" />
                )}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
                {entrada.url || 'Solo despliega un submenú'}
            </span>
        </div>
    );
}

/**
 * Subentradas de un desplegable.
 *
 * Se reordenan con botones y no arrastrando: anidar un DndContext dentro de
 * otro hace que ambos respondan al mismo gesto. Son listas de dos o tres
 * elementos, así que los botones bastan.
 */
function SubEntradas({
    hijos,
    onEditar,
    onEliminar,
}: {
    hijos: Entrada[];
    onEditar: (hijo: Entrada) => void;
    onEliminar: (hijo: Entrada) => void;
}) {
    const mover = (indice: number, salto: number) => {
        const destino = indice + salto;

        if (destino < 0 || destino >= hijos.length) {
            return;
        }

        const copia = [...hijos];
        [copia[indice], copia[destino]] = [copia[destino], copia[indice]];

        router.post(
            reordenar().url,
            { ids: copia.map((h) => h.id) },
            { preserveScroll: true },
        );
    };

    return (
        <ul className="space-y-0.5">
            {hijos.map((hijo, indice) => (
                <li
                    key={hijo.id}
                    className={cn(
                        'flex items-center gap-1 rounded-md px-1.5 py-1 hover:bg-muted/60',
                        !hijo.activo && 'opacity-60',
                    )}
                >
                    <div className="min-w-0 flex-1">
                        <FilaDeMenu entrada={hijo} />
                    </div>

                    <button
                        type="button"
                        onClick={() => mover(indice, -1)}
                        disabled={indice === 0}
                        aria-label={`Subir ${hijo.titulo}`}
                        className="flex size-6 items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                        <ChevronUp className="size-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => mover(indice, 1)}
                        disabled={indice === hijos.length - 1}
                        aria-label={`Bajar ${hijo.titulo}`}
                        className="flex size-6 items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                        <ChevronDown className="size-3.5" />
                    </button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => onEditar(hijo)}
                        aria-label={`Editar ${hijo.titulo}`}
                    >
                        <Pencil className="size-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-destructive"
                        onClick={() => onEliminar(hijo)}
                        aria-label={`Eliminar ${hijo.titulo}`}
                    >
                        <Trash2 className="size-3.5" />
                    </Button>
                </li>
            ))}
        </ul>
    );
}

function Seccion({
    titulo,
    descripcion,
    ubicacion,
    entradas,
    onAbrir,
    onEliminar,
}: {
    titulo: string;
    descripcion: string;
    ubicacion: Ubicacion;
    entradas: EntradaConHijos[];
    onAbrir: (borrador: Borrador) => void;
    onEliminar: (entrada: Entrada) => void;
}) {
    return (
        <section className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                    <h2 className="font-medium">{titulo}</h2>
                    <p className="text-sm text-muted-foreground">
                        {descripcion}
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        onAbrir({ entrada: null, ubicacion, padreId: null })
                    }
                >
                    <Plus className="size-4" />
                    Añadir entrada
                </Button>
            </div>

            <ListaOrdenable
                elementos={entradas}
                rutaReordenar={reordenar().url}
                etiquetaDe={(entrada) => entrada.titulo}
                onEditar={(entrada) =>
                    onAbrir({ entrada, ubicacion, padreId: null })
                }
                onEliminar={onEliminar}
                vacio={
                    <EmptyState
                        icono={Menu}
                        titulo="Este menú está vacío"
                        descripcion="Añade la primera entrada."
                        accion={
                            <Button
                                onClick={() =>
                                    onAbrir({
                                        entrada: null,
                                        ubicacion,
                                        padreId: null,
                                    })
                                }
                            >
                                <Plus className="size-4" />
                                Añadir entrada
                            </Button>
                        }
                    />
                }
            >
                {(entrada) => (
                    <div className="space-y-2">
                        <FilaDeMenu entrada={entrada} />

                        {ubicacion === 'principal' && (
                            <div className="ml-1 border-l pl-3">
                                {entrada.hijos.length > 0 && (
                                    <SubEntradas
                                        hijos={entrada.hijos}
                                        onEditar={(hijo) =>
                                            onAbrir({
                                                entrada: hijo,
                                                ubicacion,
                                                padreId: entrada.id,
                                            })
                                        }
                                        onEliminar={onEliminar}
                                    />
                                )}

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="mt-1 h-7 text-xs text-muted-foreground"
                                    onClick={() =>
                                        onAbrir({
                                            entrada: null,
                                            ubicacion,
                                            padreId: entrada.id,
                                        })
                                    }
                                >
                                    <Plus className="size-3.5" />
                                    Subentrada
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </ListaOrdenable>
        </section>
    );
}

export default function MenuIndex({ menus, destinos }: Props) {
    const [borrador, setBorrador] = useState<Borrador | null>(null);
    const [aEliminar, setAEliminar] = useState<Entrada | null>(null);

    return (
        <>
            <Head title="Menú del sitio" />

            <PageHeader
                titulo="Menú del sitio"
                descripcion="La barra de navegación y los enlaces del pie. Arrastra para cambiar el orden."
            />

            <div className="space-y-8">
                <Seccion
                    titulo="Barra de navegación"
                    descripcion="Admite dos niveles: entradas principales y sus submenús."
                    ubicacion="principal"
                    entradas={menus.principal}
                    onAbrir={setBorrador}
                    onEliminar={setAEliminar}
                />

                <Seccion
                    titulo="Pie de página"
                    descripcion="La columna «Explora» del pie. Un solo nivel."
                    ubicacion="pie"
                    entradas={menus.pie}
                    onAbrir={setBorrador}
                    onEliminar={setAEliminar}
                />
            </div>

            <Dialog
                open={borrador !== null}
                onOpenChange={(abierto) => !abierto && setBorrador(null)}
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {borrador?.entrada
                                ? 'Editar entrada'
                                : 'Nueva entrada'}
                        </DialogTitle>
                        <DialogDescription>
                            Los cambios se ven en el sitio al guardar.
                        </DialogDescription>
                    </DialogHeader>

                    {borrador && (
                        <Formulario
                            borrador={borrador}
                            padresPosibles={menus.principal}
                            destinos={destinos}
                            onCerrar={() => setBorrador(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                abierto={aEliminar !== null}
                onAbiertoChange={(abierto) => !abierto && setAEliminar(null)}
                titulo="Eliminar entrada del menú"
                descripcion={`«${aEliminar?.titulo ?? ''}» dejará de aparecer. Si tiene subentradas, también se eliminan.`}
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

MenuIndex.layout = {
    migas: [{ titulo: 'Contenido' }, { titulo: 'Menú del sitio' }],
};
