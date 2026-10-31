import { FileText, ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Medio = {
    id: number;
    url: string;
    nombre: string;
    mime: string;
    tamano: number;
    ancho: number | null;
    alto: number | null;
    alt: string | null;
    es_imagen: boolean;
};

export type MediosPaginados = {
    data: Medio[];
    links: { url: string | null; label: string; active: boolean }[];
    from: number | null;
    to: number | null;
    total: number;
};

export function pesoLegible(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    const kb = bytes / 1024;

    return kb < 1024 ? `${Math.round(kb)} KB` : `${(kb / 1024).toFixed(1)} MB`;
}

/**
 * Miniatura de un archivo. Los documentos no tienen vista previa, así que
 * muestran su icono y su nombre.
 */
export function Miniatura({ medio }: { medio: Medio }) {
    if (!medio.es_imagen) {
        return (
            <span className="flex h-full flex-col items-center justify-center gap-1.5 bg-muted p-3 text-center">
                <FileText className="size-6 text-muted-foreground" />
                <span className="line-clamp-2 text-[11px] text-muted-foreground">
                    {medio.nombre}
                </span>
            </span>
        );
    }

    return (
        <img
            src={medio.url}
            alt={medio.alt ?? ''}
            loading="lazy"
            className="h-full w-full object-cover"
        />
    );
}

/**
 * Rejilla de archivos. La usan tanto la biblioteca como el selector que se
 * abre desde el editor de páginas.
 */
export function RejillaMedios({
    medios,
    seleccionado,
    onElegir,
    vacio,
}: {
    medios: Medio[];
    seleccionado?: number | null;
    onElegir: (medio: Medio) => void;
    vacio: React.ReactNode;
}) {
    if (medios.length === 0) {
        return <>{vacio}</>;
    }

    return (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {medios.map((medio) => (
                <li key={medio.id}>
                    <button
                        type="button"
                        onClick={() => onElegir(medio)}
                        aria-pressed={seleccionado === medio.id}
                        className={cn(
                            'group block w-full overflow-hidden rounded-lg border bg-card text-left transition-all hover:shadow-sm',
                            seleccionado === medio.id
                                ? 'border-marca ring-2 ring-marca/30'
                                : 'hover:border-marca/40',
                        )}
                    >
                        <span className="block aspect-square overflow-hidden bg-muted">
                            <Miniatura medio={medio} />
                        </span>
                        <span className="block px-2 py-1.5">
                            <span className="block truncate text-xs font-medium">
                                {medio.nombre}
                            </span>
                            <span className="block truncate text-[11px] text-muted-foreground">
                                {medio.ancho && medio.alto
                                    ? `${medio.ancho}×${medio.alto} · ${pesoLegible(medio.tamano)}`
                                    : pesoLegible(medio.tamano)}
                            </span>
                        </span>
                    </button>
                </li>
            ))}
        </ul>
    );
}

export function SinMedios({ mensaje }: { mensaje: string }) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-6 py-16 text-center">
            <ImageOff className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{mensaje}</p>
        </div>
    );
}
