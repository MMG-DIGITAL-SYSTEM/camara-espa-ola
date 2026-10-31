import { elemento } from '@/blocks/elementos';
import { bloque } from '@/blocks/registro';
import type {
    AnchoElemento,
    DatosBloque,
    ElementoLienzo,
    EstilosSeccion,
    Seccion,
} from '@/blocks/tipos';

/**
 * Sección tal y como la maneja el editor.
 *
 * `clave` es un identificador local estable que acompaña a la sección desde que
 * se añade. El servidor lo devuelve en el mapa de guardado, así que una sección
 * recién creada recibe su `id` real sin recargar la página ni perder el foco,
 * y sin riesgo de duplicarse si se guarda dos veces seguidas.
 */
export type SeccionEditor = Omit<Seccion, 'id' | 'orden'> & {
    clave: string;
    id: number | null;
};

export type EstadoEditor = {
    secciones: SeccionEditor[];
    seleccion: string | null;
    /**
     * Pieza elegida dentro de la sección seleccionada, si la hay.
     *
     * Vive aparte de `seleccion` y no dentro de ella porque una sección puede
     * estar activa sin ninguna pieza elegida: es el caso de todos los bloques
     * que no son contenedores.
     */
    seleccionElemento: string | null;
};

export type AccionEditor =
    | { tipo: 'reemplazar'; secciones: SeccionEditor[] }
    | { tipo: 'seleccionar'; clave: string | null }
    | { tipo: 'anadir'; bloque: string; despuesDe?: string | null }
    | { tipo: 'duplicar'; clave: string }
    | { tipo: 'eliminar'; clave: string }
    | { tipo: 'mover'; desde: number; hasta: number }
    | { tipo: 'alternarVisible'; clave: string }
    | { tipo: 'renombrar'; clave: string; nombre: string }
    | { tipo: 'cambiarDato'; clave: string; campo: string; valor: unknown }
    | { tipo: 'cambiarEstilo'; clave: string; campo: string; valor: unknown }
    | { tipo: 'asignarIds'; mapa: Record<string, number> }
    | { tipo: 'seleccionarElemento'; seccion: string; clave: string | null }
    | { tipo: 'anadirElemento'; seccion: string; elemento: string }
    | { tipo: 'duplicarElemento'; seccion: string; clave: string }
    | { tipo: 'eliminarElemento'; seccion: string; clave: string }
    | { tipo: 'moverElemento'; seccion: string; desde: number; hasta: number }
    | {
          tipo: 'cambiarDatoElemento';
          seccion: string;
          clave: string;
          campo: string;
          valor: unknown;
      }
    | {
          tipo: 'cambiarAnchoElemento';
          seccion: string;
          clave: string;
          ancho: AnchoElemento;
      }
    | { tipo: 'deshacer' }
    | { tipo: 'rehacer' };

export type HistorialEditor = {
    presente: EstadoEditor;
    pasado: EstadoEditor[];
    futuro: EstadoEditor[];
};

const LIMITE_HISTORIAL = 60;

export function nuevaClave(prefijo = 's'): string {
    return `${prefijo}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export function seccionDesdeServidor(seccion: Seccion): SeccionEditor {
    return {
        clave: nuevaClave(),
        id: seccion.id,
        bloque: seccion.bloque,
        nombre: seccion.nombre,
        es_visible: seccion.es_visible,
        datos: seccion.datos ?? {},
        estilos: seccion.estilos ?? {},
    };
}

export function crearSeccion(claveBloque: string): SeccionEditor | null {
    const definicion = bloque(claveBloque);

    if (!definicion) {
        return null;
    }

    return {
        clave: nuevaClave(),
        id: null,
        bloque: claveBloque,
        nombre: null,
        es_visible: true,
        // Copia profunda: los defaults del registro son objetos compartidos.
        datos: structuredClone(definicion.defaults) as DatosBloque,
        estilos: structuredClone(
            definicion.estilosPorDefecto ?? {},
        ) as EstilosSeccion,
    };
}

/** Nombre que se muestra en el árbol de secciones. */
export function etiquetaDe(seccion: SeccionEditor): string {
    if (seccion.nombre) {
        return seccion.nombre;
    }

    const titulo = seccion.datos.titulo;

    if (typeof titulo === 'string' && titulo.trim() !== '') {
        return titulo.length > 38 ? `${titulo.slice(0, 38)}…` : titulo;
    }

    return bloque(seccion.bloque)?.nombre ?? seccion.bloque;
}

export function crearElemento(claveElemento: string): ElementoLienzo | null {
    const definicion = elemento(claveElemento);

    if (!definicion) {
        return null;
    }

    return {
        clave: nuevaClave('e'),
        elemento: claveElemento,
        ancho: definicion.anchoPorDefecto ?? 'completo',
        datos: structuredClone(definicion.defaults) as DatosBloque,
    };
}

/** Piezas de una sección contenedora; lista vacía si no lo es. */
export function elementosDe(seccion: SeccionEditor): ElementoLienzo[] {
    return Array.isArray(seccion.datos.elementos)
        ? (seccion.datos.elementos as ElementoLienzo[])
        : [];
}

/** Nombre que se muestra en el árbol para una pieza del lienzo. */
export function etiquetaDeElemento(pieza: ElementoLienzo): string {
    const definicion = elemento(pieza.elemento);

    for (const clave of ['texto', 'titulo', 'valor', 'alt']) {
        const valor = pieza.datos[clave];

        if (typeof valor === 'string' && valor.trim() !== '') {
            const limpio = valor.replace(/<[^>]*>/g, '').trim();

            if (limpio !== '') {
                return limpio.length > 30 ? `${limpio.slice(0, 30)}…` : limpio;
            }
        }
    }

    return definicion?.nombre ?? pieza.elemento;
}

/** Acciones que no deben ensuciar el historial de deshacer. */
const SIN_HISTORIAL: AccionEditor['tipo'][] = [
    'seleccionar',
    'seleccionarElemento',
    'asignarIds',
    'reemplazar',
    'deshacer',
    'rehacer',
];

export function reducir(
    historial: HistorialEditor,
    accion: AccionEditor,
): HistorialEditor {
    if (accion.tipo === 'deshacer') {
        const anterior = historial.pasado.at(-1);

        if (!anterior) {
            return historial;
        }

        return {
            presente: anterior,
            pasado: historial.pasado.slice(0, -1),
            futuro: [historial.presente, ...historial.futuro],
        };
    }

    if (accion.tipo === 'rehacer') {
        const siguiente = historial.futuro[0];

        if (!siguiente) {
            return historial;
        }

        return {
            presente: siguiente,
            pasado: [...historial.pasado, historial.presente],
            futuro: historial.futuro.slice(1),
        };
    }

    const presente = aplicar(historial.presente, accion);

    if (presente === historial.presente) {
        return historial;
    }

    if (SIN_HISTORIAL.includes(accion.tipo)) {
        return { ...historial, presente };
    }

    return {
        presente,
        pasado: [...historial.pasado, historial.presente].slice(
            -LIMITE_HISTORIAL,
        ),
        // Una edición nueva invalida lo que se había deshecho.
        futuro: [],
    };
}

function aplicar(estado: EstadoEditor, accion: AccionEditor): EstadoEditor {
    const { secciones } = estado;

    switch (accion.tipo) {
        case 'reemplazar':
            return { ...estado, secciones: accion.secciones };

        // Elegir una sección entera descarta la pieza que hubiera elegida.
        case 'seleccionar':
            return {
                ...estado,
                seleccion: accion.clave,
                seleccionElemento: null,
            };

        case 'anadir': {
            const nueva = crearSeccion(accion.bloque);

            if (!nueva) {
                return estado;
            }

            const indice =
                accion.despuesDe == null
                    ? secciones.length
                    : secciones.findIndex((s) => s.clave === accion.despuesDe) +
                      1;

            return {
                secciones: [
                    ...secciones.slice(0, indice),
                    nueva,
                    ...secciones.slice(indice),
                ],
                seleccion: nueva.clave,
                seleccionElemento: null,
            };
        }

        case 'duplicar': {
            const indice = secciones.findIndex((s) => s.clave === accion.clave);

            if (indice === -1) {
                return estado;
            }

            const copia: SeccionEditor = {
                ...structuredClone(secciones[indice]),
                clave: nuevaClave(),
                // Es una sección nueva: no hereda el id de la original.
                id: null,
            };

            return {
                secciones: [
                    ...secciones.slice(0, indice + 1),
                    copia,
                    ...secciones.slice(indice + 1),
                ],
                seleccion: copia.clave,
                seleccionElemento: null,
            };
        }

        case 'eliminar': {
            const restantes = secciones.filter((s) => s.clave !== accion.clave);

            if (restantes.length === secciones.length) {
                return estado;
            }

            const eraLaActiva = estado.seleccion === accion.clave;

            return {
                secciones: restantes,
                seleccion: eraLaActiva ? null : estado.seleccion,
                seleccionElemento: eraLaActiva
                    ? null
                    : estado.seleccionElemento,
            };
        }

        case 'mover': {
            if (
                accion.desde === accion.hasta ||
                accion.desde < 0 ||
                accion.hasta < 0 ||
                accion.desde >= secciones.length ||
                accion.hasta >= secciones.length
            ) {
                return estado;
            }

            const copia = [...secciones];
            const [movida] = copia.splice(accion.desde, 1);

            copia.splice(accion.hasta, 0, movida);

            return { ...estado, secciones: copia };
        }

        case 'alternarVisible':
            return {
                ...estado,
                secciones: mapear(secciones, accion.clave, (s) => ({
                    ...s,
                    es_visible: !s.es_visible,
                })),
            };

        case 'renombrar':
            return {
                ...estado,
                secciones: mapear(secciones, accion.clave, (s) => ({
                    ...s,
                    nombre: accion.nombre.trim() || null,
                })),
            };

        case 'cambiarDato':
            return {
                ...estado,
                secciones: mapear(secciones, accion.clave, (s) => ({
                    ...s,
                    datos: { ...s.datos, [accion.campo]: accion.valor },
                })),
            };

        case 'cambiarEstilo':
            return {
                ...estado,
                secciones: mapear(secciones, accion.clave, (s) => ({
                    ...s,
                    estilos: { ...s.estilos, [accion.campo]: accion.valor },
                })),
            };

        case 'asignarIds':
            return {
                ...estado,
                secciones: secciones.map((s) =>
                    accion.mapa[s.clave] !== undefined
                        ? { ...s, id: accion.mapa[s.clave] }
                        : s,
                ),
            };

        case 'seleccionarElemento':
            return {
                ...estado,
                seleccion: accion.seccion,
                seleccionElemento: accion.clave,
            };

        case 'anadirElemento': {
            const pieza = crearElemento(accion.elemento);

            if (!pieza) {
                return estado;
            }

            return {
                ...estado,
                secciones: mapearElementos(
                    secciones,
                    accion.seccion,
                    // Entra detrás de la pieza elegida, o al final.
                    (elementos) => {
                        const indice = elementos.findIndex(
                            (e) => e.clave === estado.seleccionElemento,
                        );

                        return indice === -1
                            ? [...elementos, pieza]
                            : [
                                  ...elementos.slice(0, indice + 1),
                                  pieza,
                                  ...elementos.slice(indice + 1),
                              ];
                    },
                ),
                seleccion: accion.seccion,
                seleccionElemento: pieza.clave,
            };
        }

        case 'duplicarElemento': {
            const copia = { clave: nuevaClave('e') };

            return {
                ...estado,
                secciones: mapearElementos(
                    secciones,
                    accion.seccion,
                    (elementos) => {
                        const indice = elementos.findIndex(
                            (e) => e.clave === accion.clave,
                        );

                        if (indice === -1) {
                            return elementos;
                        }

                        return [
                            ...elementos.slice(0, indice + 1),
                            { ...structuredClone(elementos[indice]), ...copia },
                            ...elementos.slice(indice + 1),
                        ];
                    },
                ),
                seleccion: accion.seccion,
                seleccionElemento: copia.clave,
            };
        }

        case 'eliminarElemento':
            return {
                ...estado,
                secciones: mapearElementos(
                    secciones,
                    accion.seccion,
                    (elementos) =>
                        elementos.filter((e) => e.clave !== accion.clave),
                ),
                seleccionElemento:
                    estado.seleccionElemento === accion.clave
                        ? null
                        : estado.seleccionElemento,
            };

        case 'moverElemento':
            return {
                ...estado,
                secciones: mapearElementos(
                    secciones,
                    accion.seccion,
                    (elementos) => {
                        if (
                            accion.desde === accion.hasta ||
                            accion.desde < 0 ||
                            accion.hasta < 0 ||
                            accion.desde >= elementos.length ||
                            accion.hasta >= elementos.length
                        ) {
                            return elementos;
                        }

                        const copia = [...elementos];
                        const [movido] = copia.splice(accion.desde, 1);

                        copia.splice(accion.hasta, 0, movido);

                        return copia;
                    },
                ),
            };

        case 'cambiarDatoElemento':
            return {
                ...estado,
                secciones: mapearElementos(
                    secciones,
                    accion.seccion,
                    (elementos) =>
                        elementos.map((e) =>
                            e.clave === accion.clave
                                ? {
                                      ...e,
                                      datos: {
                                          ...e.datos,
                                          [accion.campo]: accion.valor,
                                      },
                                  }
                                : e,
                        ),
                ),
            };

        case 'cambiarAnchoElemento':
            return {
                ...estado,
                secciones: mapearElementos(
                    secciones,
                    accion.seccion,
                    (elementos) =>
                        elementos.map((e) =>
                            e.clave === accion.clave
                                ? { ...e, ancho: accion.ancho }
                                : e,
                        ),
                ),
            };

        default:
            return estado;
    }
}

/**
 * Aplica una transformación a las piezas de una sección contenedora.
 *
 * Devuelve el mismo array si nada cambió, para que el reductor pueda
 * descartar la acción sin ensuciar el historial de deshacer.
 */
function mapearElementos(
    secciones: SeccionEditor[],
    claveSeccion: string,
    transformar: (elementos: ElementoLienzo[]) => ElementoLienzo[],
): SeccionEditor[] {
    return secciones.map((seccion) => {
        if (seccion.clave !== claveSeccion) {
            return seccion;
        }

        const actuales = elementosDe(seccion);
        const elementos = transformar(actuales);

        if (elementos === actuales) {
            return seccion;
        }

        return { ...seccion, datos: { ...seccion.datos, elementos } };
    });
}

function mapear(
    secciones: SeccionEditor[],
    clave: string,
    transformar: (seccion: SeccionEditor) => SeccionEditor,
): SeccionEditor[] {
    return secciones.map((s) => (s.clave === clave ? transformar(s) : s));
}

/**
 * Cuerpo que espera el endpoint de autoguardado.
 */
export function cargaUtil(secciones: SeccionEditor[]) {
    return secciones.map((seccion) => ({
        clave: seccion.clave,
        id: seccion.id,
        bloque: seccion.bloque,
        nombre: seccion.nombre,
        es_visible: seccion.es_visible,
        datos: seccion.datos,
        estilos: seccion.estilos,
    }));
}

/**
 * Firma del contenido, para saber si hay algo pendiente de guardar sin
 * comparar objetos enteros en cada tecla.
 */
export function firma(secciones: SeccionEditor[]): string {
    return JSON.stringify(cargaUtil(secciones));
}
