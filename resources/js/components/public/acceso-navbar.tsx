// resources/js/components/public/acceso-navbar.tsx
import { Link, router, usePage } from '@inertiajs/react';
import { LayoutGrid, LogIn, LogOut, UserPlus } from 'lucide-react';
import { login, logout, register } from '@/routes';
import { dashboard } from '@/routes/admin';
import { index as misOfertas } from '@/routes/empresa/ofertas';
import { edit as miCuenta } from '@/routes/profile';
import type { User } from '@/types';

/**
 * Adónde lleva el botón de una sesión abierta: cada rol tiene su área.
 */
function areaDe(usuario: User): { titulo: string; href: string } {
    if (usuario.accede_al_panel) {
        return { titulo: 'Panel', href: dashboard().url };
    }

    if (usuario.accede_al_portal_de_empresas) {
        return { titulo: 'Mis ofertas', href: misOfertas().url };
    }

    return { titulo: 'Mi cuenta', href: miCuenta().url };
}

/**
 * Botones de acceso del sitio público: iniciar sesión y registrarse para el
 * visitante; su área y cerrar sesión para quien ya entró.
 *
 * `movil` los apila a lo ancho para el menú desplegable.
 */
export function AccesoNavbar({
    movil = false,
    onNavegar,
}: {
    movil?: boolean;
    onNavegar?: () => void;
}) {
    const usuario = usePage().props.auth.user;

    const contenedor = movil
        ? 'grid gap-3'
        : 'hidden shrink-0 items-center gap-1 lg:flex';
    const secundario = `inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium whitespace-nowrap text-gray-700 transition-colors duration-300 hover:bg-red-50/50 hover:text-red-600 ${
        movil ? 'border border-gray-200 px-4 py-3' : 'p-2.5 2xl:px-4 2xl:py-2'
    }`;
    const principal = `inline-flex items-center justify-center gap-2 rounded-full bg-red-600 text-sm font-semibold whitespace-nowrap text-white shadow-sm transition-all duration-300 hover:bg-red-700 hover:shadow-md ${
        movil ? 'px-5 py-3' : 'px-4 py-2 xl:px-5'
    }`;

    /*
     * En escritorio no cabe todo el menú más dos botones con texto: el
     * secundario se queda en icono hasta las pantallas más anchas.
     */
    const textoSecundario = movil ? '' : 'sr-only 2xl:not-sr-only';

    if (!usuario) {
        return (
            <div className={contenedor}>
                <Link
                    href={login()}
                    className={secundario}
                    onClick={onNavegar}
                    title="Iniciar sesión"
                >
                    <LogIn className="h-4 w-4" />
                    <span className={textoSecundario}>Iniciar sesión</span>
                </Link>
                <Link
                    href={register()}
                    className={principal}
                    onClick={onNavegar}
                >
                    <UserPlus className="h-4 w-4" />
                    Registrarse
                </Link>
            </div>
        );
    }

    const area = areaDe(usuario);

    return (
        <div className={contenedor}>
            <Link
                href={logout()}
                as="button"
                className={secundario}
                title="Cerrar sesión"
                onClick={() => {
                    onNavegar?.();
                    router.flushAll();
                }}
            >
                <LogOut className="h-4 w-4" />
                <span className={textoSecundario}>Cerrar sesión</span>
            </Link>
            <Link href={area.href} className={principal} onClick={onNavegar}>
                <LayoutGrid className="h-4 w-4" />
                {area.titulo}
            </Link>
        </div>
    );
}
