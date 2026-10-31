<?php

namespace App\Support;

use DOMAttr;
use DOMDocument;
use DOMElement;
use DOMNode;
use Illuminate\Support\Str;

/**
 * Sanea el HTML que llega del editor de texto enriquecido.
 *
 * El contenido se pinta en el sitio público con `dangerouslySetInnerHTML`, así
 * que cualquiera con permiso de edición podría inyectar scripts. Se trabaja
 * con lista blanca: lo que no esté aquí, fuera.
 *
 * El conjunto permitido es justo lo que produce TipTap con StarterKit + Link.
 */
class HtmlSeguro
{
    /**
     * Etiquetas permitidas y, para cada una, sus atributos admitidos.
     *
     * @var array<string, array<int, string>>
     */
    private const PERMITIDAS = [
        'p' => [],
        'br' => [],
        'hr' => [],
        'strong' => [],
        'b' => [],
        'em' => [],
        'i' => [],
        'u' => [],
        's' => [],
        'code' => [],
        'pre' => [],
        'blockquote' => [],
        'h1' => [],
        'h2' => [],
        'h3' => [],
        'h4' => [],
        'ul' => [],
        'ol' => [],
        'li' => [],
        'a' => ['href', 'target', 'rel'],
    ];

    /**
     * Etiquetas cuyo contenido también se descarta, en vez de conservarse.
     *
     * @var array<int, string>
     */
    private const VACIAR = ['script', 'style', 'iframe', 'object', 'embed', 'form'];

    /**
     * Esquemas admitidos en un href. Se excluye `javascript:` y `data:`.
     *
     * @var array<int, string>
     */
    private const ESQUEMAS = ['http', 'https', 'mailto', 'tel'];

    public static function limpiar(?string $html): string
    {
        $html = trim((string) $html);

        if ($html === '') {
            return '';
        }

        $documento = new DOMDocument('1.0', 'UTF-8');

        $errores = libxml_use_internal_errors(true);

        // El prefijo XML fuerza UTF-8; sin él, DOMDocument asume ISO-8859-1 y
        // destroza los acentos.
        $documento->loadHTML(
            '<?xml encoding="UTF-8"?><div>'.$html.'</div>',
            LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD | LIBXML_NONET,
        );

        libxml_clear_errors();
        libxml_use_internal_errors($errores);

        $raiz = $documento->getElementsByTagName('div')->item(0);

        if (! $raiz instanceof DOMElement) {
            return '';
        }

        self::limpiarNodo($raiz);

        $salida = '';

        foreach (iterator_to_array($raiz->childNodes) as $hijo) {
            $salida .= $documento->saveHTML($hijo);
        }

        return trim($salida);
    }

    /**
     * Convierte el HTML del editor en texto plano para extractos y resúmenes.
     *
     * Se separan las etiquetas con un espacio antes de quitarlas: si no, dos
     * párrafos seguidos quedan pegados («...GISBERTEl pasado...»).
     */
    public static function textoPlano(?string $html, ?int $limite = null): string
    {
        $texto = html_entity_decode(
            strip_tags(str_replace('<', ' <', (string) $html)),
            ENT_QUOTES | ENT_HTML5,
            'UTF-8',
        );

        $texto = trim((string) preg_replace('/\s+/u', ' ', str_replace("\u{00A0}", ' ', $texto)));

        return $limite === null ? $texto : Str::limit($texto, $limite);
    }

    private static function limpiarNodo(DOMNode $nodo): void
    {
        // Se copia la lista: se va modificando el árbol mientras se recorre.
        foreach (iterator_to_array($nodo->childNodes) as $hijo) {
            if ($hijo instanceof DOMElement) {
                self::limpiarElemento($hijo);

                continue;
            }

            // Fuera comentarios, instrucciones de proceso y CDATA.
            if (! ($hijo->nodeType === XML_TEXT_NODE)) {
                $nodo->removeChild($hijo);
            }
        }
    }

    private static function limpiarElemento(DOMElement $elemento): void
    {
        $etiqueta = strtolower($elemento->nodeName);

        if (in_array($etiqueta, self::VACIAR, true)) {
            $elemento->parentNode?->removeChild($elemento);

            return;
        }

        if (! array_key_exists($etiqueta, self::PERMITIDAS)) {
            self::limpiarNodo($elemento);
            self::desenvolver($elemento);

            return;
        }

        foreach (iterator_to_array($elemento->attributes) as $atributo) {
            /** @var DOMAttr $atributo */
            if (! in_array(strtolower($atributo->name), self::PERMITIDAS[$etiqueta], true)) {
                $elemento->removeAttribute($atributo->name);
            }
        }

        if ($etiqueta === 'a') {
            self::asegurarEnlace($elemento);
        }

        self::limpiarNodo($elemento);
    }

    /**
     * Quita la etiqueta pero conserva lo que contenía.
     */
    private static function desenvolver(DOMElement $elemento): void
    {
        $padre = $elemento->parentNode;

        if (! $padre) {
            return;
        }

        while ($elemento->firstChild) {
            $padre->insertBefore($elemento->firstChild, $elemento);
        }

        $padre->removeChild($elemento);
    }

    private static function asegurarEnlace(DOMElement $enlace): void
    {
        $href = trim($enlace->getAttribute('href'));

        if ($href === '' || ! self::esHrefSeguro($href)) {
            $enlace->removeAttribute('href');
            $enlace->removeAttribute('target');
            $enlace->removeAttribute('rel');

            return;
        }

        $enlace->setAttribute('href', $href);

        // Un enlace que abre pestaña sin `noopener` deja que el destino
        // manipule la ventana de origen.
        if ($enlace->getAttribute('target') === '_blank') {
            $enlace->setAttribute('rel', 'noopener noreferrer');
        } else {
            $enlace->removeAttribute('target');
            $enlace->removeAttribute('rel');
        }
    }

    private static function esHrefSeguro(string $href): bool
    {
        // Enlaces internos y anclas.
        if (str_starts_with($href, '/') || str_starts_with($href, '#')) {
            return true;
        }

        $esquema = strtolower((string) parse_url($href, PHP_URL_SCHEME));

        return in_array($esquema, self::ESQUEMAS, true);
    }
}
