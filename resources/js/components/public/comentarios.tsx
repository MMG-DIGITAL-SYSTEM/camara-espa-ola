import {
    CheckCircle2,
    Loader2,
    MessageCircle,
    MessageSquareText,
    Send,
} from 'lucide-react';
import { useRef, useState } from 'react';
import {
    CampoAreaTexto,
    CampoTexto,
    enfocarPrimerError,
    erroresPorCampo,
} from '@/components/public/campos-formulario';
import { ErrorDeValidacion, ErrorHttp, peticionJson } from '@/lib/http';
import {
    actividad as comentarActividad,
    noticia as comentarNoticia,
} from '@/routes/api/comentarios';

export type ComentarioPublico = {
    id: number;
    nombre: string;
    web: string | null;
    texto: string;
    fecha: string | null;
};

type Destino =
    { tipo: 'noticia'; slug: string } | { tipo: 'actividad'; id: number };

type Datos = {
    comentario: string;
    nombre: string;
    correo: string;
    web: string;
};

/** Clave del navegador donde se recuerdan nombre, correo y web. */
const CLAVE_RECORDAR = 'camara:comentarista';

const ORDEN_CAMPOS = ['comentario', 'nombre', 'correo', 'web'] as const;

const MAXIMO_COMENTARIO = 3000;

const VACIO: Datos = { comentario: '', nombre: '', correo: '', web: '' };

function direccion(destino: Destino): string {
    return destino.tipo === 'noticia'
        ? comentarNoticia(destino.slug).url
        : comentarActividad(destino.id).url;
}

function iniciales(nombre: string): string {
    return nombre
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((parte) => parte[0]?.toUpperCase() ?? '')
        .join('');
}

/**
 * El almacenamiento del navegador puede no estar disponible (o no haber
 * navegador, al renderizar en el servidor): nunca rompe.
 */
function leerRecordado(): Pick<Datos, 'nombre' | 'correo' | 'web'> | null {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        const guardado = window.localStorage.getItem(CLAVE_RECORDAR);

        return guardado ? JSON.parse(guardado) : null;
    } catch {
        return null;
    }
}

function guardarRecordado(datos: Datos | null) {
    try {
        if (datos) {
            const { nombre, correo, web } = datos;
            window.localStorage.setItem(
                CLAVE_RECORDAR,
                JSON.stringify({ nombre, correo, web }),
            );
        } else {
            window.localStorage.removeItem(CLAVE_RECORDAR);
        }
    } catch {
        // Sin almacenamiento, simplemente no se recuerda.
    }
}

function Comentario({ comentario }: { comentario: ComentarioPublico }) {
    return (
        <li className="flex gap-4">
            <span
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-semibold text-red-600"
            >
                {iniciales(comentario.nombre)}
            </span>
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                    {comentario.web ? (
                        <a
                            href={comentario.web}
                            target="_blank"
                            rel="nofollow ugc noopener noreferrer"
                            className="font-semibold text-gray-900 hover:text-red-600"
                        >
                            {comentario.nombre}
                        </a>
                    ) : (
                        <span className="font-semibold text-gray-900">
                            {comentario.nombre}
                        </span>
                    )}
                    {comentario.fecha && (
                        <span className="text-xs text-gray-400">
                            {comentario.fecha}
                        </span>
                    )}
                </div>
                <p className="mt-1.5 leading-relaxed break-words whitespace-pre-line text-gray-700">
                    {comentario.texto}
                </p>
            </div>
        </li>
    );
}

/**
 * Comentarios aprobados y formulario para dejar uno nuevo. Lo enviado queda
 * pendiente: se publica cuando alguien del panel lo aprueba.
 */
export function SeccionComentarios({
    destino,
    comentarios,
}: {
    destino: Destino;
    comentarios: ComentarioPublico[];
}) {
    const formulario = useRef<HTMLFormElement>(null);
    const [datos, setDatos] = useState<Datos>(() => ({
        ...VACIO,
        ...leerRecordado(),
    }));
    const [recordar, setRecordar] = useState(() => leerRecordado() !== null);
    const [errores, setErrores] = useState<Record<string, string>>({});
    const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
    const [enviando, setEnviando] = useState(false);
    const [enviado, setEnviado] = useState<string | null>(null);
    // Trampa para robots: una persona no ve ni llena este campo.
    const [trampa, setTrampa] = useState('');

    const cambiar = (campo: keyof Datos) => (valor: string) => {
        setDatos((actuales) => ({ ...actuales, [campo]: valor }));
        setErrores((actuales) => ({ ...actuales, [campo]: '' }));
    };

    const enviar = async (evento: React.FormEvent) => {
        evento.preventDefault();

        if (enviando) {
            return;
        }

        setEnviando(true);
        setErrorGeneral(null);
        setEnviado(null);

        try {
            const respuesta = await peticionJson<{ message: string }>(
                direccion(destino),
                'POST',
                { ...datos, telefono: trampa },
            );

            guardarRecordado(recordar ? datos : null);
            setDatos(recordar ? { ...datos, comentario: '' } : VACIO);
            setErrores({});
            setEnviado(respuesta.message);
        } catch (error) {
            if (error instanceof ErrorDeValidacion) {
                const porCampo = erroresPorCampo(error);
                setErrores(porCampo);
                enfocarPrimerError(formulario.current, ORDEN_CAMPOS, porCampo);
            } else if (error instanceof ErrorHttp && error.estado === 429) {
                setErrorGeneral(
                    'Has enviado varios comentarios seguidos. Espera un momento antes de volver a intentarlo.',
                );
            } else {
                setErrorGeneral(
                    'No pudimos enviar tu comentario. Inténtalo de nuevo en unos minutos.',
                );
            }
        } finally {
            setEnviando(false);
        }
    };

    return (
        <section
            id="comentarios"
            className="mt-14 border-t border-gray-100 pt-10"
        >
            <h2 className="mb-6 flex items-center gap-2 text-sm font-bold tracking-wider text-gray-900 uppercase">
                <span className="h-4 w-1 rounded-full bg-red-600"></span>
                Comentarios
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600 tabular-nums">
                    {comentarios.length}
                </span>
            </h2>

            {comentarios.length > 0 ? (
                <ul className="mb-10 space-y-7">
                    {comentarios.map((comentario) => (
                        <Comentario
                            key={comentario.id}
                            comentario={comentario}
                        />
                    ))}
                </ul>
            ) : (
                <p className="mb-10 flex items-center gap-2 text-gray-500">
                    <MessageCircle className="h-4 w-4" />
                    Todavía no hay comentarios. Sé el primero en comentar.
                </p>
            )}

            <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-6 md:p-8">
                <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                    <MessageSquareText className="h-5 w-5 text-red-600" />
                    Deja un comentario
                </h3>
                <p className="mt-1 mb-6 text-sm text-gray-500">
                    Tu correo electrónico no se publicará. Los campos con{' '}
                    <span className="text-red-600">*</span> son obligatorios.
                </p>

                {enviado && (
                    <div
                        role="status"
                        className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
                    >
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                        {enviado}
                    </div>
                )}

                <form
                    ref={formulario}
                    onSubmit={enviar}
                    noValidate
                    className="space-y-5"
                >
                    <CampoAreaTexto
                        campo="comentario"
                        etiqueta="Comentario"
                        valor={datos.comentario}
                        error={errores.comentario}
                        onCambio={cambiar('comentario')}
                        maximo={MAXIMO_COMENTARIO}
                        filas={6}
                    />

                    <div className="grid gap-5 sm:grid-cols-3">
                        <CampoTexto
                            campo="nombre"
                            etiqueta="Nombre"
                            valor={datos.nombre}
                            error={errores.nombre}
                            onCambio={cambiar('nombre')}
                            autoComplete="name"
                            maxLength={100}
                        />
                        <CampoTexto
                            campo="correo"
                            etiqueta="Correo electrónico"
                            type="email"
                            valor={datos.correo}
                            error={errores.correo}
                            onCambio={cambiar('correo')}
                            autoComplete="email"
                            maxLength={255}
                        />
                        <CampoTexto
                            campo="web"
                            etiqueta="Web"
                            obligatorio={false}
                            valor={datos.web}
                            error={errores.web}
                            onCambio={cambiar('web')}
                            autoComplete="url"
                            placeholder="www.empresa.com"
                            maxLength={255}
                        />
                    </div>

                    <div aria-hidden="true" className="absolute -left-[9999px]">
                        <label htmlFor="telefono-comentario">Teléfono</label>
                        <input
                            id="telefono-comentario"
                            name="telefono"
                            tabIndex={-1}
                            autoComplete="off"
                            value={trampa}
                            onChange={(evento) =>
                                setTrampa(evento.target.value)
                            }
                        />
                    </div>

                    <label className="flex cursor-pointer items-start gap-3 text-sm text-gray-600">
                        <input
                            type="checkbox"
                            checked={recordar}
                            onChange={(evento) => {
                                setRecordar(evento.target.checked);

                                if (!evento.target.checked) {
                                    guardarRecordado(null);
                                }
                            }}
                            className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-red-600"
                        />
                        Guarda mi nombre, correo electrónico y web en este
                        navegador para la próxima vez que comente.
                    </label>

                    {errorGeneral && (
                        <p role="alert" className="text-sm text-red-600">
                            {errorGeneral}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={enviando}
                        className="inline-flex items-center gap-2 rounded-full bg-red-600 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {enviando ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                        {enviando ? 'Enviando…' : 'Publicar el comentario'}
                    </button>
                </form>
            </div>
        </section>
    );
}
