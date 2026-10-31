// resources/js/components/public/Navbar.tsx
import { Link, usePage } from '@inertiajs/react';
import {
    Menu,
    X,
    ChevronDown,
    Sparkles,
    Globe,
    Newspaper,
    Building2,
    Users,
    Calendar,
    FileText,
    Share2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { AccesoNavbar } from '@/components/public/acceso-navbar';
import { urlDelLogo } from '@/lib/logo';
import type { EntradaDeMenu } from '@/types/menu';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [expandedMobileItem, setExpandedMobileItem] = useState<string | null>(
        null,
    );
    const { url, props } = usePage();
    const navegacion: EntradaDeMenu[] = props.menus.principal;
    const logo = urlDelLogo(props.ajustes.sitio_logo);

    // Scroll handler con debounce
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        const handleScroll = () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            timeoutId = setTimeout(() => {
                setIsScrolled(window.scrollY > 20);
            }, 10);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);

            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, []);

    // Prevenir scroll en móvil
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    // Cerrar con Escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsMobileMenuOpen(false);
                setExpandedMobileItem(null);
                setOpenDropdown(null);
            }
        };
        document.addEventListener('keydown', handleEscape);

        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    const isActiveRoute = (href: string) => {
        if (!href || href === '#') {
            return false;
        }

        return url === href || url.startsWith(href + '/');
    };

    const toggleMobileItem = (label: string) => {
        setExpandedMobileItem(expandedMobileItem === label ? null : label);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);

        if (!isMobileMenuOpen) {
            setExpandedMobileItem(null);
        }
    };

    // Función para obtener icono según el nombre
    const getIcon = (label: string) => {
        const iconMap: Record<string, any> = {
            Inicio: Sparkles,
            'La Cámara': Building2,
            Servicios: FileText,
            Actividades: Calendar,
            Noticias: Newspaper,
            'Fichas País': Globe,
            'Red de Cámaras': Share2,
            Socios: Users,
            Contacto: Globe,
        };

        return iconMap[label] || null;
    };

    return (
        <>
            <header
                className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ease-in-out ${
                    isScrolled
                        ? 'border-b border-gray-100/50 bg-white/95 py-2 shadow-[0_2px_30px_rgba(0,0,0,0.08)] backdrop-blur-lg'
                        : 'border-b border-gray-100/30 bg-white/90 py-4 backdrop-blur-md'
                }`}
            >
                <div className="container mx-auto flex items-center justify-between gap-4 px-4 md:px-6">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="group flex flex-shrink-0 items-center gap-3"
                        aria-label="Inicio - Cámara Española en Bolivia"
                    >
                        {/* El logo ya lleva el nombre de la Cámara: no se repite al lado. */}
                        <div className="relative">
                            <img
                                src={logo}
                                alt="Cámara Oficial Española en Bolivia"
                                className={`w-auto transition-all duration-500 group-hover:scale-105 group-hover:opacity-90 ${
                                    isScrolled ? 'h-10 md:h-11' : 'h-11 md:h-14'
                                }`}
                            />
                            <div className="absolute -inset-1 rounded-full bg-red-600/5 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav
                        className="hidden min-w-0 items-center gap-0.5 lg:flex"
                        aria-label="Navegación principal"
                    >
                        {navegacion.map((item) => {
                            const hasDropdown = item.hijos.length > 0;
                            const isActive = item.url
                                ? isActiveRoute(item.url)
                                : false;
                            const Icon = getIcon(item.titulo);

                            return (
                                <div
                                    key={item.titulo}
                                    className="group relative"
                                    onMouseEnter={() =>
                                        hasDropdown &&
                                        setOpenDropdown(item.titulo)
                                    }
                                    onMouseLeave={() =>
                                        hasDropdown && setOpenDropdown(null)
                                    }
                                >
                                    {hasDropdown ? (
                                        <>
                                            <button
                                                className={`relative flex items-center gap-1.5 rounded-lg px-2.5 py-2.5 text-sm font-medium whitespace-nowrap transition-all duration-300 xl:px-3.5 ${
                                                    isActive
                                                        ? 'bg-red-50/50 text-red-600'
                                                        : 'text-gray-700 hover:bg-red-50/30 hover:text-red-600'
                                                }`}
                                                aria-expanded={
                                                    openDropdown === item.titulo
                                                }
                                                aria-haspopup="true"
                                            >
                                                {Icon && (
                                                    <Icon className="hidden h-4 w-4 opacity-70 2xl:inline" />
                                                )}
                                                {item.titulo}
                                                <ChevronDown
                                                    className={`h-3.5 w-3.5 transition-transform duration-300 ${
                                                        openDropdown ===
                                                        item.titulo
                                                            ? 'rotate-180 text-red-600'
                                                            : 'opacity-50'
                                                    }`}
                                                />
                                                <span
                                                    className={`absolute bottom-0 left-1/2 h-0.5 -translate-x-1/2 bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300 ${
                                                        isActive
                                                            ? 'w-6'
                                                            : 'w-0 group-hover:w-4'
                                                    }`}
                                                />
                                            </button>

                                            {/* Dropdown elegante */}
                                            {openDropdown === item.titulo && (
                                                <div className="absolute left-0 mt-1 min-w-[240px] animate-in rounded-xl border border-gray-100/80 bg-white py-2 shadow-[0_10px_50px_rgba(0,0,0,0.1)] duration-200 fade-in slide-in-from-top-2">
                                                    <div className="mx-4 mb-2 h-0.5 w-12 rounded-full bg-gradient-to-r from-red-600 to-red-400" />
                                                    {item.hijos.map(
                                                        (subItem) => {
                                                            const isSubActive =
                                                                isActiveRoute(
                                                                    subItem.url ||
                                                                        '#',
                                                                );
                                                            const SubIcon =
                                                                getIcon(
                                                                    subItem.titulo,
                                                                );

                                                            return (
                                                                <Link
                                                                    key={
                                                                        subItem.titulo
                                                                    }
                                                                    href={
                                                                        subItem.url ||
                                                                        '#'
                                                                    }
                                                                    className={`group/sub flex items-center gap-3 px-5 py-2.5 text-sm transition-all duration-200 ${
                                                                        isSubActive
                                                                            ? 'bg-red-50/50 font-medium text-red-600'
                                                                            : 'text-gray-700 hover:bg-gray-50/80 hover:text-red-600'
                                                                    }`}
                                                                    role="menuitem"
                                                                >
                                                                    {SubIcon && (
                                                                        <span
                                                                            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-200 ${
                                                                                isSubActive
                                                                                    ? 'bg-red-100 text-red-600'
                                                                                    : 'bg-gray-100 text-gray-400 group-hover/sub:bg-red-50 group-hover/sub:text-red-600'
                                                                            }`}
                                                                        >
                                                                            <SubIcon className="h-4 w-4" />
                                                                        </span>
                                                                    )}
                                                                    <span className="flex-1">
                                                                        {
                                                                            subItem.titulo
                                                                        }
                                                                    </span>
                                                                    {isSubActive && (
                                                                        <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                                                                    )}
                                                                </Link>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <Link
                                            href={item.url || '#'}
                                            className={`relative flex items-center gap-1.5 rounded-lg px-2.5 py-2.5 text-sm font-medium whitespace-nowrap transition-all duration-300 xl:px-3.5 ${
                                                isActive
                                                    ? 'bg-red-50/50 text-red-600'
                                                    : 'text-gray-700 hover:bg-red-50/30 hover:text-red-600'
                                            }`}
                                        >
                                            {Icon && (
                                                <Icon className="hidden h-4 w-4 opacity-70 2xl:inline" />
                                            )}
                                            {item.titulo}
                                            <span
                                                className={`absolute bottom-0 left-1/2 h-0.5 -translate-x-1/2 bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300 ${
                                                    isActive
                                                        ? 'w-6'
                                                        : 'w-0 hover:w-4'
                                                }`}
                                            />
                                        </Link>
                                    )}
                                </div>
                            );
                        })}
                    </nav>

                    <AccesoNavbar />

                    {/* Mobile Menu Button */}
                    <button
                        onClick={toggleMobileMenu}
                        className={`rounded-xl p-2.5 transition-all duration-300 lg:hidden ${
                            isMobileMenuOpen
                                ? 'bg-red-50 text-red-600'
                                : 'text-gray-700 hover:bg-gray-100 hover:text-red-600'
                        }`}
                        aria-label={
                            isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'
                        }
                        aria-expanded={isMobileMenuOpen}
                    >
                        {isMobileMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-40 animate-in bg-black/30 backdrop-blur-sm duration-200 fade-in lg:hidden">
                    <div
                        className="fixed top-[76px] right-0 bottom-0 left-0 animate-in overflow-y-auto bg-white shadow-2xl duration-300 slide-in-from-right md:top-[88px]"
                        role="dialog"
                        aria-label="Menú de navegación móvil"
                    >
                        <div className="container mx-auto space-y-1 px-4 py-6">
                            {navegacion.map((item) => {
                                const hasDropdown = item.hijos.length > 0;
                                const isExpanded =
                                    expandedMobileItem === item.titulo;
                                const isActive = item.url
                                    ? isActiveRoute(item.url)
                                    : false;
                                const Icon = getIcon(item.titulo);

                                return (
                                    <div
                                        key={item.titulo}
                                        className="border-b border-gray-100/80 last:border-0"
                                    >
                                        {hasDropdown ? (
                                            <>
                                                <button
                                                    onClick={() =>
                                                        toggleMobileItem(
                                                            item.titulo,
                                                        )
                                                    }
                                                    className="flex w-full items-center justify-between py-4 text-left font-medium text-gray-800 transition-colors duration-200 hover:text-red-600"
                                                    aria-expanded={isExpanded}
                                                >
                                                    <span className="flex items-center gap-3 text-base">
                                                        {Icon && (
                                                            <Icon className="h-5 w-5 text-gray-400" />
                                                        )}
                                                        {item.titulo}
                                                    </span>
                                                    <ChevronDown
                                                        className={`h-4 w-4 transition-transform duration-300 ${
                                                            isExpanded
                                                                ? 'rotate-180 text-red-600'
                                                                : ''
                                                        }`}
                                                    />
                                                </button>
                                                {isExpanded && (
                                                    <div className="ml-4 animate-in space-y-0.5 border-l-2 border-red-600/30 pb-3 pl-4 duration-200 slide-in-from-top-2">
                                                        {item.hijos.map(
                                                            (subItem) => {
                                                                const isSubActive =
                                                                    isActiveRoute(
                                                                        subItem.url ||
                                                                            '#',
                                                                    );
                                                                const SubIcon =
                                                                    getIcon(
                                                                        subItem.titulo,
                                                                    );

                                                                return (
                                                                    <Link
                                                                        key={
                                                                            subItem.titulo
                                                                        }
                                                                        href={
                                                                            subItem.url ||
                                                                            '#'
                                                                        }
                                                                        className={`flex items-center gap-3 py-3 text-sm transition-all duration-200 ${
                                                                            isSubActive
                                                                                ? 'font-medium text-red-600'
                                                                                : 'text-gray-600 hover:text-red-600'
                                                                        }`}
                                                                        onClick={() =>
                                                                            setIsMobileMenuOpen(
                                                                                false,
                                                                            )
                                                                        }
                                                                    >
                                                                        {SubIcon && (
                                                                            <span
                                                                                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                                                                    isSubActive
                                                                                        ? 'bg-red-100 text-red-600'
                                                                                        : 'bg-gray-100 text-gray-400'
                                                                                }`}
                                                                            >
                                                                                <SubIcon className="h-4 w-4" />
                                                                            </span>
                                                                        )}
                                                                        <span>
                                                                            {
                                                                                subItem.titulo
                                                                            }
                                                                        </span>
                                                                        {isSubActive && (
                                                                            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-red-600" />
                                                                        )}
                                                                    </Link>
                                                                );
                                                            },
                                                        )}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <Link
                                                href={item.url || '#'}
                                                className={`flex items-center gap-3 py-4 text-base font-medium transition-colors duration-200 ${
                                                    isActive
                                                        ? 'text-red-600'
                                                        : 'text-gray-800 hover:text-red-600'
                                                }`}
                                                onClick={() =>
                                                    setIsMobileMenuOpen(false)
                                                }
                                            >
                                                {Icon && (
                                                    <Icon className="h-5 w-5 text-gray-400" />
                                                )}
                                                {item.titulo}
                                                {isActive && (
                                                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-red-600" />
                                                )}
                                            </Link>
                                        )}
                                    </div>
                                );
                            })}

                            <div className="pt-4">
                                <AccesoNavbar
                                    movil
                                    onNavegar={() => setIsMobileMenuOpen(false)}
                                />
                            </div>

                            {/* Footer del menú móvil */}
                            <div className="mt-4 border-t border-gray-100 pt-6">
                                <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                                    <span>© 2025 Cámara Española</span>
                                    <span className="h-4 w-px bg-gray-200" />
                                    <span className="font-medium text-red-600">
                                        Bolivia
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
