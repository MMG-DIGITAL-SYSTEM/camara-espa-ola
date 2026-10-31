// resources/js/pages/Public/Contacto.tsx
import {
    AlertCircle,
    Building2,
    CheckCircle2,
    Loader2,
    Mail,
    MapPin,
    Phone,
    Send,
    UserRound,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
    CampoAreaTexto,
    CampoTexto,
    MensajeDeError,
    enfocarPrimerError,
    erroresPorCampo,
} from '@/components/public/campos-formulario';
import { SeccionesDelModulo } from '@/components/public/secciones-del-modulo';
import PublicLayout from '@/layouts/PublicLayout';
import { ErrorDeValidacion, ErrorHttp, peticionJson } from '@/lib/http';

// ============================================
// TIPOS
// ============================================
type CampoFormulario =
    | 'necesidad'
    | 'nombre'
    | 'empresa'
    | 'correo'
    | 'telefono'
    | 'acepta_privacidad';

type DatosFormulario = {
    necesidad: string;
    nombre: string;
    empresa: string;
    correo: string;
    telefono: string;
    acepta_privacidad: boolean;
};

type Errores = Partial<Record<CampoFormulario, string>>;

type Oficina = {
    id: number;
    nombre: string;
    ciudad: string;
    direccion: string;
    referencia: string | null;
    edificio: string | null;
    piso: string | null;
    oficina: string | null;
    telefono: string | null;
    correo: string | null;
    responsable: { nombre: string; cargo: string | null } | null;
    latitud: number | null;
    longitud: number | null;
    mapa_url: string | null;
};

const DATOS_VACIOS: DatosFormulario = {
    necesidad: '',
    nombre: '',
    empresa: '',
    correo: '',
    telefono: '',
    acepta_privacidad: false,
};

const MAXIMO_NECESIDAD = 2000;

// Orden en que aparecen en pantalla: se enfoca el primero que tenga error.
const ORDEN_DE_CAMPOS: CampoFormulario[] = [
    'necesidad',
    'nombre',
    'empresa',
    'correo',
    'telefono',
    'acepta_privacidad',
];

// ============================================
// FORMULARIO: PIEZAS
// ============================================
function Paso({
    numero,
    titulo,
    children,
}: {
    numero: number;
    titulo: string;
    children: React.ReactNode;
}) {
    return (
        <fieldset className="space-y-4">
            <legend className="mb-4 flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white shadow-md shadow-red-600/20">
                    {numero}
                </span>
                <span className="text-lg font-bold text-gray-900 md:text-xl">
                    {titulo}
                </span>
            </legend>
            {children}
        </fieldset>
    );
}

// ============================================
// FORMULARIO DE CONTACTO
// ============================================
function FormularioContacto() {
    const [datos, setDatos] = useState<DatosFormulario>(DATOS_VACIOS);
    const [errores, setErrores] = useState<Errores>({});
    const [enviando, setEnviando] = useState(false);
    const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
    const [confirmacion, setConfirmacion] = useState<string | null>(null);
    const formularioRef = useRef<HTMLFormElement>(null);
    const confirmacionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (confirmacion) {
            confirmacionRef.current?.focus();
        }
    }, [confirmacion]);

    const cambiar = <C extends CampoFormulario>(
        campo: C,
        valor: DatosFormulario[C],
    ) => {
        setDatos((anteriores) => ({ ...anteriores, [campo]: valor }));

        // El error de un campo desaparece en cuanto se corrige.
        if (errores[campo]) {
            setErrores((anteriores) => ({ ...anteriores, [campo]: undefined }));
        }
    };

    const enfocar = (conError: Errores) =>
        enfocarPrimerError(formularioRef.current, ORDEN_DE_CAMPOS, conError);

    const enviar = async (evento: React.FormEvent) => {
        evento.preventDefault();

        // El botón ya queda desactivado, pero un doble envío muy rápido
        // (Enter repetido) podría colarse antes del re-render.
        if (enviando) {
            return;
        }

        setErrorGeneral(null);

        // La política es obligatoria: se avisa sin esperar al servidor, que de
        // todos modos lo vuelve a comprobar.
        if (!datos.acepta_privacidad) {
            const conError = {
                acepta_privacidad:
                    'Debes aceptar la Política de Privacidad para enviar el formulario.',
            };
            setErrores(conError);
            enfocar(conError);

            return;
        }

        setEnviando(true);

        try {
            const respuesta = await peticionJson<{ message: string }>(
                '/api/contacto',
                'POST',
                datos,
            );

            setDatos(DATOS_VACIOS);
            setErrores({});
            setConfirmacion(respuesta.message);
        } catch (error) {
            if (error instanceof ErrorDeValidacion) {
                const conError = erroresPorCampo(error) as Errores;

                setErrores(conError);
                enfocar(conError);
            } else if (error instanceof ErrorHttp && error.estado === 429) {
                setErrorGeneral(
                    'Has enviado varios mensajes seguidos. Espera un momento antes de volver a intentarlo.',
                );
            } else {
                setErrorGeneral(
                    'No pudimos enviar tu mensaje. Revisa tu conexión e inténtalo de nuevo.',
                );
            }
        } finally {
            setEnviando(false);
        }
    };

    if (confirmacion) {
        return (
            <div
                ref={confirmacionRef}
                tabIndex={-1}
                role="status"
                className="animate-fade-in flex flex-col items-center px-6 py-12 text-center focus:outline-none md:py-16"
            >
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
                    <CheckCircle2 className="h-10 w-10 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                    ¡Mensaje enviado!
                </h3>
                <p className="mt-3 max-w-md text-gray-600">{confirmacion}</p>
                <button
                    type="button"
                    onClick={() => setConfirmacion(null)}
                    className="mt-8 inline-flex items-center gap-2 rounded-full border border-red-200 px-6 py-2.5 font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                    Enviar otro mensaje
                </button>
            </div>
        );
    }

    return (
        <form
            ref={formularioRef}
            onSubmit={enviar}
            noValidate
            className="space-y-10"
            aria-busy={enviando}
        >
            <Paso numero={1} titulo="Explícanos qué necesitas">
                <CampoAreaTexto
                    campo="necesidad"
                    etiqueta="Describe brevemente lo que necesitas"
                    valor={datos.necesidad}
                    error={errores.necesidad}
                    onCambio={(valor) => cambiar('necesidad', valor)}
                    maximo={MAXIMO_NECESIDAD}
                    placeholder="Por ejemplo: quiero información para afiliar a mi empresa…"
                />
            </Paso>

            <Paso numero={2} titulo="Déjanos tus datos de contacto">
                <div className="grid gap-5 md:grid-cols-2">
                    <CampoTexto
                        campo="nombre"
                        etiqueta="Tu nombre"
                        valor={datos.nombre}
                        error={errores.nombre}
                        onCambio={(valor) => cambiar('nombre', valor)}
                        autoComplete="name"
                        maxLength={150}
                    />
                    <CampoTexto
                        campo="empresa"
                        etiqueta="Empresa"
                        valor={datos.empresa}
                        error={errores.empresa}
                        onCambio={(valor) => cambiar('empresa', valor)}
                        autoComplete="organization"
                        maxLength={150}
                    />
                    <CampoTexto
                        campo="correo"
                        etiqueta="Email"
                        type="email"
                        valor={datos.correo}
                        error={errores.correo}
                        onCambio={(valor) => cambiar('correo', valor)}
                        autoComplete="email"
                        inputMode="email"
                        placeholder="nombre@empresa.com"
                        maxLength={255}
                    />
                    <CampoTexto
                        campo="telefono"
                        etiqueta="Teléfono de contacto"
                        type="tel"
                        valor={datos.telefono}
                        error={errores.telefono}
                        onCambio={(valor) => cambiar('telefono', valor)}
                        autoComplete="tel"
                        inputMode="tel"
                        placeholder="+591 70000000"
                        maxLength={25}
                    />
                </div>
            </Paso>

            <Paso
                numero={3}
                titulo="Acepta la política de privacidad y condiciones"
            >
                <div className="space-y-1.5">
                    <label
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                            errores.acepta_privacidad
                                ? 'border-red-300 bg-red-50/50'
                                : datos.acepta_privacidad
                                  ? 'border-red-200 bg-red-50/40'
                                  : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <input
                            type="checkbox"
                            name="acepta_privacidad"
                            checked={datos.acepta_privacidad}
                            onChange={(evento) =>
                                cambiar(
                                    'acepta_privacidad',
                                    evento.target.checked,
                                )
                            }
                            aria-invalid={
                                errores.acepta_privacidad ? true : undefined
                            }
                            aria-describedby={
                                errores.acepta_privacidad
                                    ? 'acepta_privacidad-error'
                                    : undefined
                            }
                            className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-gray-300 accent-red-600"
                        />
                        <span className="text-sm text-gray-700">
                            He leído y acepto la{' '}
                            <span className="font-semibold text-gray-900">
                                Política de Privacidad
                            </span>{' '}
                            <span className="text-red-600">*</span>
                        </span>
                    </label>
                    <MensajeDeError
                        id="acepta_privacidad-error"
                        error={errores.acepta_privacidad}
                    />
                </div>
            </Paso>

            {errorGeneral && (
                <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                    {errorGeneral}
                </div>
            )}

            <div className="flex flex-col items-center gap-3 border-t border-gray-100 pt-8">
                <button
                    type="submit"
                    disabled={enviando}
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-600 px-10 py-4 font-semibold tracking-wide text-white uppercase shadow-lg shadow-red-600/20 transition-all duration-300 hover:bg-red-700 hover:shadow-xl disabled:cursor-wait disabled:opacity-70 sm:w-auto"
                >
                    {enviando ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Enviando…
                        </>
                    ) : (
                        <>
                            Enviar formulario
                            <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </>
                    )}
                </button>
                <p className="text-xs text-gray-400">
                    Los campos marcados con{' '}
                    <span className="text-red-600">*</span> son obligatorios.
                </p>
            </div>
        </form>
    );
}

// ============================================
// OFICINAS
// ============================================

/**
 * Mapa de Google incrustado: se puede mover, acercar y alejar como en el
 * propio Google Maps. La URL la resuelve el servidor y solo puede ser de Google.
 */
function MapaOficina({ oficina }: { oficina: Oficina }) {
    if (!oficina.mapa_url?.startsWith('https://')) {
        return null;
    }

    return (
        <div className="aspect-4/3 w-full overflow-hidden rounded-xl border border-gray-100 bg-gray-100">
            <iframe
                src={oficina.mapa_url}
                title={`Mapa de ${oficina.nombre}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                className="h-full w-full border-0"
            />
        </div>
    );
}

function DatoOficina({
    icono: Icono,
    titulo,
    children,
}: {
    icono: typeof MapPin;
    titulo: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50">
                <Icono className="h-4 w-4 text-red-600" />
            </div>
            <div className="min-w-0">
                <dt className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
                    {titulo}
                </dt>
                <dd className="mt-0.5 text-sm text-gray-700">{children}</dd>
            </div>
        </div>
    );
}

function TarjetaOficina({ oficina }: { oficina: Oficina }) {
    const ubicacionInterna = [
        oficina.edificio && `Edificio ${oficina.edificio}`,
        oficina.piso && `Piso ${oficina.piso}`,
        oficina.oficina && `Oficina ${oficina.oficina}`,
    ]
        .filter(Boolean)
        .join(', ');

    return (
        <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl">
            <header className="relative bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 px-6 py-6 text-center">
                <span className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-red-600 to-red-400" />
                <h3 className="text-2xl font-bold tracking-[0.15em] text-white uppercase">
                    {oficina.ciudad}
                </h3>
                {oficina.nombre.toLowerCase() !==
                    oficina.ciudad.toLowerCase() && (
                    <p className="mt-1 text-sm text-gray-400">
                        {oficina.nombre}
                    </p>
                )}
            </header>

            <div className="flex flex-1 flex-col gap-6 p-6">
                <dl className="space-y-5">
                    {oficina.responsable && (
                        <DatoOficina icono={UserRound} titulo="Responsable">
                            <span className="font-semibold text-gray-900">
                                {oficina.responsable.nombre}
                            </span>
                            {oficina.responsable.cargo && (
                                <span className="block text-gray-500">
                                    {oficina.responsable.cargo}
                                </span>
                            )}
                        </DatoOficina>
                    )}

                    <DatoOficina icono={MapPin} titulo="Dirección">
                        {oficina.direccion}
                        {ubicacionInterna && (
                            <span className="block">{ubicacionInterna}</span>
                        )}
                        {oficina.referencia && (
                            <span className="block text-gray-500">
                                {oficina.referencia}
                            </span>
                        )}
                    </DatoOficina>

                    {oficina.telefono && (
                        <DatoOficina icono={Phone} titulo="Teléfono">
                            <a
                                href={`tel:${oficina.telefono.replace(/[^\d+]/g, '')}`}
                                className="transition-colors hover:text-red-600"
                            >
                                {oficina.telefono}
                            </a>
                        </DatoOficina>
                    )}

                    {oficina.correo && (
                        <DatoOficina icono={Mail} titulo="Correo">
                            <a
                                href={`mailto:${oficina.correo}`}
                                className="break-all transition-colors hover:text-red-600"
                            >
                                {oficina.correo}
                            </a>
                        </DatoOficina>
                    )}
                </dl>

                <div className="mt-auto">
                    <MapaOficina oficina={oficina} />
                </div>
            </div>
        </article>
    );
}

function SeccionOficinas() {
    const [oficinas, setOficinas] = useState<Oficina[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        peticionJson<{ data: Oficina[] }>('/api/oficinas', 'GET')
            .then((respuesta) => setOficinas(respuesta.data))
            .catch(() => setError(true))
            .finally(() => setCargando(false));
    }, []);

    // Sin oficinas cargadas no tiene sentido mostrar un título vacío.
    if (!cargando && !error && oficinas.length === 0) {
        return null;
    }

    const columnas =
        oficinas.length >= 3
            ? 'md:grid-cols-2 xl:grid-cols-3'
            : oficinas.length === 2
              ? 'md:grid-cols-2'
              : 'mx-auto max-w-xl';

    return (
        <section className="bg-gray-50 py-16 md:py-20">
            <div className="container mx-auto px-6">
                <div className="mb-10 text-center md:mb-12">
                    <div className="mb-3 flex items-center justify-center gap-3">
                        <span className="h-px w-10 bg-red-600" />
                        <Building2 className="h-5 w-5 text-red-600" />
                        <span className="h-px w-10 bg-red-600" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-wide text-gray-900 uppercase md:text-4xl">
                        Nuestras <span className="text-red-600">oficinas</span>
                    </h2>
                </div>

                {cargando ? (
                    <div className="grid gap-8 md:grid-cols-2">
                        {[...Array(2)].map((_, indice) => (
                            <div
                                key={indice}
                                className="overflow-hidden rounded-2xl border border-gray-100 bg-white"
                            >
                                <div className="h-20 animate-pulse bg-gray-200" />
                                <div className="space-y-4 p-6">
                                    <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
                                    <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
                                    <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
                                    <div className="aspect-4/3 animate-pulse rounded-xl bg-gray-100" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <p className="text-center text-gray-500">
                        No pudimos cargar las oficinas. Recarga la página para
                        intentarlo de nuevo.
                    </p>
                ) : (
                    <div className={`grid gap-8 ${columnas}`}>
                        {oficinas.map((oficina) => (
                            <TarjetaOficina
                                key={oficina.id}
                                oficina={oficina}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

// ============================================
// PÁGINA
// ============================================
export default function ContactoPage() {
    return (
        <PublicLayout>
            <SeccionesDelModulo lugar="arriba" />

            {/* La cabecera es la sección «Portada de módulo», editable en el panel. */}
            <section className="bg-white pt-4 pb-16 md:pb-20">
                <div className="container mx-auto px-6">
                    <div className="mx-auto max-w-3xl">
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_10px_50px_rgba(0,0,0,0.08)] md:p-10">
                            <FormularioContacto />
                        </div>
                    </div>
                </div>
            </section>

            <SeccionOficinas />

            <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out both;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in { animation: none; }
        }
      `}</style>
            <SeccionesDelModulo lugar="abajo" />
        </PublicLayout>
    );
}
