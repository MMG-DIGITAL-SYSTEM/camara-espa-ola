import type { LucideIcon } from 'lucide-react';
import type { ComponentType } from 'react';

/**
 * Descripción declarativa de un campo editable.
 *
 * El panel de propiedades del editor se genera a partir de estas
 * definiciones, así que añadir un bloque nuevo no obliga a tocar el editor.
 */
export type Campo =
    | { tipo: 'texto'; clave: string; etiqueta: string; placeholder?: string }
    | {
          tipo: 'textarea';
          clave: string;
          etiqueta: string;
          filas?: number;
          placeholder?: string;
      }
    | { tipo: 'richtext'; clave: string; etiqueta: string }
    | { tipo: 'imagen'; clave: string; etiqueta: string }
    | { tipo: 'enlace'; clave: string; etiqueta: string; placeholder?: string }
    | { tipo: 'icono'; clave: string; etiqueta: string }
    /** Color en hexadecimal; vacío = el del diseño. */
    | { tipo: 'color'; clave: string; etiqueta: string }
    | {
          tipo: 'numero';
          clave: string;
          etiqueta: string;
          min?: number;
          max?: number;
      }
    | { tipo: 'switch'; clave: string; etiqueta: string; ayuda?: string }
    | {
          tipo: 'select';
          clave: string;
          etiqueta: string;
          opciones: { valor: string; etiqueta: string }[];
      }
    | {
          tipo: 'repetidor';
          clave: string;
          etiqueta: string;
          campos: Campo[];
          /** Campo del elemento que se usa como título en la lista. */
          titulo?: string;
          maximo?: number;
      };

/**
 * Fracción de la rejilla del lienzo que ocupa un elemento.
 *
 * Se guarda por nombre y no en columnas para que cambiar la rejilla más
 * adelante no obligue a reescribir el contenido ya publicado.
 */
export type AnchoElemento =
    'completo' | 'dos-tercios' | 'mitad' | 'tercio' | 'cuarto';

/**
 * Pieza suelta dentro de un bloque contenedor.
 *
 * `clave` es un identificador local estable: sobrevive al guardado, así que
 * el elemento sigue seleccionado aunque la sección se vuelva a cargar.
 */
export type ElementoLienzo = {
    clave: string;
    elemento: string;
    ancho: AnchoElemento;
    datos: DatosBloque;
};

export type CategoriaElemento = 'Texto' | 'Medios' | 'Tarjetas' | 'Separación';

export type PropsElemento<D extends DatosBloque = DatosBloque> = {
    datos: D;
    estilos?: EstilosSeccion;
};

/**
 * Definición de un elemento, con la misma forma que la de un bloque: el panel
 * de propiedades se genera desde `campos`, de modo que añadir una pieza nueva
 * al catálogo no obliga a tocar el editor.
 */
export type DefinicionElemento<D extends DatosBloque = DatosBloque> = {
    clave: string;
    nombre: string;
    descripcion: string;
    icono: LucideIcon;
    categoria: CategoriaElemento;
    componente: ComponentType<PropsElemento<D>>;
    defaults: D;
    campos: Campo[];
    /** Ancho con el que nace, si no quiere ocupar la fila entera. */
    anchoPorDefecto?: AnchoElemento;
};

export type FondoSeccion = 'claro' | 'suave' | 'oscuro' | 'marca';
export type EspaciadoSeccion = 'compacto' | 'normal' | 'amplio';
export type AnchoSeccion = 'estrecho' | 'normal' | 'completo';

export type EstilosSeccion = {
    fondo?: FondoSeccion;
    espaciado?: EspaciadoSeccion;
    ancho?: AnchoSeccion;
};

export type DatosBloque = Record<string, unknown>;

export type PropsBloque<D extends DatosBloque = DatosBloque> = {
    datos: D;
    estilos?: EstilosSeccion;
    /**
     * Contenido resuelto en el servidor para los bloques dinámicos
     * (últimas noticias, directorio…). Indefinido en los estructurales.
     */
    contenido?: unknown;
};

export type CategoriaBloque = 'Estructura' | 'Contenido' | 'Dinámicos';

export type DefinicionBloque<D extends DatosBloque = DatosBloque> = {
    clave: string;
    nombre: string;
    descripcion: string;
    icono: LucideIcon;
    categoria: CategoriaBloque;
    componente: ComponentType<PropsBloque<D>>;
    /** Valores con los que nace el bloque al añadirlo. */
    defaults: D;
    campos: Campo[];
    /** Recibe `contenido` desde el servidor. */
    dinamico?: boolean;
    /** Estilos iniciales, si el bloque pide algo distinto de lo normal. */
    estilosPorDefecto?: EstilosSeccion;
    /**
     * El bloque es un contenedor: su campo `elementos` se edita colocando
     * piezas en el lienzo, no desde el panel de propiedades.
     */
    admiteElementos?: boolean;
};

export type Seccion = {
    id: number;
    bloque: string;
    nombre: string | null;
    orden: number;
    es_visible: boolean;
    datos: DatosBloque;
    estilos: EstilosSeccion;
};
