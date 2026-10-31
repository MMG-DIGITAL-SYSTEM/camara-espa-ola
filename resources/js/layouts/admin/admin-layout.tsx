import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminTopbar } from '@/components/admin/admin-topbar';
import type { Miga } from '@/components/admin/admin-topbar';
import { CommandPalette } from '@/components/admin/command-palette';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useAreaPanel } from '@/hooks/use-area-panel';
import { useFlashToast } from '@/hooks/use-flash-toast';

export default function AdminLayout({
    children,
    migas,
}: {
    children: ReactNode;
    migas?: Miga[];
}) {
    const { props } = usePage();
    const [paletaAbierta, setPaletaAbierta] = useState(false);

    useFlashToast();
    useAreaPanel();

    useEffect(() => {
        const alPulsar = (evento: KeyboardEvent) => {
            if (
                evento.key.toLowerCase() === 'k' &&
                (evento.metaKey || evento.ctrlKey)
            ) {
                evento.preventDefault();
                setPaletaAbierta((abierta) => !abierta);
            }
        };

        document.addEventListener('keydown', alPulsar);

        return () => document.removeEventListener('keydown', alPulsar);
    }, []);

    return (
        <SidebarProvider defaultOpen={props.sidebarOpen}>
            <AdminSidebar />

            <SidebarInset className="fondo-panel min-w-0">
                <AdminTopbar
                    migas={migas}
                    onBuscar={() => setPaletaAbierta(true)}
                />

                <main className="flex-1 p-4 md:p-6">{children}</main>
            </SidebarInset>

            <CommandPalette
                abierto={paletaAbierta}
                onAbiertoChange={setPaletaAbierta}
            />
        </SidebarProvider>
    );
}
