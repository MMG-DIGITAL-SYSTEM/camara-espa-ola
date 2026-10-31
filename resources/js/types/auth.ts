export type RolNombre = 'Administrador' | 'Editor' | 'Empresa' | 'Usuario';

export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    activo: boolean;
    rol: RolNombre | null;
    es_admin: boolean;
    accede_al_panel: boolean;
    accede_al_portal_de_empresas: boolean;
    /** Socio en cuyo nombre actúa una cuenta de empresa. */
    empresa: string | null;
    [key: string]: unknown;
};

export type Auth = {
    user: User | null;
};
