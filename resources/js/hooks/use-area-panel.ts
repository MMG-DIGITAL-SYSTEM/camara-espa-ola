import { useEffect } from 'react';

/**
 * Marca el documento como «área del panel» mientras el componente está
 * montado: activa la barra lateral azul noche, las superficies del panel y los
 * botones en rojo de marca (ver `[data-area='panel']` en app.css).
 *
 * Va en <html> y no en un contenedor porque menús y diálogos se renderizan en
 * portales colgados de <body>: desde ahí no heredarían las variables.
 */
export function useAreaPanel(): void {
    useEffect(() => {
        document.documentElement.dataset.area = 'panel';

        return () => {
            delete document.documentElement.dataset.area;
        };
    }, []);
}
