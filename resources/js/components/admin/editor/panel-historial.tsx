import { router } from '@inertiajs/react';
import { Check, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { peticionJson } from '@/lib/http';
import { revertir, versiones as rutaVersiones } from '@/routes/admin/paginas';

type Version = {
    id: number;
    etiqueta: string | null;
    autor: string;
    secciones: number;
    cuando: string;
    fecha: string;
    es_la_publicada: boolean;
};

export function PanelHistorial({
    abierto,
    onAbiertoChange,
    slug,
}: {
    abierto: boolean;
    onAbiertoChange: (abierto: boolean) => void;
    slug: string;
}) {
    return (
        <Sheet open={abierto} onOpenChange={onAbiertoChange}>
            <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>Historial de publicaciones</SheetTitle>
                    <SheetDescription>
                        Restaurar trae el contenido de esa versión al borrador.
                        No cambia lo que ve el público hasta que publiques.
                    </SheetDescription>
                </SheetHeader>

                <ListaVersiones
                    slug={slug}
                    onCerrar={() => onAbiertoChange(false)}
                />
            </SheetContent>
        </Sheet>
    );
}

function ListaVersiones({
    slug,
    onCerrar,
}: {
    slug: string;
    onCerrar: () => void;
}) {
    const [versiones, setVersiones] = useState<Version[] | null>(null);

    useEffect(() => {
        const control = new AbortController();

        peticionJson<{ versiones: Version[] }>(
            rutaVersiones(slug).url,
            'GET',
            undefined,
            control.signal,
        )
            .then((respuesta) => setVersiones(respuesta.versiones))
            .catch(() => setVersiones([]));

        return () => control.abort();
    }, [slug]);

    return (
        <div className="space-y-2 overflow-y-auto px-4 pb-6">
            {versiones === null &&
                Array.from({ length: 4 }).map((_, indice) => (
                    <Skeleton key={indice} className="h-20 w-full" />
                ))}

            {versiones?.length === 0 && (
                <p className="py-10 text-center text-sm text-muted-foreground">
                    Todavía no has publicado esta página.
                </p>
            )}

            {versiones?.map((version) => (
                <article key={version.id} className="rounded-lg border p-3">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <p className="flex items-center gap-2 text-sm font-medium">
                                {version.etiqueta || version.fecha}
                                {version.es_la_publicada && (
                                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-marca-suave px-1.5 py-0.5 text-[10px] font-medium text-marca">
                                        <Check className="size-2.5" />
                                        En línea
                                    </span>
                                )}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                {version.autor} · {version.cuando} ·{' '}
                                {version.secciones === 1
                                    ? '1 sección'
                                    : `${version.secciones} secciones`}
                            </p>
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="shrink-0"
                            onClick={() => {
                                router.post(
                                    revertir([slug, version.id]).url,
                                    {},
                                    {
                                        preserveScroll: true,
                                        onSuccess: () => onCerrar(),
                                    },
                                );
                            }}
                        >
                            <RotateCcw className="size-3.5" />
                            Restaurar
                        </Button>
                    </div>
                </article>
            ))}
        </div>
    );
}
