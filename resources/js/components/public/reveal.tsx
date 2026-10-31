import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

/**
 * Dentro del editor de páginas las animaciones de entrada se desactivan.
 *
 * Los bloques aparecen con opacidad 0 hasta que el IntersectionObserver los
 * detecta; en un preview que se re-renderiza a cada tecleo eso los dejaría
 * parpadeando o directamente invisibles.
 */
export const ContextoEditor = createContext(false);

export function useEstaEnEditor(): boolean {
    return useContext(ContextoEditor);
}

export function useReveal(threshold = 0.15) {
    const enEditor = useEstaEnEditor();
    const [visible, setVisible] = useState(enEditor);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Dentro del editor nace visible, así que no hay nada que observar.
        if (enEditor) {
            return;
        }

        const nodo = ref.current;

        if (!nodo) {
            return;
        }

        const observador = new IntersectionObserver(
            ([entrada]) => {
                if (entrada.isIntersecting) {
                    setVisible(true);
                    observador.disconnect();
                }
            },
            { threshold, rootMargin: '0px 0px -50px 0px' },
        );

        observador.observe(nodo);

        return () => observador.disconnect();
    }, [threshold, enEditor]);

    return { ref, visible };
}

type PropsReveal = {
    children: ReactNode;
    delay?: number;
    className?: string;
};

function crearReveal(oculto: string) {
    return function Reveal({
        children,
        delay = 0,
        className = '',
    }: PropsReveal) {
        const { ref, visible } = useReveal(0.1);

        return (
            <div
                ref={ref}
                className={`transition-all duration-700 ease-out ${className} ${
                    visible ? 'translate-x-0 translate-y-0 opacity-100' : oculto
                }`}
                style={{ transitionDelay: `${delay}ms` }}
            >
                {children}
            </div>
        );
    };
}

export const FadeInUp = crearReveal('translate-y-12 opacity-0');
export const FadeInLeft = crearReveal('-translate-x-12 opacity-0');
export const FadeInRight = crearReveal('translate-x-12 opacity-0');
