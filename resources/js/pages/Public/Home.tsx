import { Head } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';

export default function HomePage() {
    return (
        <PublicLayout>
            <Head title="Inicio" />
            <div className="container mx-auto px-4 py-20">
                <div className="mx-auto max-w-3xl text-center">
                    <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
                        Cámara Oficial Española en Bolivia
                    </h1>
                    <p className="text-xl text-gray-600">
                        Conectando oportunidades entre España y Bolivia
                    </p>
                </div>
            </div>
        </PublicLayout>
    );
}
