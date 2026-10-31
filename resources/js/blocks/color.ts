/**
 * Los colores elegidos en el editor acaban en estilos en línea: solo se
 * aceptan hexadecimales (#rgb, #rrggbb o con transparencia). El servidor
 * descarta el resto al guardar; esto cubre lo que se teclea antes de guardar.
 */
export function esColorHex(valor: unknown): valor is string {
    return typeof valor === 'string' && /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(valor);
}

/** Un hexadecimal válido como rgba con la opacidad dada (0–1). */
export function colorConAlfa(hex: string, alfa: number): string {
    let digitos = hex.slice(1);

    if (digitos.length <= 4) {
        digitos = [...digitos].map((d) => d + d).join('');
    }

    const [r, g, b] = [0, 2, 4].map((i) =>
        parseInt(digitos.slice(i, i + 2), 16),
    );

    return `rgba(${r}, ${g}, ${b}, ${alfa})`;
}

/** El color si es válido; si no, undefined para que mande el del diseño. */
export function colorOVacio(valor: unknown): string | undefined {
    return esColorHex(valor) ? valor : undefined;
}
