// resources/js/components/public/Footer.tsx
import { Link, usePage } from '@inertiajs/react';
import { MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const REDES = [
    {
        clave: 'red_facebook',
        icono: Facebook,
        etiqueta: 'Facebook',
        hover: 'hover:bg-blue-600',
    },
    {
        clave: 'red_twitter',
        icono: Twitter,
        etiqueta: 'X (Twitter)',
        hover: 'hover:bg-blue-400',
    },
    {
        clave: 'red_linkedin',
        icono: Linkedin,
        etiqueta: 'LinkedIn',
        hover: 'hover:bg-blue-700',
    },
    {
        clave: 'red_instagram',
        icono: Instagram,
        etiqueta: 'Instagram',
        hover: 'hover:bg-pink-600',
    },
] as const;

export default function Footer() {
    const { menus, ajustes } = usePage().props;
    const enlaces = menus.pie;

    // Solo se pintan las redes que tengan dirección configurada.
    const redes = REDES.map((red) => ({
        ...red,
        url: ajustes[red.clave] ?? '',
    })).filter((red) => red.url !== '');

    const oficinas = [
        {
            titulo: ajustes.oficina_sc_titulo || 'SANTA CRUZ',
            direccion: ajustes.oficina_sc_direccion,
        },
        {
            titulo: ajustes.oficina_lp_titulo || 'LA PAZ',
            direccion: ajustes.oficina_lp_direccion,
        },
    ].filter((oficina) => Boolean(oficina.direccion));

    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
                <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
                    <div className="lg:col-span-1">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-wrap items-center gap-4">
                                <img
                                    src="https://camara.com.bo/wp-content/uploads/2023/05/logo-blanco.svg"
                                    alt="Cámara Española"
                                    className="h-12 w-auto brightness-0 invert"
                                />
                                <img
                                    src="https://camara.com.bo/wp-content/uploads/2023/05/logo_financiado_ue.png"
                                    alt="Unión Europea"
                                    className="h-12 w-auto"
                                />
                            </div>
                            <p className="max-w-xs text-sm leading-relaxed text-gray-400">
                                Una institución que conecta oportunidades entre
                                España y Bolivia.
                            </p>
                            <p className="text-xs text-gray-500">
                                © {new Date().getFullYear()} Cámara Oficial
                                Española en Bolivia
                            </p>
                        </div>
                    </div>

                    <div>
                        <h4 className="mb-4 text-sm font-semibold tracking-wider text-white uppercase">
                            Contacto
                        </h4>
                        <div className="space-y-4">
                            {oficinas.map((oficina) => (
                                <div key={oficina.titulo}>
                                    <p className="text-sm font-medium text-white">
                                        {oficina.titulo}
                                    </p>
                                    <div className="mt-1 flex items-start gap-2 text-sm text-gray-400">
                                        <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                        <span className="leading-relaxed">
                                            {oficina.direccion}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="mb-4 text-sm font-semibold tracking-wider text-white uppercase">
                            Explora
                        </h4>
                        <ul className="space-y-2">
                            {enlaces.map((item) => (
                                <li key={item.titulo}>
                                    <Link
                                        href={item.url ?? '#'}
                                        className="text-sm text-gray-400 transition-colors hover:text-white"
                                    >
                                        {item.titulo}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-4 text-sm font-semibold tracking-wider text-white uppercase">
                            Redes Sociales
                        </h4>
                        {redes.length === 0 ? (
                            <p className="text-sm text-gray-500">
                                Añade las redes desde Ajustes del sitio.
                            </p>
                        ) : (
                            <div className="flex gap-3">
                                {redes.map(
                                    ({
                                        clave,
                                        url,
                                        icono: Icono,
                                        etiqueta,
                                        hover,
                                    }) => (
                                        <a
                                            key={clave}
                                            href={url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className={`flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 transition-colors ${hover}`}
                                            aria-label={etiqueta}
                                        >
                                            <Icono className="h-5 w-5" />
                                        </a>
                                    ),
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-800">
                <div className="container mx-auto px-4 py-4 md:px-6">
                    <p className="text-center text-xs text-gray-500">
                        Cámara Oficial Española en Bolivia · Conectando
                        oportunidades entre España y Bolivia
                    </p>
                </div>
            </div>
        </footer>
    );
}
