// resources/js/config/navigation.ts
//
// Este archivo ya no guarda datos. El menú vive en la tabla `menu_items` y los
// datos de contacto y redes en `ajustes`; ambos llegan por las props
// compartidas de Inertia (`props.menus` y `props.ajustes`).
//
// Se mantiene el tipo porque lo usa la navegación del panel.

export type NavItem = {
    label: string;
    href?: string;
    items?: NavItem[];
};
