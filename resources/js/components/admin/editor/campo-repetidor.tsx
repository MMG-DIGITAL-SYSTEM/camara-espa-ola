import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { Campo } from '@/blocks/tipos';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Elemento = Record<string, unknown>;

/**
 * Lista editable de elementos con la misma forma (preguntas de un FAQ, cifras,
 * hitos de una línea de tiempo…).
 *
 * Se reordena con botones y no arrastrando: el panel ya vive dentro de un
 * árbol con arrastre propio, y anidar dos zonas de arrastre confunde más de lo
 * que aporta en una lista corta.
 */
export function CampoRepetidor({
    campo,
    valor,
    onCambio,
    idCampo,
    renderCampo,
}: {
    campo: Extract<Campo, { tipo: 'repetidor' }>;
    valor: unknown;
    onCambio: (valor: unknown) => void;
    idCampo: string;
    /** El renderizador de campos, inyectado para evitar un ciclo de imports. */
    renderCampo: (
        subcampo: Campo,
        valorSub: unknown,
        alCambiar: (v: unknown) => void,
        id: string,
    ) => React.ReactNode;
}) {
    const elementos: Elemento[] = Array.isArray(valor)
        ? (valor as Elemento[])
        : [];
    const [abierto, setAbierto] = useState<number | null>(0);

    const alcanzadoElMaximo =
        campo.maximo !== undefined && elementos.length >= campo.maximo;

    const reemplazar = (nuevos: Elemento[]) => onCambio(nuevos);

    const anadir = () => {
        const vacio: Elemento = {};

        for (const sub of campo.campos) {
            vacio[sub.clave] = sub.tipo === 'switch' ? false : '';
        }

        reemplazar([...elementos, vacio]);
        setAbierto(elementos.length);
    };

    const mover = (indice: number, salto: number) => {
        const destino = indice + salto;

        if (destino < 0 || destino >= elementos.length) {
            return;
        }

        const copia = [...elementos];
        [copia[indice], copia[destino]] = [copia[destino], copia[indice]];

        reemplazar(copia);
        setAbierto(destino);
    };

    const titulo = (elemento: Elemento, indice: number): string => {
        const clave = campo.titulo ?? campo.campos[0]?.clave;
        const texto = clave ? elemento[clave] : null;

        return typeof texto === 'string' && texto.trim() !== ''
            ? texto
            : `Elemento ${indice + 1}`;
    };

    return (
        <div className="grid gap-1.5">
            <span className="text-xs font-medium">{campo.etiqueta}</span>

            <ul className="space-y-1.5">
                {elementos.map((elemento, indice) => (
                    <li key={indice} className="rounded-md border">
                        <div className="flex items-center gap-1 px-2 py-1.5">
                            <button
                                type="button"
                                onClick={() =>
                                    setAbierto(
                                        abierto === indice ? null : indice,
                                    )
                                }
                                className="min-w-0 flex-1 truncate text-left text-sm"
                            >
                                {titulo(elemento, indice)}
                            </button>

                            <button
                                type="button"
                                onClick={() => mover(indice, -1)}
                                disabled={indice === 0}
                                aria-label="Subir elemento"
                                className="flex size-6 items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
                            >
                                <ChevronUp className="size-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => mover(indice, 1)}
                                disabled={indice === elementos.length - 1}
                                aria-label="Bajar elemento"
                                className="flex size-6 items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
                            >
                                <ChevronDown className="size-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    reemplazar(
                                        elementos.filter(
                                            (_, i) => i !== indice,
                                        ),
                                    );
                                    setAbierto(null);
                                }}
                                aria-label="Eliminar elemento"
                                className="flex size-6 items-center justify-center rounded text-muted-foreground hover:text-destructive"
                            >
                                <Trash2 className="size-3.5" />
                            </button>
                        </div>

                        <div
                            className={cn(
                                'space-y-3 border-t px-2.5 py-3',
                                abierto !== indice && 'hidden',
                            )}
                        >
                            {campo.campos.map((sub) =>
                                renderCampo(
                                    sub,
                                    elemento[sub.clave],
                                    (nuevoValor) => {
                                        const copia = [...elementos];

                                        copia[indice] = {
                                            ...copia[indice],
                                            [sub.clave]: nuevoValor,
                                        };

                                        reemplazar(copia);
                                    },
                                    `${idCampo}-${indice}-${sub.clave}`,
                                ),
                            )}
                        </div>
                    </li>
                ))}
            </ul>

            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={anadir}
                disabled={alcanzadoElMaximo}
                className="w-full border-dashed"
            >
                <Plus className="size-3.5" />
                {alcanzadoElMaximo
                    ? `Máximo ${campo.maximo}`
                    : 'Añadir elemento'}
            </Button>
        </div>
    );
}
