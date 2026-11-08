/**
 * Logotipo oficial con el escudo, para fondos claros. Vive en «public/images»
 * y se usa cuando en Ajustes del sitio no hay un logotipo subido.
 */
const LOGO_OSCURO = '/images/logo-camara.svg';

/** Dirección del logotipo a partir del valor guardado en Ajustes del sitio. */
export function urlDelLogo(valor?: string | null): string {
    const logo = valor?.trim();

    if (!logo) {
        return LOGO_OSCURO;
    }

    // Lo subido a la biblioteca se guarda como ruta relativa a «storage».
    return /^(https?:)?\/\//.test(logo) || logo.startsWith('/')
        ? logo
        : `/storage/${logo}`;
}
