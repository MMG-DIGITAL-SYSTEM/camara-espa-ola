import { Head } from '@inertiajs/react';
import type { Paginado } from '@/components/admin/data-table';
import { GestorDeOfertas } from '@/components/bolsa-trabajo/gestor-de-ofertas';
import type {
    OfertaFila,
    OpcionesOferta,
} from '@/components/bolsa-trabajo/gestor-de-ofertas';
import { destroy, index, show, store, update } from '@/routes/empresa/ofertas';

type Props = {
    ofertas: Paginado<OfertaFila>;
    opciones: OpcionesOferta;
    filtros: { buscar?: string; estado?: string };
};

export default function OfertasIndex({ ofertas, opciones, filtros }: Props) {
    return (
        <>
            <Head title="Mis ofertas" />

            <GestorDeOfertas
                titulo="Mis ofertas de empleo"
                descripcion="Lo que publiques aquí aparece en la bolsa de trabajo del sitio."
                ofertas={ofertas}
                opciones={opciones}
                filtros={filtros}
                rutas={{ index, show, store, update, destroy }}
            />
        </>
    );
}

OfertasIndex.layout = {
    migas: [{ titulo: 'Bolsa de trabajo' }, { titulo: 'Mis ofertas' }],
};
