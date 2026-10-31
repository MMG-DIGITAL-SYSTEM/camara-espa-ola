import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ExternalLink,
    FileStack,
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
import { destroy, edit, index, store } from '@/routes/admin/paginas';

type PaginaFila = {
    id: number;
    titulo: string;
    slug: string;
    url: string;
    secciones: number;
    publicada: boolean;
    es_sistema: boolean;
    sin_publicar: boolean;
    actualizada: string | null;
};

type Props = {
    paginas: Paginado<PaginaFila>;
    filtros: { buscar?: string };
};

function DialogoNuevaPagina({
    abierto,
    onAbiertoChange,
}: {
    abierto: boolean;
    onAbiertoChange: (abierto: boolean) => void;
}) {
    const formulario = useForm({ titulo: '', slug: '' });

    return (
        <Dialog open={abierto} onOpenChange={onAbiertoChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Nueva página</DialogTitle>
                    <DialogDescription>
                        Al crearla se abre el editor para que montes las
                        secciones. No será visible hasta que la publiques.
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={(evento) => {
                        evento.preventDefault();
                        formulario.submit(store(), {
                            onSuccess: () => onAbiertoChange(false),
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
                                formulario.setData(
                                    'titulo',
                                    evento.target.value,
                                )
                            }
                            placeholder="Afíliate"
                            autoFocus
                            required
                        />
                        <InputError message={formulario.errors.titulo} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="slug">
                            Dirección
                            <span className="ml-1 font-normal text-muted-foreground">
                                (opcional)
                            </span>
                        </Label>
                        <div className="flex items-center gap-1">
                            <span className="text-sm text-muted-foreground">
                                /
                            </span>
                            <Input
                                id="slug"
                                value={formulario.data.slug}
                                onChange={(evento) =>
                                    formulario.setData(
                                        'slug',
                                        evento.target.value,
                                    )
                                }
                                placeholder="se genera del título"
                            />
                        </div>
                        <InputError message={formulario.errors.slug} />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onAbiertoChange(false)}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={formulario.processing}>
                            Crear y editar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function PaginasIndex({ paginas, filtros }: Props) {
    const [buscar, setBuscar] = useState(filtros.buscar ?? '');
    const [dialogoAbierto, setDialogoAbierto] = useState(false);
    const [aEliminar, setAEliminar] = useState<PaginaFila | null>(null);

    const columnas: Columna<PaginaFila>[] = [
        {
            clave: 'titulo',
            titulo: 'Página',
            render: (pagina) => (
                <div className="min-w-0">
                    <Link
                        href={edit(pagina.slug)}
                        className="font-medium hover:text-marca"
                    >
                        {pagina.titulo}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">
                        /{pagina.slug}
                    </p>
                </div>
            ),
        },
        {
            clave: 'estado',
            titulo: 'Estado',
            render: (pagina) => (
                <div className="flex flex-wrap items-center gap-1.5">
                    {pagina.publicada ? (
                        <Badge variant="secondary">Publicada</Badge>
                    ) : (
                        <Badge variant="outline">Borrador</Badge>
                    )}
                    {pagina.sin_publicar && pagina.publicada && (
                        <span className="text-xs text-amber-600">
                            cambios sin publicar
                        </span>
                    )}
                </div>
            ),
        },
        {
            clave: 'secciones',
            titulo: 'Secciones',
            ocultarEnMovil: true,
            render: (pagina) => (
                <span className="tabular-nums">{pagina.secciones}</span>
            ),
        },
        {
            clave: 'actualizada',
            titulo: 'Actualizada',
            ocultarEnMovil: true,
            render: (pagina) => pagina.actualizada ?? '—',
        },
    ];

    return (
        <>
            <Head title="Páginas" />

            <PageHeader
                titulo="Páginas"
                descripcion="Las páginas que se construyen con bloques, sin tocar código."
                acciones={
                    <Button onClick={() => setDialogoAbierto(true)}>
                        <Plus className="size-4" />
                        Nueva página
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
                    placeholder="Buscar por título o dirección"
                    className="pl-9"
                    aria-label="Buscar páginas"
                />
            </form>

            <DataTable
                columnas={columnas}
                filas={paginas.data}
                vacio={
                    <EmptyState
                        icono={FileStack}
                        titulo="Todavía no hay páginas"
                        descripcion="Crea la primera y móntala arrastrando bloques."
                        accion={
                            <Button onClick={() => setDialogoAbierto(true)}>
                                <Plus className="size-4" />
                                Nueva página
                            </Button>
                        }
                    />
                }
                acciones={(pagina) => (
                    <div className="flex justify-end gap-1">
                        {pagina.publicada && (
                            <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                aria-label={`Ver ${pagina.titulo} en el sitio`}
                            >
                                <a
                                    href={pagina.url}
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
                            asChild
                            aria-label={`Editar ${pagina.titulo}`}
                        >
                            <Link href={edit(pagina.slug)}>
                                <Pencil className="size-4" />
                            </Link>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            disabled={pagina.es_sistema}
                            title={
                                pagina.es_sistema
                                    ? 'Las páginas de sistema no se eliminan'
                                    : undefined
                            }
                            onClick={() => setAEliminar(pagina)}
                            aria-label={`Eliminar ${pagina.titulo}`}
                            className="text-muted-foreground hover:text-destructive"
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                )}
            />

            <Paginacion
                links={paginas.links}
                from={paginas.from}
                to={paginas.to}
                total={paginas.total}
            />

            <DialogoNuevaPagina
                abierto={dialogoAbierto}
                onAbiertoChange={setDialogoAbierto}
            />

            <ConfirmDialog
                abierto={aEliminar !== null}
                onAbiertoChange={(abierto) => !abierto && setAEliminar(null)}
                titulo="Eliminar página"
                descripcion={`«${aEliminar?.titulo ?? ''}» dejará de estar disponible en el sitio. Sus versiones publicadas se conservan.`}
                textoConfirmar="Eliminar"
                onConfirmar={() => {
                    if (!aEliminar) {
                        return;
                    }

                    router.delete(destroy(aEliminar.slug), {
                        preserveScroll: true,
                        onFinish: () => setAEliminar(null),
                    });
                }}
            />
        </>
    );
}

PaginasIndex.layout = {
    migas: [{ titulo: 'Contenido' }, { titulo: 'Páginas' }],
};
