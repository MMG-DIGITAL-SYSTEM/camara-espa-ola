import { AlertCircle } from 'lucide-react';
import type { ErrorDeValidacion } from '@/lib/http';

/**
 * Piezas comunes de los formularios públicos (contacto, afiliación): mismo
 * aspecto, mismos errores accesibles y la misma forma de leer la respuesta
 * de validación de Laravel.
 */

export const clasesCampo = (conError: boolean) =>
    `w-full rounded-xl border bg-white px-4 text-gray-900 placeholder:text-gray-400 transition-colors focus:ring-4 focus:outline-none ${
        conError
            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15'
            : 'border-gray-200 hover:border-gray-300 focus:border-red-500 focus:ring-red-500/10'
    }`;

export function MensajeDeError({ id, error }: { id: string; error?: string }) {
    if (!error) {
        return null;
    }

    return (
        <p id={id} className="flex items-center gap-1.5 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
        </p>
    );
}

function Etiqueta({
    campo,
    texto,
    obligatorio,
}: {
    campo: string;
    texto: string;
    obligatorio: boolean;
}) {
    return (
        <label
            htmlFor={campo}
            className="block text-sm font-semibold text-gray-700"
        >
            {texto}
            {obligatorio && <span className="text-red-600"> *</span>}
        </label>
    );
}

export function CampoTexto({
    campo,
    etiqueta,
    valor,
    error,
    onCambio,
    obligatorio = true,
    ...resto
}: {
    campo: string;
    etiqueta: string;
    valor: string;
    error?: string;
    onCambio: (valor: string) => void;
    obligatorio?: boolean;
} & Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'value' | 'onChange' | 'id' | 'name'
>) {
    const idError = `${campo}-error`;

    return (
        <div className="space-y-1.5">
            <Etiqueta
                campo={campo}
                texto={etiqueta}
                obligatorio={obligatorio}
            />
            <input
                id={campo}
                name={campo}
                value={valor}
                onChange={(evento) => onCambio(evento.target.value)}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? idError : undefined}
                className={`h-12 ${clasesCampo(Boolean(error))}`}
                {...resto}
            />
            <MensajeDeError id={idError} error={error} />
        </div>
    );
}

export function CampoAreaTexto({
    campo,
    etiqueta,
    valor,
    error,
    onCambio,
    maximo,
    obligatorio = true,
    filas = 5,
    placeholder,
}: {
    campo: string;
    etiqueta: string;
    valor: string;
    error?: string;
    onCambio: (valor: string) => void;
    maximo: number;
    obligatorio?: boolean;
    filas?: number;
    placeholder?: string;
}) {
    const idError = `${campo}-error`;
    const idContador = `${campo}-contador`;

    return (
        <div className="space-y-1.5">
            <Etiqueta
                campo={campo}
                texto={etiqueta}
                obligatorio={obligatorio}
            />
            <textarea
                id={campo}
                name={campo}
                rows={filas}
                maxLength={maximo}
                value={valor}
                onChange={(evento) => onCambio(evento.target.value)}
                placeholder={placeholder}
                aria-invalid={error ? true : undefined}
                aria-describedby={
                    error ? `${idError} ${idContador}` : idContador
                }
                className={`resize-y py-3 ${clasesCampo(Boolean(error))}`}
            />
            <div className="flex items-start justify-between gap-4">
                <MensajeDeError id={idError} error={error} />
                <span
                    id={idContador}
                    className="ml-auto shrink-0 text-xs text-gray-400"
                >
                    {valor.length}/{maximo}
                </span>
            </div>
        </div>
    );
}

/** Primer mensaje de cada campo, que es el que se muestra bajo él. */
export function erroresPorCampo(
    error: ErrorDeValidacion,
): Record<string, string> {
    return Object.fromEntries(
        Object.entries(error.errores).map(([campo, mensajes]) => [
            campo,
            mensajes[0],
        ]),
    );
}

/** Lleva el foco al primer campo con error, en el orden en que se ven. */
export function enfocarPrimerError(
    formulario: HTMLFormElement | null,
    orden: readonly string[],
    errores: Record<string, string | undefined>,
) {
    const primero = orden.find((campo) => errores[campo]);

    if (primero) {
        formulario?.querySelector<HTMLElement>(`[name="${primero}"]`)?.focus();
    }
}
