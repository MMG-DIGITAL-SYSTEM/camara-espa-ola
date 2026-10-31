import { Link } from '@inertiajs/react';
import { Monitor, Moon, Search, Sun } from 'lucide-react';
import { Fragment } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useAppearance } from '@/hooks/use-appearance';
import type { Appearance } from '@/hooks/use-appearance';

export type Miga = { titulo: string; href?: string };

const TEMAS: { valor: Appearance; icono: typeof Sun; etiqueta: string }[] = [
    { valor: 'light', icono: Sun, etiqueta: 'Claro' },
    { valor: 'dark', icono: Moon, etiqueta: 'Oscuro' },
    { valor: 'system', icono: Monitor, etiqueta: 'Sistema' },
];

export function AdminTopbar({
    migas = [],
    onBuscar,
}: {
    migas?: Miga[];
    onBuscar: () => void;
}) {
    const { appearance, updateAppearance } = useAppearance();

    return (
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur-sm">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-1 h-4" />

            <nav
                aria-label="Ruta de navegación"
                className="flex min-w-0 items-center gap-1.5 text-sm"
            >
                {migas.map((miga, indice) => {
                    const esUltima = indice === migas.length - 1;

                    return (
                        <Fragment key={`${miga.titulo}-${indice}`}>
                            {indice > 0 && (
                                <span
                                    aria-hidden
                                    className="text-muted-foreground/50"
                                >
                                    /
                                </span>
                            )}
                            {miga.href && !esUltima ? (
                                <Link
                                    href={miga.href}
                                    className="truncate text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    {miga.titulo}
                                </Link>
                            ) : (
                                <span
                                    className="truncate font-medium"
                                    aria-current={esUltima ? 'page' : undefined}
                                >
                                    {miga.titulo}
                                </span>
                            )}
                        </Fragment>
                    );
                })}
            </nav>

            <div className="ml-auto flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onBuscar}
                    className="gap-2 text-muted-foreground"
                >
                    <Search className="size-4" />
                    <span className="hidden sm:inline">Buscar</span>
                    <kbd className="hidden rounded border bg-muted px-1.5 font-mono text-[10px] sm:inline">
                        Ctrl K
                    </kbd>
                </Button>

                <ToggleGroup
                    type="single"
                    value={appearance}
                    onValueChange={(valor) =>
                        valor && updateAppearance(valor as Appearance)
                    }
                    className="rounded-md border p-0.5"
                >
                    {TEMAS.map(({ valor, icono: Icono, etiqueta }) => (
                        <ToggleGroupItem
                            key={valor}
                            value={valor}
                            aria-label={`Tema ${etiqueta.toLowerCase()}`}
                            title={etiqueta}
                            className="size-7 rounded-sm data-[state=on]:bg-marca-suave data-[state=on]:text-marca"
                        >
                            <Icono className="size-3.5" />
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>
            </div>
        </header>
    );
}
