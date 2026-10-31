import { Link, usePage } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { navegacionDe } from '@/config/admin-nav';
import type { AdminNavItem, TonoNav } from '@/config/admin-nav';
import { cn } from '@/lib/utils';
import { AdminUserMenu } from './admin-user-menu';

/** Icono de cada grupo en su color; sobre lo activo, blanco. */
const TONOS: Record<TonoNav, string> = {
    rosa: 'text-rose-300',
    cielo: 'text-sky-300',
    esmeralda: 'text-emerald-300',
    ambar: 'text-amber-300',
    violeta: 'text-violet-300',
};

function EscudoCamara() {
    return (
        <span className="degradado-marca flex size-9 shrink-0 items-center justify-center rounded-xl shadow-lg ring-1 shadow-marca/30 ring-white/20">
            <span className="text-sm font-bold tracking-tight text-white">
                CE
            </span>
        </span>
    );
}

function ItemNavegacion({
    item,
    activo,
    tono,
    onNavegar,
}: {
    item: AdminNavItem;
    activo: boolean;
    tono: TonoNav;
    onNavegar: () => void;
}) {
    const Icono = item.icono;

    // Secciones aún no construidas: visibles pero inertes, para que el equipo
    // vea el mapa completo del panel sin toparse con enlaces rotos.
    if (!item.href) {
        return (
            <SidebarMenuItem>
                <SidebarMenuButton
                    disabled
                    tooltip={`${item.titulo} — próximamente`}
                    className="cursor-default text-panel-muted/60 opacity-100 hover:bg-transparent hover:text-panel-muted/60"
                >
                    <Icono />
                    <span className="truncate">{item.titulo}</span>
                    <span className="ml-auto rounded-full border border-panel-border/60 px-1.5 py-px text-[10px] font-medium tracking-wide text-panel-muted/70 group-data-[collapsible=icon]:hidden">
                        Pronto
                    </span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        );
    }

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                asChild
                isActive={activo}
                tooltip={item.titulo}
                className={cn(
                    'text-panel-foreground/85 transition-all hover:translate-x-0.5 hover:bg-panel-hover hover:text-panel-foreground',
                    activo &&
                        'degradado-marca font-semibold text-panel-activo-foreground shadow-md shadow-marca/30 hover:translate-x-0 hover:text-panel-activo-foreground data-[active=true]:bg-transparent data-[active=true]:text-panel-activo-foreground',
                )}
            >
                <Link href={item.href} onClick={onNavegar} prefetch>
                    <Icono className={activo ? 'text-white' : TONOS[tono]} />
                    <span className="truncate">{item.titulo}</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

export function AdminSidebar() {
    const { url, props } = usePage();
    const { setOpenMobile } = useSidebar();
    const usuario = props.auth.user;
    const esAdmin = usuario?.es_admin ?? false;
    const enElPanel = usuario?.accede_al_panel ?? false;
    const navegacion = navegacionDe(usuario);

    const estaActivo = (href: string) =>
        url === href || url.startsWith(`${href}/`);

    return (
        <Sidebar
            collapsible="icon"
            data-panel-lateral=""
            className="border-r-0 [&_[data-sidebar=sidebar]]:bg-linear-to-b [&_[data-sidebar=sidebar]]:from-panel-alto [&_[data-sidebar=sidebar]]:to-panel"
        >
            <SidebarHeader className="gap-0">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="hover:bg-panel-hover active:bg-panel-hover"
                        >
                            <Link
                                href={
                                    enElPanel
                                        ? '/admin'
                                        : (navegacion[0]?.items[0]?.href ?? '/')
                                }
                                prefetch
                            >
                                <EscudoCamara />
                                <span className="grid flex-1 text-left leading-tight">
                                    <span className="truncate text-sm font-semibold text-panel-foreground">
                                        Cámara Española
                                    </span>
                                    <span className="truncate text-[11px] tracking-wide text-panel-muted uppercase">
                                        {enElPanel
                                            ? 'Administración'
                                            : (usuario?.empresa ??
                                              'Portal de empresas')}
                                    </span>
                                </span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="gap-0 pt-2">
                {navegacion.map((grupo) => {
                    const items = grupo.items.filter(
                        (item) => !item.soloAdmin || esAdmin,
                    );

                    if (items.length === 0) {
                        return null;
                    }

                    return (
                        <SidebarGroup key={grupo.titulo}>
                            <SidebarGroupLabel className="text-[10px] font-semibold tracking-[0.12em] text-panel-muted/80 uppercase">
                                {grupo.titulo}
                            </SidebarGroupLabel>
                            <SidebarMenu>
                                {items.map((item) => (
                                    <ItemNavegacion
                                        key={item.titulo}
                                        item={item}
                                        tono={grupo.tono}
                                        activo={
                                            item.href
                                                ? estaActivo(item.href)
                                                : false
                                        }
                                        onNavegar={() => setOpenMobile(false)}
                                    />
                                ))}
                            </SidebarMenu>
                        </SidebarGroup>
                    );
                })}
            </SidebarContent>

            <SidebarFooter className="gap-1 border-t border-panel-border/40">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            tooltip="Abrir el sitio público"
                            className="text-panel-foreground/75 hover:bg-panel-hover hover:text-panel-foreground"
                        >
                            <a href="/" target="_blank" rel="noreferrer">
                                <ExternalLink />
                                <span>Ver el sitio</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <AdminUserMenu />
            </SidebarFooter>
        </Sidebar>
    );
}
