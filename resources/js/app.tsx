// resources/js/app.tsx
import { createInertiaApp } from '@inertiajs/react';
import type { ComponentType } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AdminLayout from '@/layouts/admin/admin-layout';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

const appName = import.meta.env.VITE_APP_NAME || 'Cámara Española';

const pages = import.meta.glob<{ default: ComponentType }>('./pages/**/*.tsx');

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => {
        const page = pages[`./pages/${name}.tsx`];

        if (!page) {
            throw new Error(`No se encontró la página de Inertia: ${name}`);
        }

        return page().then((modulo) => modulo.default);
    },
    layout: (name) => {
        // Las vistas públicas envuelven su propio PublicLayout.
        if (name.startsWith('Public/')) {
            return null;
        }

        // El editor de páginas ocupa la pantalla entera con su propia
        // cabecera: no encaja dentro del marco del panel.
        if (name === 'Admin/Paginas/Editor') {
            return null;
        }

        // El portal de empresas reutiliza el marco del panel; la barra
        // lateral elige qué secciones mostrar según el rol.
        if (name.startsWith('Admin/') || name.startsWith('Empresa/')) {
            return AdminLayout;
        }

        if (name.startsWith('auth/')) {
            return AuthLayout;
        }

        if (name.startsWith('settings/')) {
            return [AppLayout, SettingsLayout];
        }

        return AppLayout;
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#dc2626',
    },
});

initializeTheme();
