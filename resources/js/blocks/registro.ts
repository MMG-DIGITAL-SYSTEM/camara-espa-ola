import {
    Blocks,
    Building2,
    CalendarDays,
    FileDown,
    Globe2,
    Hash,
    Heading1,
    Landmark,
    Image,
    Images,
    Layers,
    MapPin,
    Megaphone,
    MessageCircleQuestion,
    Milestone,
    Minus,
    Network,
    Newspaper,
    PanelTop,
    Sparkles,
    Type,
    Users,
    Youtube,
} from 'lucide-react';
import {
    BloqueAcordeon,
    BloqueCifras,
    BloqueDescargas,
    BloqueGaleria,
    BloqueMapa,
    BloqueTimeline,
    BloqueVideo,
} from './componentes/contenido';
import {
    BloqueActividadesProximas,
    BloqueDirectorio,
    BloqueFichasPais,
    BloqueNoticiasRecientes,
    BloqueRedCamaras,
    BloqueServicios,
    BloquePresentacion,
    BloqueSocios,
} from './componentes/dinamicos';
import {
    BloqueCta,
    BloqueEncabezado,
    BloqueHero,
    BloqueSeparador,
    BloqueTexto,
    BloqueTextoImagen,
} from './componentes/estructura';
import { BloqueLienzo } from './componentes/lienzo';
import { BloquePortadaModulo } from './componentes/portada';
import type { DefinicionBloque } from './tipos';

const CAMPO_COLUMNAS = {
    tipo: 'select' as const,
    clave: 'columnas',
    etiqueta: 'Columnas',
    opciones: [
        { valor: '2', etiqueta: 'Dos' },
        { valor: '3', etiqueta: 'Tres' },
        { valor: '4', etiqueta: 'Cuatro' },
    ],
};

/**
 * Catálogo de bloques.
 *
 * Añadir uno nuevo es un solo archivo de componente más una entrada aquí: el
 * panel de propiedades del editor se genera solo a partir de `campos`.
 *
 * Las claves deben coincidir con App\Bloques\RegistroDeBloques (hay un test
 * que lo verifica).
 */
export const BLOQUES: DefinicionBloque[] = [
    {
        clave: 'lienzo',
        nombre: 'Lienzo libre',
        descripcion:
            'Una franja en blanco: coloca dentro los elementos que quieras.',
        icono: Blocks,
        categoria: 'Estructura',
        componente: BloqueLienzo as DefinicionBloque['componente'],
        admiteElementos: true,
        defaults: { elementos: [], separacion: 'normal' },
        campos: [
            {
                tipo: 'select',
                clave: 'separacion',
                etiqueta: 'Separación entre elementos',
                opciones: [
                    { valor: 'compacta', etiqueta: 'Compacta' },
                    { valor: 'normal', etiqueta: 'Normal' },
                    { valor: 'amplia', etiqueta: 'Amplia' },
                ],
            },
        ],
    },
    {
        clave: 'hero',
        nombre: 'Portada',
        descripcion: 'Título grande con imagen de fondo y botón.',
        icono: Layers,
        categoria: 'Estructura',
        componente: BloqueHero as DefinicionBloque['componente'],
        defaults: {
            titulo: 'Cámara Oficial Española en Bolivia',
            subtitulo: 'Conectando oportunidades entre España y Bolivia',
            boton_texto: 'Conócenos',
            boton_enlace: '/la-camara',
        },
        estilosPorDefecto: { fondo: 'oscuro', espaciado: 'amplio' },
        campos: [
            {
                tipo: 'texto',
                clave: 'antetitulo',
                etiqueta: 'Antetítulo',
                placeholder: 'Texto pequeño sobre el título (opcional)',
            },
            { tipo: 'texto', clave: 'titulo', etiqueta: 'Título' },
            {
                tipo: 'texto',
                clave: 'titulo_destacado',
                etiqueta: 'Título, línea en rojo',
                placeholder: 'Solo en el hero centrado con imagen',
            },
            {
                tipo: 'textarea',
                clave: 'subtitulo',
                etiqueta: 'Subtítulo',
                filas: 2,
            },
            { tipo: 'imagen', clave: 'imagen', etiqueta: 'Imagen de fondo' },
            {
                tipo: 'select',
                clave: 'alineacion',
                etiqueta: 'Alineación',
                opciones: [
                    { valor: 'izquierda', etiqueta: 'A la izquierda' },
                    {
                        valor: 'centro',
                        etiqueta: 'Centrado, a pantalla completa',
                    },
                ],
            },
            {
                tipo: 'texto',
                clave: 'boton_texto',
                etiqueta: 'Texto del botón',
            },
            {
                tipo: 'enlace',
                clave: 'boton_enlace',
                etiqueta: 'Enlace del botón',
            },
        ],
    },
    {
        clave: 'portada-modulo',
        nombre: 'Portada de módulo',
        descripcion:
            'Cabecera oscura con título en rojo, como la de Actividades o Socios.',
        icono: PanelTop,
        categoria: 'Estructura',
        componente: BloquePortadaModulo as DefinicionBloque['componente'],
        defaults: {
            antetitulo: 'Sección',
            titulo: 'Título de la',
            titulo_destacado: 'página',
            alineacion: 'izquierda',
            decoracion: 'particulas',
        },
        campos: [
            { tipo: 'texto', clave: 'antetitulo', etiqueta: 'Antetítulo' },
            { tipo: 'texto', clave: 'titulo', etiqueta: 'Título, línea blanca' },
            {
                tipo: 'texto',
                clave: 'titulo_destacado',
                etiqueta: 'Título, línea en rojo',
            },
            {
                tipo: 'textarea',
                clave: 'titulo_cierre',
                etiqueta: 'Título, líneas finales',
                filas: 2,
                placeholder: 'Opcional. Una línea por renglón',
            },
            {
                tipo: 'textarea',
                clave: 'descripcion',
                etiqueta: 'Descripción',
                filas: 3,
            },
            {
                tipo: 'select',
                clave: 'tema',
                etiqueta: 'Estilo',
                opciones: [
                    { valor: 'oscuro', etiqueta: 'Oscuro, con efectos' },
                    { valor: 'claro', etiqueta: 'Claro, sobre fondo blanco' },
                ],
            },
            {
                tipo: 'select',
                clave: 'alineacion',
                etiqueta: 'Alineación',
                opciones: [
                    { valor: 'izquierda', etiqueta: 'A la izquierda' },
                    { valor: 'centro', etiqueta: 'Centrado' },
                ],
            },
            {
                tipo: 'select',
                clave: 'tamano_titulo',
                etiqueta: 'Tamaño del título',
                opciones: [
                    { valor: 'grande', etiqueta: 'Grande' },
                    { valor: 'mediano', etiqueta: 'Mediano' },
                    { valor: 'enorme', etiqueta: 'Enorme' },
                ],
            },
            {
                tipo: 'select',
                clave: 'espaciado',
                etiqueta: 'Altura de la franja',
                opciones: [
                    { valor: 'normal', etiqueta: 'Normal' },
                    { valor: 'compacto', etiqueta: 'Compacta' },
                    { valor: 'amplio', etiqueta: 'Amplia' },
                ],
            },
            {
                tipo: 'color',
                clave: 'color_antetitulo',
                etiqueta: 'Color del antetítulo',
            },
            {
                tipo: 'color',
                clave: 'color_titulo',
                etiqueta: 'Color de la línea blanca',
            },
            {
                tipo: 'color',
                clave: 'color_destacado',
                etiqueta: 'Color de la línea en rojo',
            },
            {
                tipo: 'color',
                clave: 'color_cierre',
                etiqueta: 'Color de las líneas finales',
            },
            {
                tipo: 'color',
                clave: 'color_descripcion',
                etiqueta: 'Color de la descripción y etiquetas',
            },
            {
                tipo: 'color',
                clave: 'color_acento',
                etiqueta: 'Color de acento (líneas, iconos, botón)',
            },
            {
                tipo: 'color',
                clave: 'color_fondo',
                etiqueta: 'Color de fondo',
            },
            {
                tipo: 'select',
                clave: 'decoracion',
                etiqueta: 'Decoración del fondo',
                opciones: [
                    { valor: 'particulas', etiqueta: 'Partículas' },
                    { valor: 'moleculas', etiqueta: 'Formas geométricas' },
                    { valor: 'ninguna', etiqueta: 'Ninguna' },
                ],
            },
            {
                tipo: 'imagen',
                clave: 'imagen',
                etiqueta: 'Imagen de fondo (opcional)',
            },
            {
                tipo: 'enlace',
                clave: 'video',
                etiqueta: 'Vídeo de fondo (opcional)',
                placeholder: 'Dirección de un .mp4 o .webm',
            },
            {
                tipo: 'repetidor',
                clave: 'etiquetas',
                etiqueta: 'Etiquetas',
                titulo: 'texto',
                maximo: 4,
                campos: [
                    { tipo: 'icono', clave: 'icono', etiqueta: 'Icono' },
                    { tipo: 'texto', clave: 'texto', etiqueta: 'Texto' },
                ],
            },
            {
                tipo: 'repetidor',
                clave: 'cifras',
                etiqueta: 'Cifras',
                titulo: 'etiqueta',
                maximo: 4,
                campos: [
                    { tipo: 'icono', clave: 'icono', etiqueta: 'Icono' },
                    { tipo: 'texto', clave: 'valor', etiqueta: 'Número' },
                    { tipo: 'texto', clave: 'etiqueta', etiqueta: 'Etiqueta' },
                ],
            },
            {
                tipo: 'texto',
                clave: 'boton_texto',
                etiqueta: 'Texto del botón',
                placeholder: 'Vacío = sin botón',
            },
            {
                tipo: 'enlace',
                clave: 'boton_enlace',
                etiqueta: 'Enlace del botón',
            },
        ],
    },
    {
        clave: 'encabezado',
        nombre: 'Encabezado',
        descripcion: 'Título de página con una entradilla breve.',
        icono: Heading1,
        categoria: 'Estructura',
        componente: BloqueEncabezado as DefinicionBloque['componente'],
        defaults: { titulo: 'Título de la página' },
        estilosPorDefecto: { fondo: 'suave', espaciado: 'compacto' },
        campos: [
            { tipo: 'texto', clave: 'titulo', etiqueta: 'Título' },
            {
                tipo: 'textarea',
                clave: 'descripcion',
                etiqueta: 'Descripción',
                filas: 2,
            },
        ],
    },
    {
        clave: 'texto',
        nombre: 'Texto',
        descripcion: 'Un bloque de texto con formato.',
        icono: Type,
        categoria: 'Contenido',
        componente: BloqueTexto as DefinicionBloque['componente'],
        defaults: { contenido: '<p>Escribe aquí el contenido.</p>' },
        estilosPorDefecto: { ancho: 'estrecho' },
        campos: [
            { tipo: 'texto', clave: 'titulo', etiqueta: 'Título (opcional)' },
            { tipo: 'richtext', clave: 'contenido', etiqueta: 'Contenido' },
        ],
    },
    {
        clave: 'texto-imagen',
        nombre: 'Texto e imagen',
        descripcion: 'Texto a un lado, imagen al otro.',
        icono: Image,
        categoria: 'Contenido',
        componente: BloqueTextoImagen as DefinicionBloque['componente'],
        defaults: {
            titulo: 'Un titular',
            contenido: '<p>Escribe aquí el contenido.</p>',
            posicion_imagen: 'derecha',
        },
        campos: [
            {
                tipo: 'texto',
                clave: 'antetitulo',
                etiqueta: 'Antetítulo',
                placeholder: 'Texto pequeño sobre el título (opcional)',
            },
            { tipo: 'texto', clave: 'titulo', etiqueta: 'Título' },
            { tipo: 'richtext', clave: 'contenido', etiqueta: 'Contenido' },
            { tipo: 'imagen', clave: 'imagen', etiqueta: 'Imagen' },
            {
                tipo: 'select',
                clave: 'posicion_imagen',
                etiqueta: 'Posición de la imagen',
                opciones: [
                    { valor: 'derecha', etiqueta: 'A la derecha' },
                    { valor: 'izquierda', etiqueta: 'A la izquierda' },
                ],
            },
            {
                tipo: 'texto',
                clave: 'boton_texto',
                etiqueta: 'Texto del botón',
                placeholder: 'Vacío = sin botón',
            },
            {
                tipo: 'enlace',
                clave: 'boton_enlace',
                etiqueta: 'Enlace del botón',
            },
        ],
    },
    {
        clave: 'cta',
        nombre: 'Llamado a la acción',
        descripcion: 'Franja destacada con un botón.',
        icono: Megaphone,
        categoria: 'Contenido',
        componente: BloqueCta as DefinicionBloque['componente'],
        defaults: {
            titulo: '¿Quieres formar parte de la Cámara?',
            texto: 'Súmate a la red de empresas españolas en Bolivia.',
            boton_texto: 'Afíliate',
            boton_enlace: '/afiliate',
        },
        estilosPorDefecto: { fondo: 'marca', espaciado: 'compacto' },
        campos: [
            { tipo: 'texto', clave: 'titulo', etiqueta: 'Título' },
            { tipo: 'textarea', clave: 'texto', etiqueta: 'Texto', filas: 2 },
            {
                tipo: 'texto',
                clave: 'boton_texto',
                etiqueta: 'Texto del botón',
            },
            {
                tipo: 'enlace',
                clave: 'boton_enlace',
                etiqueta: 'Enlace del botón',
            },
        ],
    },
    {
        clave: 'separador',
        nombre: 'Separador',
        descripcion: 'Espacio en blanco entre secciones.',
        icono: Minus,
        categoria: 'Estructura',
        componente: BloqueSeparador as DefinicionBloque['componente'],
        defaults: { altura: 48, con_linea: false },
        campos: [
            {
                tipo: 'numero',
                clave: 'altura',
                etiqueta: 'Altura (px)',
                min: 8,
                max: 240,
            },
            {
                tipo: 'switch',
                clave: 'con_linea',
                etiqueta: 'Mostrar una línea',
            },
        ],
    },
    {
        clave: 'presentacion',
        nombre: 'Presentación',
        descripcion:
            'Texto institucional de la Cámara (se edita en La Cámara).',
        icono: Landmark,
        categoria: 'Dinámicos',
        componente: BloquePresentacion as DefinicionBloque['componente'],
        dinamico: true,
        estilosPorDefecto: { fondo: 'claro', espaciado: 'amplio' },
        defaults: {
            antetitulo: 'Quiénes somos',
            titulo: 'Cámara de Comercio Española en Bolivia',
            seccion: 'nosotros',
            boton_texto: 'Conoce la Cámara',
            boton_enlace: '/la-camara',
        },
        campos: [
            { tipo: 'texto', clave: 'antetitulo', etiqueta: 'Antetítulo' },
            {
                tipo: 'texto',
                clave: 'titulo',
                etiqueta: 'Título',
                placeholder: 'Si lo dejas vacío, se usa el del contenido',
            },
            {
                tipo: 'select',
                clave: 'seccion',
                etiqueta: 'Texto a mostrar',
                opciones: [
                    { valor: 'nosotros', etiqueta: 'Nosotros' },
                    {
                        valor: 'nuestra_organizacion',
                        etiqueta: 'Nuestra organización',
                    },
                    { valor: 'mision', etiqueta: 'Misión' },
                    { valor: 'vision', etiqueta: 'Visión' },
                ],
            },
            {
                tipo: 'texto',
                clave: 'boton_texto',
                etiqueta: 'Texto del botón',
            },
            {
                tipo: 'enlace',
                clave: 'boton_enlace',
                etiqueta: 'Enlace del botón',
            },
        ],
    },
    {
        clave: 'servicios',
        nombre: 'Servicios',
        descripcion: 'Rejilla con los servicios publicados.',
        icono: Sparkles,
        categoria: 'Dinámicos',
        componente: BloqueServicios as DefinicionBloque['componente'],
        dinamico: true,
        defaults: {
            titulo: 'Servicios al asociado',
            descripcion: '',
            columnas: '3',
            limite: 0,
        },
        estilosPorDefecto: { fondo: 'suave' },
        campos: [
            { tipo: 'texto', clave: 'titulo', etiqueta: 'Título' },
            {
                tipo: 'textarea',
                clave: 'descripcion',
                etiqueta: 'Descripción',
                filas: 2,
            },
            CAMPO_COLUMNAS,
            {
                tipo: 'numero',
                clave: 'limite',
                etiqueta: 'Cuántos mostrar (0 = todos)',
                min: 0,
                max: 24,
            },
            {
                tipo: 'texto',
                clave: 'enlace_texto',
                etiqueta: 'Texto del enlace «ver todo»',
                placeholder: 'Vacío = sin enlace',
            },
            { tipo: 'enlace', clave: 'enlace', etiqueta: 'Enlace «ver todo»' },
        ],
    },
    {
        clave: 'noticias-recientes',
        nombre: 'Últimas noticias',
        descripcion: 'Las noticias publicadas más recientes.',
        icono: Newspaper,
        categoria: 'Dinámicos',
        componente: BloqueNoticiasRecientes as DefinicionBloque['componente'],
        dinamico: true,
        defaults: {
            titulo: 'Últimas noticias',
            columnas: '3',
            limite: 3,
            solo_destacadas: false,
        },
        campos: [
            { tipo: 'texto', clave: 'titulo', etiqueta: 'Título' },
            {
                tipo: 'textarea',
                clave: 'descripcion',
                etiqueta: 'Descripción',
                filas: 2,
            },
            CAMPO_COLUMNAS,
            {
                tipo: 'numero',
                clave: 'limite',
                etiqueta: 'Cuántas mostrar',
                min: 1,
                max: 12,
            },
            {
                tipo: 'switch',
                clave: 'solo_destacadas',
                etiqueta: 'Solo las destacadas',
            },
        ],
    },
    {
        clave: 'actividades-proximas',
        nombre: 'Actividades',
        descripcion: 'Las próximas actividades en agenda.',
        icono: CalendarDays,
        categoria: 'Dinámicos',
        componente: BloqueActividadesProximas as DefinicionBloque['componente'],
        dinamico: true,
        defaults: {
            titulo: 'Próximas actividades',
            columnas: '3',
            limite: 3,
            solo_proximas: true,
        },
        estilosPorDefecto: { fondo: 'suave' },
        campos: [
            { tipo: 'texto', clave: 'titulo', etiqueta: 'Título' },
            {
                tipo: 'textarea',
                clave: 'descripcion',
                etiqueta: 'Descripción',
                filas: 2,
            },
            CAMPO_COLUMNAS,
            {
                tipo: 'numero',
                clave: 'limite',
                etiqueta: 'Cuántas mostrar',
                min: 1,
                max: 12,
            },
            {
                tipo: 'switch',
                clave: 'solo_proximas',
                etiqueta: 'Solo las que aún no han ocurrido',
                ayuda: 'Si lo desactivas, se muestran también las pasadas.',
            },
            {
                tipo: 'texto',
                clave: 'enlace_texto',
                etiqueta: 'Texto del enlace «ver todo»',
                placeholder: 'Vacío = sin enlace',
            },
            { tipo: 'enlace', clave: 'enlace', etiqueta: 'Enlace «ver todo»' },
        ],
    },
    {
        clave: 'directorio',
        nombre: 'Directorio',
        descripcion: 'Las personas del directorio de la Cámara.',
        icono: Users,
        categoria: 'Dinámicos',
        componente: BloqueDirectorio as DefinicionBloque['componente'],
        dinamico: true,
        defaults: { titulo: 'Directorio', columnas: '4', limite: 0 },
        campos: [
            { tipo: 'texto', clave: 'titulo', etiqueta: 'Título' },
            {
                tipo: 'textarea',
                clave: 'descripcion',
                etiqueta: 'Descripción',
                filas: 2,
            },
            CAMPO_COLUMNAS,
            {
                tipo: 'numero',
                clave: 'limite',
                etiqueta: 'Cuántos mostrar (0 = todos)',
                min: 0,
                max: 60,
            },
        ],
    },
    {
        clave: 'galeria',
        nombre: 'Galería',
        descripcion: 'Rejilla de imágenes con pie opcional.',
        icono: Images,
        categoria: 'Contenido',
        componente: BloqueGaleria as DefinicionBloque['componente'],
        defaults: { titulo: '', columnas: '3', imagenes: [] },
        campos: [
            { tipo: 'texto', clave: 'titulo', etiqueta: 'Título' },
            {
                tipo: 'textarea',
                clave: 'descripcion',
                etiqueta: 'Descripción',
                filas: 2,
            },
            CAMPO_COLUMNAS,
            {
                tipo: 'repetidor',
                clave: 'imagenes',
                etiqueta: 'Imágenes',
                titulo: 'pie',
                maximo: 24,
                campos: [
                    { tipo: 'imagen', clave: 'imagen', etiqueta: 'Imagen' },
                    { tipo: 'texto', clave: 'pie', etiqueta: 'Pie de foto' },
                ],
            },
        ],
    },
    {
        clave: 'acordeon',
        nombre: 'Preguntas frecuentes',
        descripcion: 'Lista desplegable de preguntas y respuestas.',
        icono: MessageCircleQuestion,
        categoria: 'Contenido',
        componente: BloqueAcordeon as DefinicionBloque['componente'],
        estilosPorDefecto: { ancho: 'estrecho' },
        defaults: {
            titulo: 'Preguntas frecuentes',
            preguntas: [
                {
                    pregunta: '¿Cómo me afilio a la Cámara?',
                    respuesta: 'Escríbenos y te explicamos el proceso.',
                },
            ],
        },
        campos: [
            { tipo: 'texto', clave: 'titulo', etiqueta: 'Título' },
            {
                tipo: 'textarea',
                clave: 'descripcion',
                etiqueta: 'Descripción',
                filas: 2,
            },
            {
                tipo: 'repetidor',
                clave: 'preguntas',
                etiqueta: 'Preguntas',
                titulo: 'pregunta',
                maximo: 30,
                campos: [
                    { tipo: 'texto', clave: 'pregunta', etiqueta: 'Pregunta' },
                    {
                        tipo: 'textarea',
                        clave: 'respuesta',
                        etiqueta: 'Respuesta',
                        filas: 4,
                    },
                ],
            },
        ],
    },
    {
        clave: 'cifras',
        nombre: 'Cifras destacadas',
        descripcion: 'Números grandes con su etiqueta.',
        icono: Hash,
        categoria: 'Contenido',
        componente: BloqueCifras as DefinicionBloque['componente'],
        estilosPorDefecto: { fondo: 'oscuro' },
        defaults: {
            cifras: [
                { valor: '+100', etiqueta: 'Empresas asociadas' },
                { valor: '25', etiqueta: 'Años de trayectoria' },
                { valor: '2', etiqueta: 'Oficinas en Bolivia' },
            ],
        },
        campos: [
            { tipo: 'texto', clave: 'titulo', etiqueta: 'Título' },
            {
                tipo: 'textarea',
                clave: 'descripcion',
                etiqueta: 'Descripción',
                filas: 2,
            },
            {
                tipo: 'repetidor',
                clave: 'cifras',
                etiqueta: 'Cifras',
                titulo: 'etiqueta',
                maximo: 8,
                campos: [
                    { tipo: 'texto', clave: 'valor', etiqueta: 'Número' },
                    { tipo: 'texto', clave: 'etiqueta', etiqueta: 'Etiqueta' },
                ],
            },
        ],
    },
    {
        clave: 'timeline',
        nombre: 'Línea de tiempo',
        descripcion: 'Hitos en orden cronológico.',
        icono: Milestone,
        categoria: 'Contenido',
        componente: BloqueTimeline as DefinicionBloque['componente'],
        estilosPorDefecto: { ancho: 'estrecho' },
        defaults: { titulo: 'Nuestra historia', hitos: [] },
        campos: [
            { tipo: 'texto', clave: 'titulo', etiqueta: 'Título' },
            {
                tipo: 'textarea',
                clave: 'descripcion',
                etiqueta: 'Descripción',
                filas: 2,
            },
            {
                tipo: 'repetidor',
                clave: 'hitos',
                etiqueta: 'Hitos',
                titulo: 'titulo',
                maximo: 30,
                campos: [
                    { tipo: 'texto', clave: 'fecha', etiqueta: 'Fecha' },
                    { tipo: 'texto', clave: 'titulo', etiqueta: 'Título' },
                    {
                        tipo: 'textarea',
                        clave: 'texto',
                        etiqueta: 'Descripción',
                        filas: 3,
                    },
                ],
            },
        ],
    },
    {
        clave: 'video',
        nombre: 'Vídeo',
        descripcion: 'Incrusta un vídeo de YouTube o Vimeo.',
        icono: Youtube,
        categoria: 'Contenido',
        componente: BloqueVideo as DefinicionBloque['componente'],
        estilosPorDefecto: { ancho: 'estrecho' },
        defaults: { titulo: '', url: '' },
        campos: [
            { tipo: 'texto', clave: 'titulo', etiqueta: 'Título' },
            {
                tipo: 'textarea',
                clave: 'descripcion',
                etiqueta: 'Descripción',
                filas: 2,
            },
            {
                tipo: 'enlace',
                clave: 'url',
                etiqueta: 'Dirección del vídeo',
                placeholder: 'https://www.youtube.com/watch?v=…',
            },
        ],
    },
    {
        clave: 'descargas',
        nombre: 'Descargas',
        descripcion: 'Lista de documentos descargables.',
        icono: FileDown,
        categoria: 'Contenido',
        componente: BloqueDescargas as DefinicionBloque['componente'],
        estilosPorDefecto: { ancho: 'estrecho' },
        defaults: { titulo: 'Documentos', archivos: [] },
        campos: [
            { tipo: 'texto', clave: 'titulo', etiqueta: 'Título' },
            {
                tipo: 'textarea',
                clave: 'descripcion',
                etiqueta: 'Descripción',
                filas: 2,
            },
            {
                tipo: 'repetidor',
                clave: 'archivos',
                etiqueta: 'Archivos',
                titulo: 'nombre',
                maximo: 30,
                campos: [
                    { tipo: 'texto', clave: 'nombre', etiqueta: 'Nombre' },
                    {
                        tipo: 'texto',
                        clave: 'descripcion',
                        etiqueta: 'Descripción breve',
                    },
                    { tipo: 'enlace', clave: 'url', etiqueta: 'Dirección' },
                ],
            },
        ],
    },
    {
        clave: 'mapa',
        nombre: 'Mapa y contacto',
        descripcion: 'Datos de una oficina junto a su mapa.',
        icono: MapPin,
        categoria: 'Contenido',
        componente: BloqueMapa as DefinicionBloque['componente'],
        defaults: { titulo: 'Dónde estamos' },
        campos: [
            { tipo: 'texto', clave: 'titulo', etiqueta: 'Título' },
            {
                tipo: 'textarea',
                clave: 'descripcion',
                etiqueta: 'Descripción',
                filas: 2,
            },
            {
                tipo: 'textarea',
                clave: 'direccion',
                etiqueta: 'Dirección',
                filas: 2,
            },
            { tipo: 'texto', clave: 'telefono', etiqueta: 'Teléfono' },
            { tipo: 'texto', clave: 'correo', etiqueta: 'Correo electrónico' },
            {
                tipo: 'enlace',
                clave: 'mapa_url',
                etiqueta: 'Mapa (dirección de incrustar)',
                placeholder: 'https://www.google.com/maps/embed?…',
            },
        ],
    },
    {
        clave: 'socios',
        nombre: 'Socios',
        descripcion: 'Logotipos de las empresas asociadas.',
        icono: Building2,
        categoria: 'Dinámicos',
        componente: BloqueSocios as DefinicionBloque['componente'],
        dinamico: true,
        estilosPorDefecto: { fondo: 'suave' },
        defaults: {
            titulo: 'Nuestros socios',
            limite: 0,
            solo_destacados: false,
            boton_texto: 'Conoce nuestros socios',
            boton_enlace: '/socios',
        },
        campos: [
            { tipo: 'texto', clave: 'titulo', etiqueta: 'Título' },
            {
                tipo: 'textarea',
                clave: 'descripcion',
                etiqueta: 'Descripción',
                filas: 2,
            },
            {
                tipo: 'numero',
                clave: 'limite',
                etiqueta: 'Cuántos mostrar (0 = todos)',
                min: 0,
                max: 60,
            },
            {
                tipo: 'switch',
                clave: 'solo_destacados',
                etiqueta: 'Solo los destacados',
            },
            {
                tipo: 'texto',
                clave: 'boton_texto',
                etiqueta: 'Texto del botón',
                placeholder: 'Vacío = sin botón',
            },
            {
                tipo: 'enlace',
                clave: 'boton_enlace',
                etiqueta: 'Enlace del botón',
            },
        ],
    },
    {
        clave: 'fichas-pais',
        nombre: 'Fichas país',
        descripcion: 'Las fichas de país publicadas.',
        icono: Globe2,
        categoria: 'Dinámicos',
        componente: BloqueFichasPais as DefinicionBloque['componente'],
        dinamico: true,
        defaults: { titulo: 'Fichas país', limite: 0 },
        campos: [
            { tipo: 'texto', clave: 'titulo', etiqueta: 'Título' },
            {
                tipo: 'textarea',
                clave: 'descripcion',
                etiqueta: 'Descripción',
                filas: 2,
            },
            {
                tipo: 'numero',
                clave: 'limite',
                etiqueta: 'Cuántas mostrar (0 = todas)',
                min: 0,
                max: 20,
            },
        ],
    },
    {
        clave: 'red-camaras',
        nombre: 'Red de cámaras',
        descripcion: 'Las cámaras hermanas de la red.',
        icono: Network,
        categoria: 'Dinámicos',
        componente: BloqueRedCamaras as DefinicionBloque['componente'],
        dinamico: true,
        estilosPorDefecto: { fondo: 'suave' },
        defaults: { titulo: 'Red de cámaras', columnas: '3', limite: 0 },
        campos: [
            { tipo: 'texto', clave: 'titulo', etiqueta: 'Título' },
            {
                tipo: 'textarea',
                clave: 'descripcion',
                etiqueta: 'Descripción',
                filas: 2,
            },
            CAMPO_COLUMNAS,
            {
                tipo: 'numero',
                clave: 'limite',
                etiqueta: 'Cuántas mostrar (0 = todas)',
                min: 0,
                max: 60,
            },
        ],
    },
];

const POR_CLAVE = new Map(BLOQUES.map((bloque) => [bloque.clave, bloque]));

export function bloque(clave: string): DefinicionBloque | undefined {
    return POR_CLAVE.get(clave);
}

/**
 * Bloques agrupados por categoría, en el orden en que se declaran.
 */
export function bloquesPorCategoria(): [string, DefinicionBloque[]][] {
    const grupos = new Map<string, DefinicionBloque[]>();

    for (const definicion of BLOQUES) {
        const actual = grupos.get(definicion.categoria) ?? [];

        actual.push(definicion);
        grupos.set(definicion.categoria, actual);
    }

    return [...grupos.entries()];
}
