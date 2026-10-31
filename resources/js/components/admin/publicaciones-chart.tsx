import { useState } from 'react';
import { cn } from '@/lib/utils';

export type PuntoMensual = {
    mes: string;
    noticias: number;
    actividades: number;
};

const SERIES = [
    { clave: 'noticias', etiqueta: 'Noticias', color: 'var(--serie-1)' },
    { clave: 'actividades', etiqueta: 'Actividades', color: 'var(--serie-2)' },
] as const;

/**
 * Barras agrupadas: dos series sobre un único eje.
 *
 * Se construye con CSS en lugar de SVG a propósito. Un viewBox estirado a lo
 * ancho deformaría los radios de las esquinas y las separaciones entre barras;
 * con cajas, los 4px de radio y los 2px de hueco son exactos a cualquier ancho.
 */
export function PublicacionesChart({ datos }: { datos: PuntoMensual[] }) {
    const [activo, setActivo] = useState<{
        mes: string;
        serie: (typeof SERIES)[number];
        valor: number;
    } | null>(null);

    const maximo = Math.max(
        1,
        ...datos.flatMap((punto) => [punto.noticias, punto.actividades]),
    );
    // Techo par para que las tres líneas de referencia caigan en enteros.
    const techo = Math.max(2, Math.ceil(maximo / 2) * 2);

    return (
        <figure className="m-0">
            <figcaption className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-sm font-medium">
                        Publicaciones por mes
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        Últimos seis meses
                    </p>
                </div>
                <ul className="flex items-center gap-4">
                    {SERIES.map((serie) => (
                        <li
                            key={serie.clave}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground"
                        >
                            <span
                                aria-hidden
                                className="size-2.5 rounded-[3px]"
                                style={{ background: serie.color }}
                            />
                            {serie.etiqueta}
                        </li>
                    ))}
                </ul>
            </figcaption>

            <div className="relative" aria-hidden>
                {/* Referencias horizontales, deliberadamente tenues. */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-40">
                    {[0, 0.5, 1].map((fraccion) => (
                        <div
                            key={fraccion}
                            className="absolute inset-x-0 border-t border-border/70"
                            style={{ top: `${fraccion * 100}%` }}
                        />
                    ))}
                    <span className="absolute -top-2 left-0 bg-card pr-1 text-[10px] text-muted-foreground tabular-nums">
                        {techo}
                    </span>
                </div>

                <div className="flex h-40 items-end gap-1">
                    {datos.map((punto) => (
                        <div
                            key={punto.mes}
                            className="flex h-full flex-1 items-end justify-center gap-[2px]"
                        >
                            {SERIES.map((serie) => {
                                const valor = punto[serie.clave];
                                const resaltado =
                                    activo !== null &&
                                    (activo.mes !== punto.mes ||
                                        activo.serie.clave !== serie.clave);

                                return (
                                    <button
                                        key={serie.clave}
                                        type="button"
                                        tabIndex={-1}
                                        onMouseEnter={() =>
                                            setActivo({
                                                mes: punto.mes,
                                                serie,
                                                valor,
                                            })
                                        }
                                        onMouseLeave={() => setActivo(null)}
                                        className="flex h-full w-3.5 items-end sm:w-5"
                                    >
                                        <span
                                            className={cn(
                                                'w-full rounded-t-[4px] transition-opacity',
                                                resaltado && 'opacity-45',
                                            )}
                                            style={{
                                                background: serie.color,
                                                height: `${Math.max((valor / techo) * 100, valor > 0 ? 2 : 0)}%`,
                                            }}
                                        />
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>

                <div className="mt-1.5 flex gap-1">
                    {datos.map((punto) => (
                        <span
                            key={punto.mes}
                            className="flex-1 text-center text-[11px] text-muted-foreground capitalize"
                        >
                            {punto.mes}
                        </span>
                    ))}
                </div>

                {activo && (
                    <div className="pointer-events-none absolute top-0 right-0 rounded-md border bg-popover px-2.5 py-1.5 text-xs shadow-sm">
                        <span className="font-medium capitalize">
                            {activo.mes}
                        </span>
                        <span className="mx-1.5 text-muted-foreground">·</span>
                        <span className="text-muted-foreground">
                            {activo.serie.etiqueta}:
                        </span>{' '}
                        <span className="font-semibold tabular-nums">
                            {activo.valor}
                        </span>
                    </div>
                )}
            </div>

            {/* Alternativa textual: la identidad nunca depende solo del color. */}
            <table className="sr-only">
                <caption>
                    Publicaciones por mes en los últimos seis meses
                </caption>
                <thead>
                    <tr>
                        <th scope="col">Mes</th>
                        {SERIES.map((serie) => (
                            <th key={serie.clave} scope="col">
                                {serie.etiqueta}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {datos.map((punto) => (
                        <tr key={punto.mes}>
                            <th scope="row">{punto.mes}</th>
                            <td>{punto.noticias}</td>
                            <td>{punto.actividades}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </figure>
    );
}
