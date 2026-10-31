import { router, usePage } from '@inertiajs/react';
import { CornerDownLeft, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import { navegacionDe } from '@/config/admin-nav';
import type { AdminNavItem } from '@/config/admin-nav';
import { cn } from '@/lib/utils';

type Resultado = AdminNavItem & { grupo: string; href: string };

/** Quita acentos y pasa a minúsculas, para que «paginas» encuentre «Páginas». */
function normalizar(texto: string): string {
    return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function CommandPalette({
    abierto,
    onAbiertoChange,
}: {
    abierto: boolean;
    onAbiertoChange: (abierto: boolean) => void;
}) {
    return (
        <Dialog open={abierto} onOpenChange={onAbiertoChange}>
            <DialogContent
                className="top-[18%] max-w-xl translate-y-0 gap-0 overflow-hidden p-0"
                showCloseButton={false}
            >
                <DialogTitle className="sr-only">
                    Buscar en el panel
                </DialogTitle>
                <DialogDescription className="sr-only">
                    Escribe para filtrar las secciones del panel y pulsa Intro
                    para abrir la seleccionada.
                </DialogDescription>

                {/* Se monta al abrir: la búsqueda empieza siempre vacía. */}
                <Buscador onCerrar={() => onAbiertoChange(false)} />
            </DialogContent>
        </Dialog>
    );
}

function Buscador({ onCerrar }: { onCerrar: () => void }) {
    const [consulta, setConsulta] = useState('');
    const [resaltado, setResaltado] = useState(0);
    const usuario = usePage().props.auth.user;
    const esAdmin = usuario?.es_admin ?? false;
    const listaRef = useRef<HTMLDivElement>(null);

    const disponibles = useMemo<Resultado[]>(
        () =>
            navegacionDe(usuario).flatMap((grupo) =>
                grupo.items
                    .filter(
                        (item): item is AdminNavItem & { href: string } =>
                            Boolean(item.href) && (!item.soloAdmin || esAdmin),
                    )
                    .map((item) => ({ ...item, grupo: grupo.titulo })),
            ),
        [usuario, esAdmin],
    );

    const resultados = useMemo(() => {
        const termino = normalizar(consulta.trim());

        if (!termino) {
            return disponibles;
        }

        return disponibles.filter((item) =>
            normalizar(
                `${item.titulo} ${item.grupo} ${item.busqueda ?? ''}`,
            ).includes(termino),
        );
    }, [consulta, disponibles]);

    // Mantiene visible la fila resaltada al navegar con el teclado.
    useEffect(() => {
        listaRef.current
            ?.querySelector('[data-resaltado="true"]')
            ?.scrollIntoView({ block: 'nearest' });
    }, [resaltado]);

    const ir = (item: Resultado) => {
        onCerrar();
        router.visit(item.href);
    };

    const alPulsarTecla = (evento: React.KeyboardEvent) => {
        if (evento.key === 'ArrowDown') {
            evento.preventDefault();
            setResaltado((actual) =>
                resultados.length === 0 ? 0 : (actual + 1) % resultados.length,
            );
        }

        if (evento.key === 'ArrowUp') {
            evento.preventDefault();
            setResaltado((actual) =>
                resultados.length === 0
                    ? 0
                    : (actual - 1 + resultados.length) % resultados.length,
            );
        }

        if (evento.key === 'Enter' && resultados[resaltado]) {
            evento.preventDefault();
            ir(resultados[resaltado]);
        }
    };

    return (
        <>
            <div className="flex items-center gap-3 border-b px-4">
                <Search className="size-4 shrink-0 text-muted-foreground" />
                <input
                    autoFocus
                    value={consulta}
                    onChange={(evento) => {
                        setConsulta(evento.target.value);
                        setResaltado(0);
                    }}
                    onKeyDown={alPulsarTecla}
                    placeholder="Buscar sección…"
                    className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    aria-label="Buscar sección del panel"
                />
            </div>

            <div ref={listaRef} className="max-h-80 overflow-y-auto p-2">
                {resultados.length === 0 ? (
                    <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                        Nada coincide con «{consulta}».
                    </p>
                ) : (
                    resultados.map((item, indice) => {
                        const Icono = item.icono;
                        const activo = indice === resaltado;

                        return (
                            <button
                                key={`${item.grupo}-${item.titulo}`}
                                type="button"
                                data-resaltado={activo}
                                onMouseMove={() => setResaltado(indice)}
                                onClick={() => ir(item)}
                                className={cn(
                                    'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors',
                                    activo
                                        ? 'bg-marca-suave text-marca'
                                        : 'text-foreground',
                                )}
                            >
                                <Icono className="size-4 shrink-0 opacity-70" />
                                <span className="flex-1 truncate">
                                    {item.titulo}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {item.grupo}
                                </span>
                                {activo && (
                                    <CornerDownLeft className="size-3.5 opacity-60" />
                                )}
                            </button>
                        );
                    })
                )}
            </div>
        </>
    );
}
