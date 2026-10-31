import { ImagePlus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { esColorHex } from '@/blocks/color';
import type { Campo } from '@/blocks/tipos';
import { SelectorDeMedios } from '@/components/admin/medios/selector-de-medios';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CampoRepetidor } from './campo-repetidor';
import { EditorTexto } from './editor-texto';

/**
 * Pinta un campo a partir de su descripción en el registro de bloques.
 *
 * Todo el panel de propiedades sale de aquí: por eso añadir un bloque nuevo
 * no obliga a tocar el editor, solo a declarar sus `campos`.
 */
export function CampoEditable({
    campo,
    valor,
    onCambio,
    idCampo,
}: {
    campo: Campo;
    valor: unknown;
    onCambio: (valor: unknown) => void;
    /** Único por sección: evita que dos bloques compartan el mismo id. */
    idCampo: string;
}) {
    const texto = typeof valor === 'string' ? valor : '';

    switch (campo.tipo) {
        case 'texto':
        case 'enlace':
            return (
                <Envoltorio etiqueta={campo.etiqueta} idCampo={idCampo}>
                    <Input
                        id={idCampo}
                        value={texto}
                        placeholder={campo.placeholder}
                        onChange={(evento) => onCambio(evento.target.value)}
                    />
                </Envoltorio>
            );

        case 'textarea':
            return (
                <Envoltorio etiqueta={campo.etiqueta} idCampo={idCampo}>
                    <textarea
                        id={idCampo}
                        rows={campo.filas ?? 3}
                        value={texto}
                        placeholder={campo.placeholder}
                        onChange={(evento) => onCambio(evento.target.value)}
                        className="w-full resize-y rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                </Envoltorio>
            );

        case 'richtext':
            return (
                <Envoltorio etiqueta={campo.etiqueta}>
                    <EditorTexto valor={texto} onCambio={onCambio} />
                </Envoltorio>
            );

        case 'imagen':
            return (
                <CampoImagen
                    etiqueta={campo.etiqueta}
                    valor={texto}
                    onCambio={onCambio}
                    idCampo={idCampo}
                />
            );

        case 'icono':
            return (
                <Envoltorio etiqueta={campo.etiqueta} idCampo={idCampo}>
                    <Input
                        id={idCampo}
                        value={texto}
                        placeholder="calendar, users, award…"
                        onChange={(evento) => onCambio(evento.target.value)}
                    />
                </Envoltorio>
            );

        case 'color':
            return (
                <CampoColor
                    etiqueta={campo.etiqueta}
                    valor={texto}
                    onCambio={onCambio}
                    idCampo={idCampo}
                />
            );

        case 'numero':
            return (
                <Envoltorio etiqueta={campo.etiqueta} idCampo={idCampo}>
                    <Input
                        id={idCampo}
                        type="number"
                        min={campo.min}
                        max={campo.max}
                        value={
                            typeof valor === 'number' ? valor : (texto ?? '')
                        }
                        onChange={(evento) =>
                            onCambio(
                                evento.target.value === ''
                                    ? ''
                                    : Number(evento.target.value),
                            )
                        }
                    />
                </Envoltorio>
            );

        case 'switch':
            return (
                <div className="flex items-start gap-2.5 py-1">
                    <Checkbox
                        id={idCampo}
                        checked={Boolean(valor)}
                        onCheckedChange={(marcado) =>
                            onCambio(marcado === true)
                        }
                        className="mt-0.5"
                    />
                    <div className="grid gap-0.5">
                        <Label htmlFor={idCampo} className="font-normal">
                            {campo.etiqueta}
                        </Label>
                        {campo.ayuda && (
                            <p className="text-xs text-muted-foreground">
                                {campo.ayuda}
                            </p>
                        )}
                    </div>
                </div>
            );

        case 'select':
            return (
                <Envoltorio etiqueta={campo.etiqueta} idCampo={idCampo}>
                    <Select
                        value={texto || campo.opciones[0]?.valor}
                        onValueChange={onCambio}
                    >
                        <SelectTrigger id={idCampo}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {campo.opciones.map((opcion) => (
                                <SelectItem
                                    key={opcion.valor}
                                    value={opcion.valor}
                                >
                                    {opcion.etiqueta}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Envoltorio>
            );

        case 'repetidor':
            return (
                <CampoRepetidor
                    campo={campo}
                    valor={valor}
                    onCambio={onCambio}
                    idCampo={idCampo}
                    renderCampo={(sub, valorSub, alCambiar, id) => (
                        <CampoEditable
                            key={id}
                            campo={sub}
                            valor={valorSub}
                            onCambio={alCambiar}
                            idCampo={id}
                        />
                    )}
                />
            );

        default:
            return null;
    }
}

function Envoltorio({
    etiqueta,
    idCampo,
    children,
}: {
    etiqueta: string;
    idCampo?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="grid gap-1.5">
            {idCampo ? (
                <Label htmlFor={idCampo} className="text-xs font-medium">
                    {etiqueta}
                </Label>
            ) : (
                <span className="text-xs font-medium">{etiqueta}</span>
            )}
            {children}
        </div>
    );
}

/** Colores de la marca a un clic; el resto, con el selector. */
const COLORES_RAPIDOS = [
    '#ffffff',
    '#d1d5db',
    '#6b7280',
    '#111827',
    '#ef4444',
    '#dc2626',
    '#f59e0b',
    '#2563eb',
];

/**
 * Campo de color: vacío significa «el del diseño», así un bloque recién
 * añadido se ve como siempre hasta que alguien elige otro.
 */
function CampoColor({
    etiqueta,
    valor,
    onCambio,
    idCampo,
}: {
    etiqueta: string;
    valor: string;
    onCambio: (valor: unknown) => void;
    idCampo: string;
}) {
    const valido = esColorHex(valor);

    return (
        <Envoltorio etiqueta={etiqueta} idCampo={idCampo}>
            <div className="space-y-2">
                <div className="flex gap-2">
                    <input
                        type="color"
                        aria-label={`${etiqueta}: selector`}
                        value={valido ? valor : '#ffffff'}
                        onChange={(evento) => onCambio(evento.target.value)}
                        className="h-9 w-11 shrink-0 cursor-pointer rounded-md border bg-transparent p-1"
                    />
                    <Input
                        id={idCampo}
                        value={valor}
                        placeholder="Por defecto"
                        onChange={(evento) => onCambio(evento.target.value)}
                        aria-invalid={valor !== '' && !valido}
                        className="flex-1 font-mono"
                    />
                    {valor && (
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => onCambio('')}
                            aria-label="Volver al color por defecto"
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {COLORES_RAPIDOS.map((color) => (
                        <button
                            key={color}
                            type="button"
                            title={color}
                            aria-label={`Usar ${color}`}
                            onClick={() => onCambio(color)}
                            className="size-6 rounded-full border shadow-sm transition-transform hover:scale-110"
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>
            </div>
        </Envoltorio>
    );
}

/**
 * Campo de imagen: se elige de la biblioteca o se pega una dirección externa.
 *
 * Se deja la opción de pegar la URL a propósito: buena parte del contenido
 * actual apunta a imágenes alojadas fuera.
 */
function CampoImagen({
    etiqueta,
    valor,
    onCambio,
    idCampo,
}: {
    etiqueta: string;
    valor: string;
    onCambio: (valor: unknown) => void;
    idCampo: string;
}) {
    const [selectorAbierto, setSelectorAbierto] = useState(false);

    return (
        <Envoltorio etiqueta={etiqueta} idCampo={idCampo}>
            <div className="space-y-2">
                {valor ? (
                    <div className="relative overflow-hidden rounded-md border bg-muted">
                        <img
                            src={valor}
                            alt=""
                            className="aspect-video w-full object-cover"
                        />
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => setSelectorAbierto(true)}
                        className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed px-3 py-6 text-sm text-muted-foreground transition-colors hover:border-marca/50 hover:text-foreground"
                    >
                        <ImagePlus className="size-4" />
                        Elegir de la biblioteca
                    </button>
                )}

                <div className="flex gap-2">
                    <Input
                        id={idCampo}
                        value={valor}
                        placeholder="…o pega una dirección"
                        onChange={(evento) => onCambio(evento.target.value)}
                        className="flex-1"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setSelectorAbierto(true)}
                        aria-label="Elegir de la biblioteca"
                    >
                        <ImagePlus className="size-4" />
                    </Button>
                    {valor && (
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => onCambio('')}
                            aria-label="Quitar la imagen"
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    )}
                </div>
            </div>

            <SelectorDeMedios
                abierto={selectorAbierto}
                onAbiertoChange={setSelectorAbierto}
                onElegir={(medio) => onCambio(medio.url)}
            />
        </Envoltorio>
    );
}
