import { Building2 } from 'lucide-react';
import { useState } from 'react';

/** Lo que muestran las vistas públicas de una oferta, en listado y detalle. */
export type OfertaResumen = {
    id: number;
    titulo: string;
    area: string | null;
    ubicacion: string | null;
    modalidad: string;
    jornada: string;
    salario: string | null;
    publicada: string | null;
    fecha_cierre: string | null;
    empresa: { nombre: string; slug: string; logo: string | null };
};

export function LogoEmpresa({
    empresa,
    tamano = 'h-12 w-12',
}: {
    empresa: OfertaResumen['empresa'];
    tamano?: string;
}) {
    const [roto, setRoto] = useState(false);

    return (
        <span
            className={`${tamano} flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-white`}
        >
            {empresa.logo && !roto ? (
                <img
                    src={empresa.logo}
                    alt={empresa.nombre}
                    loading="lazy"
                    onError={() => setRoto(true)}
                    className="h-full w-full object-contain p-1"
                />
            ) : (
                <Building2 className="h-1/2 w-1/2 text-gray-300" />
            )}
        </span>
    );
}
