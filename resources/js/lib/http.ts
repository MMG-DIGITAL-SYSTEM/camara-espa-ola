/**
 * Peticiones JSON al propio backend, fuera del ciclo de visitas de Inertia.
 *
 * El editor de páginas autoguarda mientras se escribe: una visita de Inertia
 * recargaría las props y le robaría el foco al campo que se está editando.
 */

function tokenCsrf(): string {
    const cookie = document.cookie
        .split('; ')
        .find((trozo) => trozo.startsWith('XSRF-TOKEN='));

    return cookie ? decodeURIComponent(cookie.split('=')[1]) : '';
}

export class ErrorDeValidacion extends Error {
    constructor(public errores: Record<string, string[]>) {
        super('La información enviada no es válida.');
        this.name = 'ErrorDeValidacion';
    }
}

/** Respuesta con error que no es de validación: guarda el código HTTP. */
export class ErrorHttp extends Error {
    constructor(public estado: number) {
        super(`La petición falló con estado ${estado}.`);
        this.name = 'ErrorHttp';
    }
}

export async function peticionJson<R>(
    url: string,
    metodo: 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'GET',
    cuerpo?: unknown,
    señal?: AbortSignal,
): Promise<R> {
    const respuesta = await fetch(url, {
        method: metodo,
        credentials: 'same-origin',
        signal: señal,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            // Laravel descifra esta cabecera a partir de la cookie XSRF-TOKEN.
            'X-XSRF-TOKEN': tokenCsrf(),
        },
        body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    });

    if (respuesta.status === 422) {
        const { errors } = await respuesta.json();

        throw new ErrorDeValidacion(errors ?? {});
    }

    if (!respuesta.ok) {
        throw new ErrorHttp(respuesta.status);
    }

    return respuesta.status === 204 ? (undefined as R) : respuesta.json();
}
