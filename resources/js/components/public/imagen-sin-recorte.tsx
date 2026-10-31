import { cn } from '@/lib/utils';

interface ImagenSinRecorteProps {
    src: string;
    alt: string;
    className?: string;
}

/**
 * Muestra la imagen entera dentro de un contenedor de proporción fija.
 * El hueco que deja una foto vertical o panorámica se rellena con la misma
 * imagen desenfocada. El contenedor debe ser `relative overflow-hidden`.
 */
export function ImagenSinRecorte({
    src,
    alt,
    className,
}: ImagenSinRecorteProps) {
    return (
        <>
            <img
                src={src}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-70 blur-2xl"
            />
            <img
                src={src}
                alt={alt}
                className={cn(
                    'relative h-full w-full object-contain',
                    className,
                )}
            />
        </>
    );
}
