import { LayoutList } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { MENSAJE_ALTURA } from '@/layouts/PublicLayout';
import type { SeccionEditor } from '@/pages/Admin/Paginas/estado';

/**
 * El separador llamado «listado» marca dónde va el contenido propio de una
 * página de módulo (formularios, listados, oficinas…). Misma regla que
 * App\Concerns\DecoraConBloques en el servidor.
 */
export function esMarcadorDeListado(seccion: SeccionEditor): boolean {
    return (
        seccion.bloque === 'separador' &&
        (seccion.nombre ?? '').trim().toLowerCase() === 'listado'
    );
}

/**
 * Contenido propio de un módulo dentro de la vista previa.
 *
 * Ese contenido está escrito a mano en la vista del módulo y carga sus propios
 * datos, así que no se reconstruye aquí: se incrusta la página pública real en
 * modo «solo contenido» (sin menú, pie ni secciones editables). La página
 * avisa de su altura para que el marco crezca sin barras de desplazamiento.
 */
export function ContenidoDelModulo({ url }: { url: string }) {
    const marco = useRef<HTMLIFrameElement>(null);
    const [altura, setAltura] = useState(480);

    useEffect(() => {
        const alRecibir = (evento: MessageEvent) => {
            if (
                evento.origin !== window.location.origin ||
                evento.source !== marco.current?.contentWindow ||
                evento.data?.tipo !== MENSAJE_ALTURA
            ) {
                return;
            }

            setAltura(Math.max(120, Number(evento.data.altura) || 0));
        };

        window.addEventListener('message', alRecibir);

        return () => window.removeEventListener('message', alRecibir);
    }, []);

    const separador = url.includes('?') ? '&' : '?';

    return (
        <div className="relative">
            <span className="absolute top-2 right-2 z-10 inline-flex items-center gap-1.5 rounded-full bg-gray-900/80 px-2.5 py-1 text-[11px] font-medium text-white shadow-sm backdrop-blur-sm">
                <LayoutList className="size-3" />
                Contenido propio de la página
            </span>
            <iframe
                ref={marco}
                src={`${url}${separador}solo_contenido=1`}
                title="Contenido propio de la página"
                tabIndex={-1}
                className="block w-full border-0"
                style={{ height: `${altura}px` }}
            />
        </div>
    );
}
