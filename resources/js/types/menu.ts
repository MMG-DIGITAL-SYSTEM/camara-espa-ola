export type EntradaDeMenu = {
    titulo: string;
    /** Null en las entradas que solo despliegan un submenú. */
    url: string | null;
    nueva_pestana: boolean;
    hijos: Omit<EntradaDeMenu, 'hijos'>[];
};

export type MenusDelSitio = {
    principal: EntradaDeMenu[];
    pie: Omit<EntradaDeMenu, 'hijos'>[];
};
