import { usePage } from '@inertiajs/react';
import { ChevronsUpDown } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * Tarjeta de usuario al pie de la barra lateral. No reutiliza `NavUser` porque
 * aquí las iniciales y el rol se pintan sobre el rojo de marca.
 */
export function AdminUserMenu() {
    const { auth } = usePage().props;
    const { state } = useSidebar();
    const isMobile = useIsMobile();
    const getInitials = useInitials();
    const usuario = auth.user;

    if (!usuario) {
        return null;
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            data-test="sidebar-menu-button"
                            className="text-panel-foreground hover:bg-panel-hover data-[state=open]:bg-panel-hover"
                        >
                            <span className="flex size-8 shrink-0 items-center justify-center degradado-marca rounded-lg text-xs font-semibold text-white ring-1 ring-white/20">
                                {getInitials(usuario.name)}
                            </span>
                            <span className="grid flex-1 text-left leading-tight">
                                <span className="truncate text-sm font-medium">
                                    {usuario.name}
                                </span>
                                <span className="truncate text-xs text-panel-muted">
                                    {usuario.rol ?? 'Sin rol'}
                                </span>
                            </span>
                            <ChevronsUpDown className="ml-auto size-4 text-panel-muted" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        align="end"
                        side={
                            isMobile
                                ? 'bottom'
                                : state === 'collapsed'
                                  ? 'right'
                                  : 'top'
                        }
                    >
                        <UserMenuContent user={usuario} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
