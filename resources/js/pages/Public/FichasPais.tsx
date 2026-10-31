import { BookOpen, FileText } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Estanteria } from '@/components/public/fichas-pais/estanteria';
import type { FichaEnEstante } from '@/components/public/fichas-pais/estanteria';
import { LectorLibro } from '@/components/public/fichas-pais/lector-libro';
import type { FichaLibro } from '@/components/public/fichas-pais/lector-libro';
import { FadeInUp } from '@/components/public/reveal';
import { SeccionesDelModulo } from '@/components/public/secciones-del-modulo';
import PublicLayout from '@/layouts/PublicLayout';

type FichaDeLaApi = {
    id: number;
    pais: string;
    titulo: string;
    descripcion: string | null;
    pdf_url: string | null;
    orden: number;
    fecha_publicacion: string | null;
};

function Cargando() {
    return (
        <div className="grid gap-8 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, indice) => (
                <div
                    key={indice}
                    className="flex flex-col items-center gap-8 rounded-3xl border border-stone-200/80 bg-white p-6 sm:flex-row sm:p-8"
                >
                    <div className="aspect-[1/1.414] w-36 shrink-0 animate-pulse rounded-md bg-gray-200 sm:w-40" />
                    <div className="w-full flex-1 space-y-3">
                        <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
                        <div className="h-6 w-4/5 animate-pulse rounded bg-gray-200" />
                        <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
                        <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
                        <div className="h-10 w-40 animate-pulse rounded-full bg-gray-200" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function FichasPaisPage() {
    const [fichas, setFichas] = useState<FichaEnEstante[] | null>(null);
    const [error, setError] = useState(false);
    const [abierta, setAbierta] = useState<FichaLibro | null>(null);
    const cerrar = useCallback(() => setAbierta(null), []);

    useEffect(() => {
        fetch('/api/fichas-pais')
            .then((respuesta) => respuesta.json())
            .then((resultado: { success: boolean; data: FichaDeLaApi[] }) => {
                if (!resultado.success) {
                    throw new Error();
                }

                setFichas(
                    [...resultado.data]
                        .sort((a, b) => a.orden - b.orden)
                        .map((ficha) => ({
                            id: ficha.id,
                            pais: ficha.pais,
                            titulo: ficha.titulo,
                            descripcion: ficha.descripcion,
                            pdf: ficha.pdf_url,
                            fecha_publicacion: ficha.fecha_publicacion,
                        })),
                );
            })
            .catch(() => setError(true));
    }, []);

    return (
        <PublicLayout>
            <SeccionesDelModulo lugar="arriba" />

            <section className="bg-gradient-to-b from-white via-stone-50 to-white py-16 md:py-24">
                <div className="container mx-auto px-6">
                    <FadeInUp>
                        <div className="mx-auto mb-14 max-w-2xl text-center">
                            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.25em] text-red-600 uppercase">
                                <BookOpen className="h-4 w-4" />
                                Biblioteca
                            </span>
                            <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl">
                                Elige una ficha y hojéala
                            </h2>
                            <p className="mt-3 text-gray-600">
                                Datos económicos, comercio bilateral y
                                oportunidades de cada mercado. Ábrela y pasa las
                                páginas como en un libro, o descárgala en PDF.
                            </p>
                        </div>
                    </FadeInUp>

                    <div className="mx-auto max-w-6xl">
                        {error ? (
                            <p className="text-center text-gray-500">
                                No pudimos cargar las fichas país. Inténtalo de
                                nuevo más tarde.
                            </p>
                        ) : fichas === null ? (
                            <Cargando />
                        ) : fichas.length === 0 ? (
                            <div className="py-10 text-center">
                                <FileText className="mx-auto mb-4 h-14 w-14 text-gray-300" />
                                <h3 className="text-lg font-semibold text-gray-700">
                                    Todavía no hay fichas país
                                </h3>
                                <p className="mt-1 text-gray-500">
                                    Pronto publicaremos las primeras.
                                </p>
                            </div>
                        ) : (
                            <Estanteria fichas={fichas} onAbrir={setAbierta} />
                        )}
                    </div>
                </div>
            </section>

            <SeccionesDelModulo lugar="abajo" />

            {abierta && <LectorLibro ficha={abierta} onCerrar={cerrar} />}
        </PublicLayout>
    );
}
