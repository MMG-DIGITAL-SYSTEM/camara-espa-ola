import { router } from '@inertiajs/react';
import { Loader2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { store } from '@/routes/admin/medios';

/**
 * Zona para soltar o elegir archivos.
 *
 * Sube por Inertia con `forceFormData`: así la respuesta refresca el listado
 * sin que haya que recargar a mano, y los errores de validación llegan por el
 * mismo camino que en cualquier formulario.
 */
export function ZonaDeSubida({ onSubido }: { onSubido?: () => void }) {
    const [encima, setEncima] = useState(false);
    const [subiendo, setSubiendo] = useState(false);
    const [progreso, setProgreso] = useState(0);
    const entrada = useRef<HTMLInputElement>(null);

    const subir = (archivos: FileList | null) => {
        if (!archivos?.length) {
            return;
        }

        router.post(
            store().url,
            { archivos: Array.from(archivos) },
            {
                forceFormData: true,
                preserveScroll: true,
                onStart: () => {
                    setSubiendo(true);
                    setProgreso(0);
                },
                onProgress: (evento) => setProgreso(evento?.percentage ?? 0),
                onFinish: () => {
                    setSubiendo(false);
                    setProgreso(0);

                    if (entrada.current) {
                        entrada.current.value = '';
                    }
                },
                onSuccess: () => onSubido?.(),
            },
        );
    };

    return (
        <div
            onDragOver={(evento) => {
                evento.preventDefault();
                setEncima(true);
            }}
            onDragLeave={() => setEncima(false)}
            onDrop={(evento) => {
                evento.preventDefault();
                setEncima(false);
                subir(evento.dataTransfer.files);
            }}
            className={cn(
                'rounded-xl border-2 border-dashed p-6 text-center transition-colors',
                encima ? 'border-marca bg-marca-suave/50' : 'border-border',
            )}
        >
            <input
                ref={entrada}
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={(evento) => subir(evento.target.files)}
                className="sr-only"
                id="subir-medios"
            />

            {subiendo ? (
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="size-5 animate-spin text-marca" />
                    <p className="text-sm text-muted-foreground">
                        Subiendo… {progreso}%
                    </p>
                    <div
                        className="h-1 w-40 overflow-hidden rounded-full bg-muted"
                        role="progressbar"
                        aria-valuenow={progreso}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    >
                        <div
                            className="h-full bg-marca transition-[width]"
                            style={{ width: `${progreso}%` }}
                        />
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-1.5">
                    <Upload className="size-5 text-muted-foreground" />
                    <p className="text-sm">
                        Arrastra archivos aquí o{' '}
                        <label
                            htmlFor="subir-medios"
                            className="cursor-pointer font-medium text-marca underline underline-offset-4"
                        >
                            elígelos
                        </label>
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Imágenes y PDF, hasta 8 MB cada uno
                    </p>
                </div>
            )}
        </div>
    );
}
