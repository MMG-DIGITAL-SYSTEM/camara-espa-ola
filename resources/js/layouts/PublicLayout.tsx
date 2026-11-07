// resources/js/layouts/PublicLayout.tsx
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import AsistenteChat from '@/components/public/asistente-chat';
import Footer from '@/components/public/Footer';
import Navbar from '@/components/public/Navbar';

interface PublicLayoutProps {
    children: ReactNode;
}

/** Mensaje con el que la página incrustada avisa al editor de su altura. */
export const MENSAJE_ALTURA = 'camara:altura-contenido';

/**
 * Modo «solo contenido»: la página va dentro del editor visual, que necesita
 * saber cuánto mide para dimensionar el marco sin barras de desplazamiento.
 */
function SoloContenido({ children }: { children: ReactNode }) {
    useEffect(() => {
        const avisar = () =>
            window.parent.postMessage(
                {
                    tipo: MENSAJE_ALTURA,
                    altura: document.documentElement.scrollHeight,
                },
                window.location.origin,
            );

        const observador = new ResizeObserver(avisar);
        observador.observe(document.body);
        avisar();

        return () => observador.disconnect();
    }, []);

    return <main>{children}</main>;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
    if (usePage().props.soloContenido) {
        return <SoloContenido>{children}</SoloContenido>;
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            {/* Alto de la barra fija sin scroll: logo (h-11 / md:h-14) + py-4. */}
            <main className="flex-1 pt-[76px] md:pt-[88px]">{children}</main>
            <Footer />
            <AsistenteChat />
        </div>
    );
}
