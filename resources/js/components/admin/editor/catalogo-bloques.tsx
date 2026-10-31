import { bloquesPorCategoria } from '@/blocks/registro';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { TONO_CATEGORIA } from './tonos';

export function CatalogoBloques({
    abierto,
    onAbiertoChange,
    onElegir,
}: {
    abierto: boolean;
    onAbiertoChange: (abierto: boolean) => void;
    onElegir: (clave: string) => void;
}) {
    return (
        <Sheet open={abierto} onOpenChange={onAbiertoChange}>
            <SheetContent side="left" className="w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>Añadir una sección</SheetTitle>
                    <SheetDescription>
                        Se colocará debajo de la sección seleccionada, o al
                        final si no hay ninguna.
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6 overflow-y-auto px-4 pb-6">
                    {bloquesPorCategoria().map(([categoria, bloques]) => (
                        <section key={categoria}>
                            <h3 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                {categoria}
                            </h3>
                            <ul className="grid gap-2 sm:grid-cols-2">
                                {bloques.map((definicion) => {
                                    const Icono = definicion.icono;

                                    return (
                                        <li key={definicion.clave}>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    onElegir(definicion.clave);
                                                    onAbiertoChange(false);
                                                }}
                                                className="group flex h-full w-full flex-col gap-1.5 rounded-xl border bg-card p-3 text-left transition-all hover:-translate-y-0.5 hover:border-marca/40 hover:shadow-lg hover:shadow-marca/10"
                                            >
                                                <span
                                                    className={cn(
                                                        'flex size-9 items-center justify-center rounded-lg transition-all group-hover:scale-105 group-hover:degradado-marca group-hover:text-white',
                                                        TONO_CATEGORIA[
                                                            definicion.categoria
                                                        ],
                                                    )}
                                                >
                                                    <Icono className="size-4" />
                                                </span>
                                                <span className="text-sm font-medium">
                                                    {definicion.nombre}
                                                </span>
                                                <span className="text-xs leading-snug text-muted-foreground">
                                                    {definicion.descripcion}
                                                </span>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>
                    ))}
                </div>
            </SheetContent>
        </Sheet>
    );
}
