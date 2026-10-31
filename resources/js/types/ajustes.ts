/**
 * Ajustes del sitio, compartidos en todas las peticiones.
 *
 * Las claves las define App\Http\Controllers\Admin\AjusteController; un test
 * comprueba que estas dos listas no se separen.
 */
export type ClaveDeAjuste =
    | 'sitio_nombre'
    | 'sitio_logo'
    | 'seo_descripcion'
    | 'oficina_sc_titulo'
    | 'oficina_sc_direccion'
    | 'oficina_sc_telefono'
    | 'oficina_lp_titulo'
    | 'oficina_lp_direccion'
    | 'oficina_lp_telefono'
    | 'contacto_correo'
    | 'red_facebook'
    | 'red_linkedin'
    | 'red_instagram'
    | 'red_twitter';

export type AjustesDelSitio = Partial<Record<ClaveDeAjuste, string | null>>;
