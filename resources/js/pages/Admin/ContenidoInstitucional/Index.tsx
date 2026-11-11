import { Head, useForm } from '@inertiajs/react';
import {
    EyeOff,
    FileText,
    FolderOpen,
    ImageIcon,
    ImagePlus,
    Pencil,
    ScrollText,
} from 'lucide-react';
import { useState } from 'react';
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
import { update } from '@/routes/admin/contenido-institucional';

type Seccion = {
    id: number;
    seccion: string;
    nombre: string;
    titulo: string;
    contenido: string;
    /** Lo que se guarda: ruta del disco o URL completa. */
    imagen: string | null;
    /** Dirección lista para pintar. */
    imagen_url: string | null;
    pdf: string | null;
    pdf_url: string | null;
    admite_pdf: boolean;
    activo: boolean;
};

/** Vista previa de lo escrito en el campo: una ruta del disco va a /storage. */
function direccion(valor: string): string {
    return /^https?:\/\//.test(valor) || valor.startsWith('/')
        ? valor
        : `/storage/${valor}`;
}

function Formulario({
    seccion,
    onCerrar,
}: {
    seccion: Seccion;
    onCerrar: () => void;
}) {
    const [selector, setSelector] = useState<'imagen' | 'pdf' | null>(null);

    const formulario = useForm({
        titulo: seccion.titulo,
        contenido: seccion.contenido,
        imagen: seccion.imagen ?? '',
        pdf: seccion.pdf ?? '',
        activo: seccion.activo,
    });

    return (
        <form
            onSubmit={(evento) => {
                evento.preventDefault();
                formulario.submit(update(seccion.id), {
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
                <Label htmlFor="contenido">Texto</Label>
                <textarea
                    id="contenido"
                    rows={6}
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
                <Label htmlFor="imagen">Imagen</Label>
                {formulario.data.imagen && (
                    <div className="w-48 overflow-hidden rounded-md border bg-muted">
                        <img
                            src={direccion(formulario.data.imagen)}
                            alt=""
                            className="aspect-[4/3] w-full object-cover"
                        />
                    </div>
                )}
                <div className="flex gap-2">
                    <Input
                        id="imagen"
                        value={formulario.data.imagen}
                        onChange={(evento) =>
                            formulario.setData('imagen', evento.target.value)
                        }
                        placeholder="Elige de la biblioteca o pega una dirección"
                        className="flex-1"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setSelector('imagen')}
                        aria-label="Elegir imagen de la biblioteca"
                    >
                        <ImagePlus className="size-4" />
                    </Button>
                </div>
                <InputError message={formulario.errors.imagen} />
            </div>

            {seccion.admite_pdf && (
                <div className="grid gap-2">
                    <Label htmlFor="pdf">PDF</Label>
                    <div className="flex gap-2">
                        <Input
                            id="pdf"
                            value={formulario.data.pdf}
                            onChange={(evento) =>
                                formulario.setData('pdf', evento.target.value)
                            }
                            placeholder="Elige de la biblioteca o pega una dirección"
                            className="flex-1"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setSelector('pdf')}
                            aria-label="Elegir PDF de la biblioteca"
                        >
                            <FolderOpen className="size-4" />
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        En el sitio se muestra como un libro que se hojea, con
                        la portada real del PDF y botón de descarga.
                    </p>
                    {formulario.data.pdf && (
                        <a
                            href={direccion(formulario.data.pdf)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex w-fit items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
                        >
                            <FileText className="size-3.5" />
                            Abrir el PDF elegido
                        </a>
                    )}
                    <InputError message={formulario.errors.pdf} />
                </div>
            )}

            <label className="flex items-center gap-2 text-sm">
                <Checkbox
                    checked={formulario.data.activo}
                    onCheckedChange={(marcado) =>
                        formulario.setData('activo', marcado === true)
                    }
                />
                Visible en la página «La Cámara»
            </label>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCerrar}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={formulario.processing}>
                    Guardar cambios
                </Button>
            </DialogFooter>

            <SelectorDeMedios
                abierto={selector !== null}
                onAbiertoChange={(abierto) => !abierto && setSelector(null)}
                soloImagenes={selector !== 'pdf'}
                onElegir={(medio) =>
                    selector && formulario.setData(selector, medio.url)
                }
            />
        </form>
    );
}

export default function ContenidoInstitucionalIndex({
    secciones,
}: {
    secciones: Seccion[];
}) {
    const [editando, setEditando] = useState<Seccion | null>(null);

    return (
        <>
            <Head title="Contenido institucional" />

            <PageHeader
                titulo="Contenido institucional"
                descripcion="Los textos, imágenes y documentos de la página «La Cámara»."
            />

            {secciones.length === 0 ? (
                <div className="rounded-xl border bg-card">
                    <EmptyState
                        icono={ScrollText}
                        titulo="No hay secciones"
                        descripcion="Las secciones de «La Cámara» se crean al cargar los datos iniciales del sitio."
                    />
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {secciones.map((seccion) => (
                        <article
                            key={seccion.id}
                            className="flex flex-col overflow-hidden rounded-xl border bg-card"
                        >
                            <div className="relative aspect-[16/7] bg-muted">
                                {seccion.imagen_url ? (
                                    <img
                                        src={seccion.imagen_url}
                                        alt=""
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="flex h-full items-center justify-center text-muted-foreground">
                                        <ImageIcon className="size-6" />
                                    </span>
                                )}
                                <Badge
                                    variant="secondary"
                                    className="absolute top-3 left-3"
                                >
                                    {seccion.nombre}
                                </Badge>
                            </div>

                            <div className="flex flex-1 flex-col gap-2 p-4">
                                <h3 className="font-semibold">
                                    {seccion.titulo}
                                </h3>
                                <p className="line-clamp-3 text-sm text-muted-foreground">
                                    {seccion.contenido}
                                </p>

                                <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
                                    {seccion.admite_pdf &&
                                        (seccion.pdf_url ? (
                                            <a
                                                href={seccion.pdf_url}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <Badge variant="outline">
                                                    <FileText className="size-3" />
                                                    PDF cargado
                                                </Badge>
                                            </a>
                                        ) : (
                                            <Badge
                                                variant="outline"
                                                className="text-muted-foreground"
                                            >
                                                Sin PDF
                                            </Badge>
                                        ))}
                                    {!seccion.activo && (
                                        <Badge
                                            variant="outline"
                                            className="text-muted-foreground"
                                        >
                                            <EyeOff className="size-3" />
                                            Oculta
                                        </Badge>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="ml-auto"
                                        onClick={() => setEditando(seccion)}
                                    >
                                        <Pencil className="size-3.5" />
                                        Editar
                                    </Button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            <Dialog
                open={editando !== null}
                onOpenChange={(abierto) => !abierto && setEditando(null)}
            >
                <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>
                            Editar «{editando?.nombre ?? ''}»
                        </DialogTitle>
                        <DialogDescription>
                            Los cambios se ven en la página «La Cámara» al
                            guardar.
                        </DialogDescription>
                    </DialogHeader>

                    {editando && (
                        <Formulario
                            key={editando.id}
                            seccion={editando}
                            onCerrar={() => setEditando(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

ContenidoInstitucionalIndex.layout = {
    migas: [{ titulo: 'Contenido' }, { titulo: 'Contenido institucional' }],
};
