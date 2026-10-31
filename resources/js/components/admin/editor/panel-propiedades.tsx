import { ArrowLeft, Copy, MousePointerClick, Plus, Trash2 } from 'lucide-react';
import { elemento as definicionDeElemento } from '@/blocks/elementos';
import { bloque } from '@/blocks/registro';
import { CAMPOS_DE_ESTILO } from '@/blocks/seccion';
import type { AnchoElemento, Campo, ElementoLienzo } from '@/blocks/tipos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { elementosDe, etiquetaDeElemento } from '@/pages/Admin/Paginas/estado';
import type { SeccionEditor } from '@/pages/Admin/Paginas/estado';
import { CampoEditable } from './campo';

/**
 * Anchos de la rejilla, con nombres que no obligan a pensar en columnas.
 */
const CAMPO_ANCHO: Campo = {
    tipo: 'select',
    clave: 'ancho',
    etiqueta: 'Ancho en la fila',
    opciones: [
        { valor: 'completo', etiqueta: 'Toda la fila' },
        { valor: 'dos-tercios', etiqueta: 'Dos tercios' },
        { valor: 'mitad', etiqueta: 'La mitad' },
        { valor: 'tercio', etiqueta: 'Un tercio' },
        { valor: 'cuarto', etiqueta: 'Un cuarto' },
    ],
};

function SinSeleccion() {
    return (
        <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-linear-to-br from-marca/15 to-marca-calida/15 ring-1 ring-marca/20">
                <MousePointerClick className="size-6 text-marca" />
            </span>
            <p className="text-sm font-medium">Ninguna sección elegida</p>
            <p className="text-xs text-muted-foreground">
                Haz clic en una sección de la vista previa o en la lista de la
                izquierda para editarla.
            </p>
        </div>
    );
}

/**
 * Propiedades de una pieza del lienzo.
 *
 * Se genera desde `campos` igual que las de un bloque: es el mismo contrato,
 * solo que a otra escala.
 */
function PropiedadesDelElemento({
    pieza,
    onCambiarDato,
    onCambiarAncho,
    onVolver,
    onDuplicar,
    onEliminar,
}: {
    pieza: ElementoLienzo;
    onCambiarDato: (campo: string, valor: unknown) => void;
    onCambiarAncho: (ancho: AnchoElemento) => void;
    onVolver: () => void;
    onDuplicar: () => void;
    onEliminar: () => void;
}) {
    const definicion = definicionDeElemento(pieza.elemento);

    return (
        <div className="flex h-full flex-col">
            <header className="border-b px-4 py-3">
                <button
                    type="button"
                    onClick={onVolver}
                    className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="size-3" />
                    Volver a la sección
                </button>
                <p className="mt-1.5 text-sm font-medium">
                    {definicion?.nombre ?? pieza.elemento}
                </p>
            </header>

            <div className="flex-1 space-y-5 overflow-y-auto p-4">
                {definicion ? (
                    <>
                        <section className="space-y-4">
                            {definicion.campos.map((campo) => (
                                <CampoEditable
                                    key={campo.clave}
                                    campo={campo}
                                    idCampo={`${pieza.clave}-${campo.clave}`}
                                    valor={pieza.datos[campo.clave]}
                                    onCambio={(valor) =>
                                        onCambiarDato(campo.clave, valor)
                                    }
                                />
                            ))}
                        </section>

                        <Separator />

                        <CampoEditable
                            campo={CAMPO_ANCHO}
                            idCampo={`${pieza.clave}-ancho`}
                            valor={pieza.ancho}
                            onCambio={(valor) =>
                                onCambiarAncho(valor as AnchoElemento)
                            }
                        />
                    </>
                ) : (
                    <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                        Este elemento («{pieza.elemento}») ya no existe en el
                        catálogo.
                    </p>
                )}
            </div>

            <footer className="flex gap-2 border-t p-3">
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={onDuplicar}
                >
                    <Copy className="size-3.5" />
                    Duplicar
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-destructive hover:text-destructive"
                    onClick={onEliminar}
                >
                    <Trash2 className="size-3.5" />
                    Eliminar
                </Button>
            </footer>
        </div>
    );
}

/**
 * Contenido de un lienzo, listado dentro del panel de la sección.
 */
function ListaDeElementos({
    elementos,
    onSeleccionar,
    onAnadir,
}: {
    elementos: ElementoLienzo[];
    onSeleccionar: (clave: string) => void;
    onAnadir: () => void;
}) {
    return (
        <section className="space-y-2">
            <Label className="text-xs tracking-wide text-muted-foreground uppercase">
                Elementos
            </Label>

            {elementos.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                    Esta sección está en blanco. Añade la primera pieza.
                </p>
            ) : (
                <ul className="space-y-1">
                    {elementos.map((pieza) => {
                        const Icono = definicionDeElemento(
                            pieza.elemento,
                        )?.icono;

                        return (
                            <li key={pieza.clave}>
                                <button
                                    type="button"
                                    onClick={() => onSeleccionar(pieza.clave)}
                                    className="flex w-full items-center gap-2 rounded-md border px-2 py-1.5 text-left transition-colors hover:border-marca/40 hover:bg-marca-suave/40"
                                >
                                    {Icono && (
                                        <Icono className="size-3.5 shrink-0 text-muted-foreground" />
                                    )}
                                    <span className="truncate text-xs">
                                        {etiquetaDeElemento(pieza)}
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}

            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAnadir}
                className="w-full border-dashed"
            >
                <Plus className="size-3.5" />
                Añadir elemento
            </Button>
        </section>
    );
}

export function PanelPropiedades({
    seccion,
    elementoActivo,
    onCambiarDato,
    onCambiarEstilo,
    onRenombrar,
    onDuplicar,
    onEliminar,
    onSeleccionarElemento,
    onAnadirElemento,
    onCambiarDatoElemento,
    onCambiarAnchoElemento,
    onDuplicarElemento,
    onEliminarElemento,
    onVolverALaSeccion,
}: {
    seccion: SeccionEditor | null;
    elementoActivo: ElementoLienzo | null;
    onCambiarDato: (campo: string, valor: unknown) => void;
    onCambiarEstilo: (campo: string, valor: unknown) => void;
    onRenombrar: (nombre: string) => void;
    onDuplicar: () => void;
    onEliminar: () => void;
    onSeleccionarElemento: (clave: string) => void;
    onAnadirElemento: () => void;
    onCambiarDatoElemento: (campo: string, valor: unknown) => void;
    onCambiarAnchoElemento: (ancho: AnchoElemento) => void;
    onDuplicarElemento: () => void;
    onEliminarElemento: () => void;
    onVolverALaSeccion: () => void;
}) {
    if (!seccion) {
        return <SinSeleccion />;
    }

    // La pieza elegida manda sobre la sección que la contiene.
    if (elementoActivo) {
        return (
            <PropiedadesDelElemento
                pieza={elementoActivo}
                onCambiarDato={onCambiarDatoElemento}
                onCambiarAncho={onCambiarAnchoElemento}
                onVolver={onVolverALaSeccion}
                onDuplicar={onDuplicarElemento}
                onEliminar={onEliminarElemento}
            />
        );
    }

    const definicion = bloque(seccion.bloque);

    return (
        <div className="flex h-full flex-col">
            <header className="flex items-start gap-3 border-b bg-linear-to-r from-marca/8 to-transparent px-4 py-3">
                {definicion && (
                    <span className="degradado-marca mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl text-white shadow-md shadow-marca/25">
                        <definicion.icono className="size-4" />
                    </span>
                )}
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold tracking-wide text-marca uppercase">
                        {definicion?.nombre ?? seccion.bloque}
                    </p>
                    <Input
                        value={seccion.nombre ?? ''}
                        onChange={(evento) => onRenombrar(evento.target.value)}
                        placeholder="Nombre de la sección (solo lo ves tú)"
                        className="mt-1 h-8 border-transparent px-0 text-sm font-medium shadow-none focus-visible:border-input focus-visible:px-2"
                    />
                </div>
            </header>

            <div className="flex-1 space-y-5 overflow-y-auto p-4">
                {definicion ? (
                    <>
                        {definicion.admiteElementos && (
                            <>
                                <ListaDeElementos
                                    elementos={elementosDe(seccion)}
                                    onSeleccionar={onSeleccionarElemento}
                                    onAnadir={onAnadirElemento}
                                />
                                <Separator />
                            </>
                        )}

                        {definicion.campos.length > 0 && (
                            <section className="space-y-4">
                                {definicion.campos.map((campo: Campo) => (
                                    <CampoEditable
                                        key={campo.clave}
                                        campo={campo}
                                        idCampo={`${seccion.clave}-${campo.clave}`}
                                        valor={seccion.datos[campo.clave]}
                                        onCambio={(valor) =>
                                            onCambiarDato(campo.clave, valor)
                                        }
                                    />
                                ))}
                            </section>
                        )}

                        <Separator />

                        <section className="space-y-4">
                            <Label className="text-xs tracking-wide text-muted-foreground uppercase">
                                Presentación
                            </Label>
                            {CAMPOS_DE_ESTILO.map((campo) => (
                                <CampoEditable
                                    key={campo.clave}
                                    campo={campo}
                                    idCampo={`${seccion.clave}-estilo-${campo.clave}`}
                                    valor={
                                        seccion.estilos[
                                            campo.clave as keyof typeof seccion.estilos
                                        ]
                                    }
                                    onCambio={(valor) =>
                                        onCambiarEstilo(campo.clave, valor)
                                    }
                                />
                            ))}
                        </section>
                    </>
                ) : (
                    <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                        Este bloque («{seccion.bloque}») ya no existe en el
                        catálogo. Elimínalo o restaura una versión anterior.
                    </p>
                )}
            </div>

            <footer className="flex gap-2 border-t p-3">
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={onDuplicar}
                >
                    <Copy className="size-3.5" />
                    Duplicar
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-destructive hover:text-destructive"
                    onClick={onEliminar}
                >
                    <Trash2 className="size-3.5" />
                    Eliminar
                </Button>
            </footer>
        </div>
    );
}
