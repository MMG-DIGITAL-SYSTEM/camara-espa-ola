import type { CategoriaBloque, CategoriaElemento } from '@/blocks/tipos';

/**
 * Color de cada categoría del catálogo. Se repite en el árbol de secciones y
 * en los catálogos para que un bloque se reconozca por su color de un vistazo.
 */
export const TONO_CATEGORIA: Record<
    CategoriaBloque | CategoriaElemento,
    string
> = {
    Estructura: 'bg-sky-500/12 text-sky-600 dark:text-sky-300',
    Contenido: 'bg-violet-500/12 text-violet-600 dark:text-violet-300',
    Dinámicos: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-300',
    Texto: 'bg-sky-500/12 text-sky-600 dark:text-sky-300',
    Medios: 'bg-violet-500/12 text-violet-600 dark:text-violet-300',
    Tarjetas: 'bg-amber-500/15 text-amber-600 dark:text-amber-300',
    Separación: 'bg-slate-500/12 text-slate-600 dark:text-slate-300',
};

/** Fila elegida en el árbol: un velo del degradado de marca. */
export const FILA_ACTIVA =
    'border-marca/35 bg-linear-to-r from-marca/15 to-marca-calida/10 shadow-sm';
