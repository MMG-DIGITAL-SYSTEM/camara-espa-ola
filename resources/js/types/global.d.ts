import type { AjustesDelSitio } from '@/types/ajustes';
import type { Auth } from '@/types/auth';
import type { MenusDelSitio } from '@/types/menu';
import type { FlashToast } from '@/types/ui';

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            /** La página va incrustada en el editor visual. */
            soloContenido: boolean;
            menus: MenusDelSitio;
            ajustes: AjustesDelSitio;
            [key: string]: unknown;
        };
        flashDataType: {
            toast?: FlashToast;
        };
    }
}
