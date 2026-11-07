import { Link } from '@inertiajs/react';
import { Bot, LoaderCircle, MessageCircle, Send, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ErrorHttp, peticionJson } from '@/lib/http';
import { store } from '@/routes/api/asistente';

interface EnlaceRespuesta {
    url: string;
    texto: string;
}

interface RespuestaAsistente {
    respuesta: string;
    enlaces: EnlaceRespuesta[];
}

interface Mensaje {
    id: number;
    autor: 'asistente' | 'visitante';
    texto: string;
    enlaces?: EnlaceRespuesta[];
}

const PREGUNTAS_SUGERIDAS = [
    '¿Qué servicios ofrecen?',
    '¿Cómo puedo afiliarme?',
    '¿Dónde están las oficinas?',
];

export default function AsistenteChat() {
    const [abierto, setAbierto] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [mensajes, setMensajes] = useState<Mensaje[]>([
        {
            id: 0,
            autor: 'asistente',
            texto: '¡Hola! Soy el asistente virtual de la Cámara Española en Bolivia. Puedo orientarte sobre nuestros servicios y la información pública del sitio.',
        },
    ]);
    const siguienteId = useRef(1);
    const finalMensajes = useRef<HTMLDivElement>(null);

    useEffect(() => {
        finalMensajes.current?.scrollIntoView({ behavior: 'smooth' });
    }, [mensajes, abierto]);

    async function enviar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const consulta = mensaje.trim();

        if (!consulta || enviando) {
            return;
        }

        setMensaje('');
        setEnviando(true);
        setMensajes((actuales) => [
            ...actuales,
            { id: siguienteId.current++, autor: 'visitante', texto: consulta },
        ]);

        try {
            const respuesta = await peticionJson<RespuestaAsistente>(
                store.url(),
                'POST',
                { mensaje: consulta },
            );

            setMensajes((actuales) => [
                ...actuales,
                {
                    id: siguienteId.current++,
                    autor: 'asistente',
                    texto: respuesta.respuesta,
                    enlaces: respuesta.enlaces,
                },
            ]);
        } catch (error) {
            const texto =
                error instanceof ErrorHttp && error.estado === 429
                    ? 'Has enviado varias consultas seguidas. Espera un momento y vuelve a intentarlo.'
                    : 'No pude procesar tu consulta ahora. Inténtalo de nuevo o visita la página de contacto.';

            setMensajes((actuales) => [
                ...actuales,
                { id: siguienteId.current++, autor: 'asistente', texto },
            ]);
        } finally {
            setEnviando(false);
        }
    }

    return (
        <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
            {abierto && (
                <section
                    aria-label="Asistente virtual de la Cámara"
                    className="flex h-[min(34rem,calc(100dvh-7rem))] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl sm:w-96"
                >
                    <header className="flex items-center justify-between gap-3 bg-red-700 px-4 py-3 text-white">
                        <div className="flex items-center gap-3">
                            <span className="flex size-10 items-center justify-center rounded-full bg-white/15">
                                <Bot aria-hidden="true" className="size-6" />
                            </span>
                            <div>
                                <h2 className="font-semibold">Asistente virtual</h2>
                                <p className="text-xs text-white/80">
                                    Cámara Española en Bolivia
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setAbierto(false)}
                            aria-label="Cerrar chat"
                            className="rounded-full p-2 transition hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white"
                        >
                            <X aria-hidden="true" className="size-5" />
                        </button>
                    </header>

                    <div
                        role="log"
                        aria-live="polite"
                        aria-relevant="additions"
                        className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4"
                    >
                        {mensajes.map((elemento) => (
                            <div
                                key={elemento.id}
                                className={`flex ${elemento.autor === 'visitante' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                                        elemento.autor === 'visitante'
                                            ? 'rounded-br-sm bg-red-700 text-white'
                                            : 'rounded-bl-sm border border-gray-200 bg-white text-gray-800'
                                    }`}
                                >
                                    <p className="whitespace-pre-line">{elemento.texto}</p>
                                    {elemento.enlaces?.length ? (
                                        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                                            {elemento.enlaces.map((enlace) => (
                                                <Link
                                                    key={enlace.url}
                                                    href={enlace.url}
                                                    className="inline-flex font-semibold text-red-700 underline underline-offset-2 hover:text-red-900"
                                                >
                                                    {enlace.texto}
                                                </Link>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        ))}

                        {mensajes.length === 1 && (
                            <div className="flex flex-wrap gap-2">
                                {PREGUNTAS_SUGERIDAS.map((pregunta) => (
                                    <button
                                        key={pregunta}
                                        type="button"
                                        onClick={() => setMensaje(pregunta)}
                                        className="rounded-full border border-red-200 bg-white px-3 py-1.5 text-left text-xs text-red-800 transition hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-600"
                                    >
                                        {pregunta}
                                    </button>
                                ))}
                            </div>
                        )}

                        {enviando && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <LoaderCircle
                                    aria-hidden="true"
                                    className="size-4 animate-spin"
                                />
                                Escribiendo…
                            </div>
                        )}
                        <div ref={finalMensajes} />
                    </div>

                    <form
                        onSubmit={enviar}
                        className="flex items-center gap-2 border-t border-gray-200 bg-white p-3"
                    >
                        <label className="sr-only" htmlFor="mensaje-asistente">
                            Escribe tu consulta
                        </label>
                        <input
                            id="mensaje-asistente"
                            value={mensaje}
                            onChange={(event) => setMensaje(event.target.value)}
                            maxLength={500}
                            placeholder="Escribe tu consulta…"
                            autoComplete="off"
                            className="min-w-0 flex-1 rounded-full border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-red-600 focus:ring-2 focus:ring-red-600/20"
                        />
                        <button
                            type="submit"
                            disabled={enviando || !mensaje.trim()}
                            aria-label="Enviar consulta"
                            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-700 text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
                        >
                            <Send aria-hidden="true" className="size-4" />
                        </button>
                    </form>
                    <p className="bg-white px-4 pb-2 text-center text-[11px] text-gray-500">
                        Respuestas basadas en información pública del sitio.
                    </p>
                </section>
            )}

            <button
                type="button"
                onClick={() => setAbierto((actual) => !actual)}
                aria-expanded={abierto}
                aria-label={abierto ? 'Cerrar asistente virtual' : 'Abrir asistente virtual'}
                className="flex size-14 items-center justify-center rounded-full bg-red-700 text-white shadow-lg shadow-red-900/25 transition hover:scale-105 hover:bg-red-800 focus-visible:ring-4 focus-visible:ring-red-600/30"
            >
                {abierto ? (
                    <X aria-hidden="true" className="size-6" />
                ) : (
                    <MessageCircle aria-hidden="true" className="size-6" />
                )}
            </button>
        </div>
    );
}
