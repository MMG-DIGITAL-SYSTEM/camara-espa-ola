import { Head, router, useForm } from '@inertiajs/react';
import { Check, Copy, ExternalLink, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { Paginacion } from '@/components/admin/data-table';
import {
    Miniatura,
    RejillaMedios,
    SinMedios,
    pesoLegible,
} from '@/components/admin/medios/rejilla-medios';
import type {
    Medio,
    MediosPaginados,
} from '@/components/admin/medios/rejilla-medios';
import { ZonaDeSubida } from '@/components/admin/medios/zona-de-subida';
import { PageHeader } from '@/components/admin/page-header';
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
import { destroy, index, update } from '@/routes/admin/medios';

type Props = {
    medios: MediosPaginados;
    filtros: { buscar?: string; tipo?: string };
};

function DetalleDelArchivo({
    medio,
    onCerrar,
    onEliminar,
}: {
    medio: Medio | null;
    onCerrar: () => void;
    onEliminar: (medio: Medio) => void;
}) {
    const [copiado, setCopiado] = useState(false);
    const formulario = useForm({ alt: medio?.alt ?? '' });

    if (!medio) {
        return null;
    }

    const copiar = () => {
        void navigator.clipboard.writeText(medio.url).then(() => {
            setCopiado(true);
            setTimeout(() => setCopiado(false), 1500);
        });
    };

    return (
        <Dialog open onOpenChange={(abierto) => !abierto && onCerrar()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="truncate">
                        {medio.nombre}
                    </DialogTitle>
                    <DialogDescription>
                        {medio.ancho && medio.alto
                            ? `${medio.ancho}×${medio.alto} píxeles · ${pesoLegible(medio.tamano)}`
                            : pesoLegible(medio.tamano)}
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-64 overflow-hidden rounded-lg border bg-muted">
                    <div className="flex h-64 items-center justify-center">
                        <Miniatura medio={medio} />
                    </div>
                </div>

                <form
                    onSubmit={(evento) => {
                        evento.preventDefault();
                        formulario.submit(update(medio.id), {
                            preserveScroll: true,
                            onSuccess: onCerrar,
                        });
                    }}
                    className="space-y-3"
                >
                    <div className="grid gap-1.5">
                        <Label htmlFor="alt">
                            Texto alternativo
                            <span className="ml-1 font-normal text-muted-foreground">
                                (lo leen los lectores de pantalla)
                            </span>
                        </Label>
                        <Input
                            id="alt"
                            value={formulario.data.alt}
                            onChange={(evento) =>
                                formulario.setData('alt', evento.target.value)
                            }
                            placeholder="Describe brevemente la imagen"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Input
                            readOnly
                            value={medio.url}
                            className="flex-1 text-xs text-muted-foreground"
                            aria-label="Dirección del archivo"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={copiar}
                            aria-label="Copiar dirección"
                        >
                            {copiado ? (
                                <Check className="size-4 text-emerald-600" />
                            ) : (
                                <Copy className="size-4" />
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            asChild
                            aria-label="Abrir en una pestaña nueva"
                        >
                            <a
                                href={medio.url}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <ExternalLink className="size-4" />
                            </a>
                        </Button>
                    </div>

                    <DialogFooter className="sm:justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            className="text-destructive hover:text-destructive"
                            onClick={() => onEliminar(medio)}
                        >
                            <Trash2 className="size-4" />
                            Eliminar
                        </Button>
                        <Button type="submit" disabled={formulario.processing}>
                            Guardar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function MediosIndex({ medios, filtros }: Props) {
    const [buscar, setBuscar] = useState(filtros.buscar ?? '');
    const [detalle, setDetalle] = useState<Medio | null>(null);
    const [aEliminar, setAEliminar] = useState<Medio | null>(null);

    const filtrar = (cambios: Record<string, string | undefined>) => {
        router.get(
            index().url,
            { buscar, tipo: filtros.tipo, ...cambios },
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Biblioteca de medios" />

            <PageHeader
                titulo="Biblioteca de medios"
                descripcion="Las imágenes y documentos que usan las páginas del sitio."
            />

            <div className="space-y-4">
                <ZonaDeSubida />

                <div className="flex flex-wrap items-center gap-2">
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
                            onChange={(evento) =>
                                setBuscar(evento.target.value)
                            }
                            placeholder="Buscar por nombre o descripción"
                            className="pl-9"
                            aria-label="Buscar archivos"
                        />
                    </form>

                    <Select
                        value={filtros.tipo ?? 'todos'}
                        onValueChange={(valor) =>
                            filtrar({
                                tipo: valor === 'todos' ? undefined : valor,
                            })
                        }
                    >
                        <SelectTrigger className="w-44">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todo</SelectItem>
                            <SelectItem value="imagenes">Imágenes</SelectItem>
                            <SelectItem value="documentos">
                                Documentos
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <span className="ml-auto text-sm text-muted-foreground tabular-nums">
                        {medios.total === 1
                            ? '1 archivo'
                            : `${medios.total} archivos`}
                    </span>
                </div>

                <RejillaMedios
                    medios={medios.data}
                    seleccionado={detalle?.id ?? null}
                    onElegir={setDetalle}
                    vacio={
                        <SinMedios
                            mensaje={
                                filtros.buscar
                                    ? `Nada coincide con «${filtros.buscar}».`
                                    : 'Todavía no has subido ningún archivo.'
                            }
                        />
                    }
                />

                <Paginacion
                    links={medios.links}
                    from={medios.from}
                    to={medios.to}
                    total={medios.total}
                />
            </div>

            <DetalleDelArchivo
                key={detalle?.id}
                medio={detalle}
                onCerrar={() => setDetalle(null)}
                onEliminar={(medio) => {
                    setDetalle(null);
                    setAEliminar(medio);
                }}
            />

            <ConfirmDialog
                abierto={aEliminar !== null}
                onAbiertoChange={(abierto) => !abierto && setAEliminar(null)}
                titulo="Eliminar archivo"
                descripcion={`«${aEliminar?.nombre ?? ''}» se borrará del servidor. Las páginas que lo usen se quedarán sin esa imagen.`}
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

MediosIndex.layout = {
    migas: [{ titulo: 'Recursos' }, { titulo: 'Biblioteca de medios' }],
};
