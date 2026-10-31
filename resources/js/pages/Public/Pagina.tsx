import { Head } from '@inertiajs/react';
import { Eye } from 'lucide-react';
import { RenderizarSecciones } from '@/blocks/BlockRenderer';
import type { DatosDeSecciones } from '@/blocks/BlockRenderer';
import type { Seccion } from '@/blocks/tipos';
import PublicLayout from '@/layouts/PublicLayout';

type Props = {
    pagina: {
        titulo: string;
        slug: string;
        seo_titulo: string | null;
        seo_descripcion: string | null;
    };
    secciones: Seccion[];
    datos: DatosDeSecciones;
    vistaPrevia: boolean;
};

export default function Pagina({
    pagina,
    secciones,
    datos,
    vistaPrevia,
}: Props) {
    return (
        <PublicLayout>
            <Head title={pagina.seo_titulo || pagina.titulo}>
                {pagina.seo_descripcion && (
                    <meta
                        name="description"
                        content={pagina.seo_descripcion}
                        head-key="description"
                    />
                )}
                {vistaPrevia && (
                    <meta name="robots" content="noindex" head-key="robots" />
                )}
            </Head>

            {vistaPrevia && (
                <div className="flex items-center justify-center gap-2 bg-amber-100 px-4 py-2 text-sm text-amber-900">
                    <Eye className="h-4 w-4" />
                    Estás viendo el borrador. Los visitantes ven la última
                    versión publicada.
                </div>
            )}

            {secciones.length === 0 ? (
                <div className="container mx-auto px-4 py-24 text-center">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        {pagina.titulo}
                    </h1>
                    <p className="mt-2 text-gray-500">
                        Esta página todavía no tiene contenido.
                    </p>
                </div>
            ) : (
                <RenderizarSecciones secciones={secciones} datos={datos} />
            )}
        </PublicLayout>
    );
}
