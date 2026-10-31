import type * as PdfJsDist from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';

/**
 * Convierte páginas de un PDF en imágenes para el libro de las fichas país.
 *
 * pdf.js pesa bastante: se importa bajo demanda, solo cuando alguien entra a
 * las fichas, y nunca en el servidor.
 */

type PdfJs = typeof PdfJsDist;

let cargaDePdfJs: Promise<PdfJs> | null = null;

function pdfJs(): Promise<PdfJs> {
    cargaDePdfJs ??= Promise.all([
        import('pdfjs-dist'),
        import('pdfjs-dist/build/pdf.worker.min.js?url'),
    ]).then(([biblioteca, worker]) => {
        biblioteca.GlobalWorkerOptions.workerSrc = worker.default;

        return biblioteca;
    });

    return cargaDePdfJs;
}

/** Un mismo PDF se abre una sola vez aunque lo pidan la portada y el lector. */
const documentos = new Map<string, Promise<PDFDocumentProxy>>();

export function abrirPdf(url: string): Promise<PDFDocumentProxy> {
    let documento = documentos.get(url);

    if (!documento) {
        documento = pdfJs().then(
            (biblioteca) => biblioteca.getDocument(url).promise,
        );
        // Si falla, se olvida: así un reintento vuelve a pedirlo.
        documento.catch(() => documentos.delete(url));
        documentos.set(url, documento);
    }

    return documento;
}

/**
 * Dibuja una página a un ancho dado (en píxeles CSS) y devuelve una URL de
 * imagen. Se multiplica por la densidad de la pantalla para que el texto se
 * vea nítido en pantallas retina.
 */
export async function imagenDePagina(
    documento: PDFDocumentProxy,
    numero: number,
    anchoCss: number,
): Promise<{ url: string; proporcion: number }> {
    const pagina = await documento.getPage(numero);
    const base = pagina.getViewport({ scale: 1 });
    const densidad = Math.min(window.devicePixelRatio || 1, 2);
    const vista = pagina.getViewport({
        scale: (anchoCss * densidad) / base.width,
    });

    const lienzo = document.createElement('canvas');
    lienzo.width = Math.floor(vista.width);
    lienzo.height = Math.floor(vista.height);

    const contexto = lienzo.getContext('2d');

    if (!contexto) {
        throw new Error('El navegador no permite dibujar en canvas.');
    }

    await pagina.render({ canvasContext: contexto, viewport: vista }).promise;

    const imagen = await new Promise<Blob>((resolver, rechazar) =>
        lienzo.toBlob(
            (blob) =>
                blob ? resolver(blob) : rechazar(new Error('Sin imagen')),
            'image/jpeg',
            0.9,
        ),
    );

    pagina.cleanup();

    return {
        url: URL.createObjectURL(imagen),
        proporcion: base.height / base.width,
    };
}
