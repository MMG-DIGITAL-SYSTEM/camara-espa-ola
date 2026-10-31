/**
 * Tipos mínimos de page-flip: el paquete no publica los suyos. Solo lo que
 * usa el lector de las fichas país.
 */
declare module 'page-flip' {
    export type OrientacionPageFlip = 'portrait' | 'landscape';

    export interface AjustesPageFlip {
        width: number;
        height: number;
        size: 'fixed' | 'stretch';
        minWidth: number;
        maxWidth: number;
        minHeight: number;
        maxHeight: number;
        startPage: number;
        drawShadow: boolean;
        flippingTime: number;
        usePortrait: boolean;
        maxShadowOpacity: number;
        showCover: boolean;
        mobileScrollSupport: boolean;
        showPageCorners: boolean;
        autoSize: boolean;
    }

    export class PageFlip {
        constructor(elemento: HTMLElement, ajustes: Partial<AjustesPageFlip>);
        loadFromHTML(paginas: HTMLElement[]): void;
        flipNext(): void;
        flipPrev(): void;
        flip(pagina: number): void;
        turnToPage(pagina: number): void;
        getCurrentPageIndex(): number;
        getPageCount(): number;
        getOrientation(): OrientacionPageFlip;
        on(
            evento: 'flip',
            accion: (evento: { data: number }) => void,
        ): PageFlip;
        on(
            evento: 'changeOrientation',
            accion: (evento: { data: OrientacionPageFlip }) => void,
        ): PageFlip;
        destroy(): void;
    }
}
