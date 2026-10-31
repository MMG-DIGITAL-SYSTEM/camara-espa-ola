import { Head } from '@inertiajs/react';
import type { Paginado } from '@/components/admin/data-table';
import { GestorDeOfertas } from '@/components/bolsa-trabajo/gestor-de-ofertas';
import type {
    OfertaFila,
    OpcionesOferta,
} from '@/components/bolsa-trabajo/gestor-de-ofertas';
import {
    destroy,
    index,
    show,
    store,
    update,
} from '@/routes/admin/bolsa-trabajo';

type Props = {
    ofertas: Paginado<OfertaFila>;
    opciones: OpcionesOferta;
    socios: { id: number; nombre: string }[];
    filtros: { buscar?: string; estado?: string; socio?: string };
};

export default function BolsaTrabajoIndex({
    ofertas,
    opciones,
    socios,
    filtros,
}: Props) {
    return (
        <>
            <Head title="Bolsa de trabajo" />

            <GestorDeOfertas
                titulo="Bolsa de trabajo"
                descripcion="Ofertas que publican los socios. Puedes corregirlas, cerrarlas o publicar en nombre de una empresa."
                ofertas={ofertas}
                opciones={opciones}
                filtros={filtros}
                socios={socios}
                rutas={{ index, show, store, update, destroy }}
            />
        </>
    );
}

BolsaTrabajoIndex.layout = {
    migas: [{ titulo: 'Comunidad' }, { titulo: 'Bolsa de trabajo' }],
};
