import {
    AlignLeft,
    Heading2,
    Image,
    ListChecks,
    Minus,
    MousePointerClick,
    MoveVertical,
    Quote,
    Sparkles,
    SquareStack,
    TrendingUp,
    Youtube,
} from 'lucide-react';
import {
    ElementoBoton,
    ElementoCaracteristica,
    ElementoCifra,
    ElementoCita,
    ElementoEspacio,
    ElementoImagen,
    ElementoLista,
    ElementoParrafo,
    ElementoSeparador,
    ElementoTarjeta,
    ElementoTitulo,
    ElementoVideo,
} from './componentes/elementos';
import type { Campo, DefinicionElemento } from './tipos';

const CAMPO_ALINEACION: Campo = {
    tipo: 'select',
    clave: 'alineacion',
    etiqueta: 'Alineación',
    opciones: [
        { valor: 'izquierda', etiqueta: 'Izquierda' },
        { valor: 'centro', etiqueta: 'Centro' },
        { valor: 'derecha', etiqueta: 'Derecha' },
    ],
};

/**
 * Catálogo de elementos del lienzo.
 *
 * Mismo contrato que el registro de bloques: un componente más una entrada
 * aquí, y el editor sabe pintarlo y ofrecer sus propiedades sin más cambios.
 *
 * Las claves deben coincidir con App\Bloques\RegistroDeElementos
 * (ElementoTest lo verifica).
 */
export const ELEMENTOS: DefinicionElemento[] = [
    {
        clave: 'titulo',
        nombre: 'Título',
        descripcion: 'Un encabezado suelto.',
        icono: Heading2,
        categoria: 'Texto',
        componente: ElementoTitulo as DefinicionElemento['componente'],
        defaults: { texto: 'Un título', nivel: 'h2', alineacion: 'izquierda' },
        campos: [
            { tipo: 'texto', clave: 'texto', etiqueta: 'Texto' },
            {
                tipo: 'select',
                clave: 'nivel',
                etiqueta: 'Tamaño',
                opciones: [
                    { valor: 'h2', etiqueta: 'Grande' },
                    { valor: 'h3', etiqueta: 'Mediano' },
                    { valor: 'h4', etiqueta: 'Pequeño' },
                ],
            },
            CAMPO_ALINEACION,
        ],
    },
    {
        clave: 'parrafo',
        nombre: 'Párrafo',
        descripcion: 'Texto con negritas, enlaces y listas.',
        icono: AlignLeft,
        categoria: 'Texto',
        componente: ElementoParrafo as DefinicionElemento['componente'],
        defaults: {
            contenido: '<p>Escribe aquí.</p>',
            alineacion: 'izquierda',
        },
        campos: [
            { tipo: 'richtext', clave: 'contenido', etiqueta: 'Contenido' },
            CAMPO_ALINEACION,
        ],
    },
    {
        clave: 'lista',
        nombre: 'Lista de puntos',
        descripcion: 'Puntos con una marca de verificación.',
        icono: ListChecks,
        categoria: 'Texto',
        componente: ElementoLista as DefinicionElemento['componente'],
        defaults: {
            puntos: [{ texto: 'Primer punto' }, { texto: 'Segundo punto' }],
        },
        campos: [
            {
                tipo: 'repetidor',
                clave: 'puntos',
                etiqueta: 'Puntos',
                titulo: 'texto',
                campos: [{ tipo: 'texto', clave: 'texto', etiqueta: 'Texto' }],
            },
        ],
    },
    {
        clave: 'cita',
        nombre: 'Cita',
        descripcion: 'Un testimonio destacado con su autor.',
        icono: Quote,
        categoria: 'Texto',
        componente: ElementoCita as DefinicionElemento['componente'],
        defaults: { texto: 'Una frase que merece destacarse.' },
        campos: [
            {
                tipo: 'textarea',
                clave: 'texto',
                etiqueta: 'Cita',
                filas: 3,
            },
            { tipo: 'texto', clave: 'autor', etiqueta: 'Autor' },
            { tipo: 'texto', clave: 'cargo', etiqueta: 'Cargo o empresa' },
        ],
    },
    {
        clave: 'imagen',
        nombre: 'Imagen',
        descripcion: 'Una imagen de la biblioteca o externa.',
        icono: Image,
        categoria: 'Medios',
        componente: ElementoImagen as DefinicionElemento['componente'],
        defaults: { proporcion: 'original', redondeada: true },
        campos: [
            { tipo: 'imagen', clave: 'imagen', etiqueta: 'Imagen' },
            {
                tipo: 'texto',
                clave: 'alt',
                etiqueta: 'Texto alternativo',
                placeholder: 'Qué se ve en la imagen',
            },
            {
                tipo: 'select',
                clave: 'proporcion',
                etiqueta: 'Proporción',
                opciones: [
                    { valor: 'original', etiqueta: 'La original' },
                    { valor: 'panoramica', etiqueta: 'Panorámica (16:9)' },
                    { valor: 'clasica', etiqueta: 'Clásica (4:3)' },
                    { valor: 'cuadrada', etiqueta: 'Cuadrada' },
                ],
            },
            {
                tipo: 'switch',
                clave: 'redondeada',
                etiqueta: 'Esquinas redondeadas',
            },
        ],
    },
    {
        clave: 'video',
        nombre: 'Vídeo',
        descripcion: 'Incrusta un vídeo de YouTube o Vimeo.',
        icono: Youtube,
        categoria: 'Medios',
        componente: ElementoVideo as DefinicionElemento['componente'],
        defaults: {},
        campos: [
            {
                tipo: 'enlace',
                clave: 'url',
                etiqueta: 'Dirección del vídeo',
                placeholder: 'https://youtube.com/watch?v=…',
            },
        ],
    },
    {
        clave: 'tarjeta',
        nombre: 'Tarjeta',
        descripcion: 'Icono, título y texto en una caja con borde.',
        icono: SquareStack,
        categoria: 'Tarjetas',
        componente: ElementoTarjeta as DefinicionElemento['componente'],
        defaults: {
            icono: 'award',
            titulo: 'Título de la tarjeta',
            texto: 'Describe brevemente de qué se trata.',
        },
        anchoPorDefecto: 'tercio',
        campos: [
            { tipo: 'icono', clave: 'icono', etiqueta: 'Icono' },
            { tipo: 'texto', clave: 'titulo', etiqueta: 'Título' },
            {
                tipo: 'textarea',
                clave: 'texto',
                etiqueta: 'Texto',
                filas: 3,
            },
            {
                tipo: 'texto',
                clave: 'enlace_texto',
                etiqueta: 'Texto del enlace',
                placeholder: 'Ver más',
            },
            { tipo: 'enlace', clave: 'enlace', etiqueta: 'Enlace' },
        ],
    },
    {
        clave: 'caracteristica',
        nombre: 'Característica',
        descripcion: 'Icono al lado del texto, sin caja.',
        icono: Sparkles,
        categoria: 'Tarjetas',
        componente: ElementoCaracteristica as DefinicionElemento['componente'],
        defaults: {
            icono: 'shield',
            titulo: 'Una ventaja',
            texto: 'Explica en una línea por qué importa.',
        },
        anchoPorDefecto: 'mitad',
        campos: [
            { tipo: 'icono', clave: 'icono', etiqueta: 'Icono' },
            { tipo: 'texto', clave: 'titulo', etiqueta: 'Título' },
            {
                tipo: 'textarea',
                clave: 'texto',
                etiqueta: 'Texto',
                filas: 2,
            },
        ],
    },
    {
        clave: 'cifra',
        nombre: 'Cifra',
        descripcion: 'Un número grande con su etiqueta.',
        icono: TrendingUp,
        categoria: 'Tarjetas',
        componente: ElementoCifra as DefinicionElemento['componente'],
        defaults: { valor: '100+', etiqueta: 'Empresas asociadas' },
        anchoPorDefecto: 'cuarto',
        campos: [
            { tipo: 'texto', clave: 'valor', etiqueta: 'Cifra' },
            { tipo: 'texto', clave: 'etiqueta', etiqueta: 'Etiqueta' },
        ],
    },
    {
        clave: 'boton',
        nombre: 'Botón',
        descripcion: 'Una llamada a la acción.',
        icono: MousePointerClick,
        categoria: 'Tarjetas',
        componente: ElementoBoton as DefinicionElemento['componente'],
        defaults: {
            texto: 'Saber más',
            enlace: '/contacto',
            estilo: 'solido',
            alineacion: 'izquierda',
        },
        campos: [
            { tipo: 'texto', clave: 'texto', etiqueta: 'Texto' },
            { tipo: 'enlace', clave: 'enlace', etiqueta: 'Enlace' },
            {
                tipo: 'select',
                clave: 'estilo',
                etiqueta: 'Estilo',
                opciones: [
                    { valor: 'solido', etiqueta: 'Relleno' },
                    { valor: 'contorno', etiqueta: 'Con borde' },
                    { valor: 'enlace', etiqueta: 'Solo texto' },
                ],
            },
            CAMPO_ALINEACION,
        ],
    },
    {
        clave: 'separador',
        nombre: 'Separador',
        descripcion: 'Una línea que divide el contenido.',
        icono: Minus,
        categoria: 'Separación',
        componente: ElementoSeparador as DefinicionElemento['componente'],
        defaults: { estilo: 'linea' },
        campos: [
            {
                tipo: 'select',
                clave: 'estilo',
                etiqueta: 'Estilo',
                opciones: [
                    { valor: 'linea', etiqueta: 'Línea continua' },
                    { valor: 'punteado', etiqueta: 'Punteada' },
                    { valor: 'invisible', etiqueta: 'Invisible' },
                ],
            },
        ],
    },
    {
        clave: 'espacio',
        nombre: 'Espacio',
        descripcion: 'Aire entre dos elementos.',
        icono: MoveVertical,
        categoria: 'Separación',
        componente: ElementoEspacio as DefinicionElemento['componente'],
        defaults: { altura: 'mediano' },
        campos: [
            {
                tipo: 'select',
                clave: 'altura',
                etiqueta: 'Altura',
                opciones: [
                    { valor: 'pequeno', etiqueta: 'Pequeño' },
                    { valor: 'mediano', etiqueta: 'Mediano' },
                    { valor: 'grande', etiqueta: 'Grande' },
                ],
            },
        ],
    },
];

export function elemento(clave: string): DefinicionElemento | undefined {
    return ELEMENTOS.find((definicion) => definicion.clave === clave);
}

/**
 * Agrupa para el catálogo, conservando el orden de declaración.
 */
export function elementosPorCategoria(): [string, DefinicionElemento[]][] {
    const grupos = new Map<string, DefinicionElemento[]>();

    for (const definicion of ELEMENTOS) {
        grupos.set(definicion.categoria, [
            ...(grupos.get(definicion.categoria) ?? []),
            definicion,
        ]);
    }

    return [...grupos.entries()];
}
