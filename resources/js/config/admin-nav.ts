import {
    BriefcaseBusiness,
    Building2,
    CalendarDays,
    FileStack,
    FileText,
    Globe2,
    Handshake,
    Image,
    Inbox,
    Menu,
    LayoutGrid,
    Mail,
    Newspaper,
    Network,
    ScrollText,
    Settings,
    ShieldCheck,
    Sparkles,
    UserRound,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { dashboard } from '@/routes/admin';
import { index as actividades } from '@/routes/admin/actividades';
import { edit as ajustes } from '@/routes/admin/ajustes';
import { index as bolsaTrabajo } from '@/routes/admin/bolsa-trabajo';
import { index as directivos } from '@/routes/admin/directivos';
import { index as fichasPais } from '@/routes/admin/fichas-pais';
import { index as medios } from '@/routes/admin/medios';
import { index as menu } from '@/routes/admin/menu';
import { index as noticias } from '@/routes/admin/noticias';
import { index as paginas } from '@/routes/admin/paginas';
import { index as redCamaras } from '@/routes/admin/red-camaras';
import { index as roles } from '@/routes/admin/roles';
import { index as servicios } from '@/routes/admin/servicios';
import { index as socios } from '@/routes/admin/socios';
import { index as solicitudes } from '@/routes/admin/solicitudes';
import { index as usuarios } from '@/routes/admin/usuarios';
import { index as misOfertas } from '@/routes/empresa/ofertas';
import type { User } from '@/types';

export type AdminNavItem = {
    titulo: string;
    /** Ausente mientras la sección aún no existe. */
    href?: string;
    icono: LucideIcon;
    /** Solo visible para el rol Administrador. */
    soloAdmin?: boolean;
    /** Palabras extra para que la paleta de comandos la encuentre. */
    busqueda?: string;
};

export type TonoNav = 'rosa' | 'cielo' | 'esmeralda' | 'ambar' | 'violeta';

export type AdminNavGrupo = {
    titulo: string;
    /** Color de los iconos del grupo, para orientarse de un vistazo. */
    tono: TonoNav;
    items: AdminNavItem[];
};

/**
 * Mapa completo del panel. Las secciones sin `href` se muestran atenuadas
 * con la etiqueta «Pronto»: así el equipo ve hacia dónde va el panel sin
 * tropezar con enlaces rotos.
 */
export const adminNav: AdminNavGrupo[] = [
    {
        titulo: 'General',
        tono: 'rosa',
        items: [
            {
                titulo: 'Panel',
                href: dashboard().url,
                icono: LayoutGrid,
                busqueda: 'inicio resumen métricas',
            },
        ],
    },
    {
        titulo: 'Contenido',
        tono: 'cielo',
        items: [
            {
                titulo: 'Páginas',
                href: paginas().url,
                icono: FileStack,
                busqueda: 'constructor bloques secciones editor',
            },
            {
                titulo: 'Noticias',
                href: noticias().url,
                icono: Newspaper,
                busqueda: 'prensa',
            },
            {
                titulo: 'Actividades',
                href: actividades().url,
                icono: CalendarDays,
                busqueda: 'eventos agenda',
            },
            { titulo: 'Servicios', href: servicios().url, icono: Sparkles },
            {
                titulo: 'Menú del sitio',
                href: menu().url,
                icono: Menu,
                busqueda: 'navegación barra enlaces pie',
            },
            {
                titulo: 'Contenido institucional',
                icono: ScrollText,
                busqueda: 'historia misión visión estatutos',
            },
            {
                titulo: 'Directivos',
                href: directivos().url,
                icono: UserRound,
                busqueda: 'directorio',
            },
        ],
    },
    {
        titulo: 'Comunidad',
        tono: 'esmeralda',
        items: [
            {
                titulo: 'Socios',
                href: socios().url,
                icono: Building2,
                busqueda: 'afiliados empresas',
            },
            {
                titulo: 'Bolsa de trabajo',
                href: bolsaTrabajo().url,
                icono: BriefcaseBusiness,
                busqueda: 'empleo ofertas vacantes trabajo',
            },
            {
                titulo: 'Solicitudes de afiliación',
                href: solicitudes().url,
                icono: Inbox,
                busqueda: 'altas pendientes',
            },
            { titulo: 'Mensajes de contacto', icono: Mail },
            {
                titulo: 'Suscriptores',
                icono: Users,
                busqueda: 'boletín newsletter',
            },
        ],
    },
    {
        titulo: 'Recursos',
        tono: 'ambar',
        items: [
            {
                titulo: 'Fichas país',
                href: fichasPais().url,
                icono: Globe2,
                busqueda: 'mercados países pdf',
            },
            {
                titulo: 'Red de cámaras',
                href: redCamaras().url,
                icono: Network,
                busqueda: 'cámaras de comercio internacionales',
            },
            { titulo: 'Patrocinadores', icono: Handshake },
            {
                titulo: 'Biblioteca de medios',
                href: medios().url,
                icono: Image,
                busqueda: 'imágenes archivos subidas',
            },
        ],
    },
    {
        titulo: 'Sistema',
        tono: 'violeta',
        items: [
            {
                titulo: 'Usuarios',
                href: usuarios().url,
                icono: Users,
                soloAdmin: true,
            },
            {
                titulo: 'Roles',
                href: roles().url,
                icono: ShieldCheck,
                soloAdmin: true,
                busqueda: 'permisos accesos',
            },
            {
                titulo: 'Auditoría',
                icono: FileText,
                soloAdmin: true,
                busqueda: 'registro cambios historial',
            },
            {
                titulo: 'Ajustes del sitio',
                href: ajustes().url,
                icono: Settings,
                soloAdmin: true,
                busqueda: 'configuración logo redes seo',
            },
        ],
    },
];

/**
 * Portal de empresas: mismo marco que el panel, pero solo con lo suyo.
 */
export const empresaNav: AdminNavGrupo[] = [
    {
        titulo: 'Bolsa de trabajo',
        tono: 'esmeralda',
        items: [
            {
                titulo: 'Mis ofertas',
                href: misOfertas().url,
                icono: BriefcaseBusiness,
                busqueda: 'empleo vacantes trabajo',
            },
        ],
    },
];

/**
 * Navegación que corresponde al usuario: el panel completo o el portal.
 */
export function navegacionDe(usuario: User | null): AdminNavGrupo[] {
    return usuario?.accede_al_panel ? adminNav : empresaNav;
}
