// resources/js/pages/Public/FormularioAfiliacion.tsx
import { Head } from '@inertiajs/react';
import {
    AlertCircle,
    Building2,
    CheckCircle2,
    Loader2,
    Send,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
    CampoAreaTexto,
    CampoTexto,
    enfocarPrimerError,
    erroresPorCampo,
} from '@/components/public/campos-formulario';
import { SeccionesDelModulo } from '@/components/public/secciones-del-modulo';
import PublicLayout from '@/layouts/PublicLayout';
import { ErrorDeValidacion, ErrorHttp, peticionJson } from '@/lib/http';

// ============================================
// DATOS
// ============================================

/**
 * Los nombres son los de las columnas de `solicitudes_afiliacion`, en el
 * orden en que aparecen en pantalla: se enfoca el primero que tenga error.
 */
const CAMPOS = [
    'nombre_razon_social',
    'representante_legal',
    'escritura_constitucion',
    'fecha',
    'nit',
    'direccion',
    'ciudad',
    'telefono',
    'fax',
    'casilla',
    'correo_electronico',
    'pagina_web',
    'representante_camara',
    'cargo',
    'servicios_productos',
] as const;

type Campo = (typeof CAMPOS)[number];
type DatosSolicitud = Record<Campo, string>;
type Errores = Partial<Record<Campo, string>>;

const DATOS_VACIOS = Object.fromEntries(
    CAMPOS.map((campo) => [campo, '']),
) as DatosSolicitud;

const MAXIMO_SERVICIOS = 5000;

/** Hoy en formato AAAA-MM-DD, el tope del selector de fecha. */
function hoy(): string {
    const fecha = new Date();
    fecha.setMinutes(fecha.getMinutes() - fecha.getTimezoneOffset());

    return fecha.toISOString().slice(0, 10);
}

// ============================================
// PIEZAS
// ============================================
function Bloque({
    titulo,
    children,
}: {
    titulo: string;
    children: React.ReactNode;
}) {
    return (
        <fieldset className="space-y-5">
            <legend className="mb-5 flex w-full items-center gap-3">
                <span className="h-5 w-1 rounded-full bg-red-600" />
                <span className="text-sm font-bold tracking-[0.15em] text-gray-900 uppercase">
                    {titulo}
                </span>
                <span className="h-px flex-1 bg-gray-100" />
            </legend>
            {children}
        </fieldset>
    );
}

// ============================================
// FORMULARIO
// ============================================
function Formulario() {
    const [datos, setDatos] = useState<DatosSolicitud>(DATOS_VACIOS);
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

    const cambiar = (campo: Campo) => (valor: string) => {
        setDatos((anteriores) => ({ ...anteriores, [campo]: valor }));

        // El error de un campo desaparece en cuanto se corrige.
        if (errores[campo]) {
            setErrores((anteriores) => ({ ...anteriores, [campo]: undefined }));
        }
    };

    /** Props comunes de cada campo: valor, error y manejador. */
    const campo = (nombre: Campo) => ({
        campo: nombre,
        valor: datos[nombre],
        error: errores[nombre],
        onCambio: cambiar(nombre),
    });

    const enviar = async (evento: React.FormEvent) => {
        evento.preventDefault();

        // El botón ya queda desactivado, pero un Enter repetido podría colarse
        // antes del re-render.
        if (enviando) {
            return;
        }

        setErrorGeneral(null);
        setEnviando(true);

        try {
            const respuesta = await peticionJson<{ message: string }>(
                '/api/solicitudes-afiliacion',
                'POST',
                datos,
            );

            setDatos(DATOS_VACIOS);
            setErrores({});
            setConfirmacion(respuesta.message);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            if (error instanceof ErrorDeValidacion) {
                const conError = erroresPorCampo(error) as Errores;

                setErrores(conError);
                enfocarPrimerError(formularioRef.current, CAMPOS, conError);
            } else if (error instanceof ErrorHttp && error.estado === 429) {
                setErrorGeneral(
                    'Ya se enviaron varias solicitudes desde esta conexión. Espere un momento antes de volver a intentarlo.',
                );
            } else {
                setErrorGeneral(
                    'No pudimos enviar su solicitud. Revise su conexión e inténtelo de nuevo.',
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
                className="flex flex-col items-center px-6 py-12 text-center focus:outline-none md:py-16"
            >
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
                    <CheckCircle2 className="h-10 w-10 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                    Solicitud enviada
                </h2>
                <p className="mt-3 max-w-md text-gray-600">{confirmacion}</p>
                <button
                    type="button"
                    onClick={() => setConfirmacion(null)}
                    className="mt-8 inline-flex items-center gap-2 rounded-full border border-red-200 px-6 py-2.5 font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                    Enviar otra solicitud
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
            <Bloque titulo="Datos de la empresa">
                <CampoTexto
                    {...campo('nombre_razon_social')}
                    etiqueta="Nombre o Razón Social"
                    autoComplete="organization"
                    maxLength={255}
                />
                <CampoTexto
                    {...campo('representante_legal')}
                    etiqueta="Representante(s) Legal(es)"
                    placeholder="Si son varios, sepárelos con comas"
                    maxLength={255}
                />
                <div className="grid gap-5 sm:grid-cols-2">
                    <CampoTexto
                        {...campo('escritura_constitucion')}
                        etiqueta="Escritura de Constitución N°"
                        maxLength={255}
                    />
                    <CampoTexto
                        {...campo('fecha')}
                        etiqueta="Fecha"
                        type="date"
                        max={hoy()}
                        obligatorio={false}
                    />
                </div>
                <CampoTexto
                    {...campo('nit')}
                    etiqueta="NIT"
                    inputMode="numeric"
                    obligatorio={false}
                    maxLength={30}
                />
            </Bloque>

            <Bloque titulo="Ubicación y contacto">
                <CampoTexto
                    {...campo('direccion')}
                    etiqueta="Dirección actual"
                    autoComplete="street-address"
                    maxLength={1000}
                />
                <div className="grid gap-5 sm:grid-cols-2">
                    <CampoTexto
                        {...campo('ciudad')}
                        etiqueta="Ciudad"
                        autoComplete="address-level2"
                        maxLength={255}
                    />
                    <CampoTexto
                        {...campo('telefono')}
                        etiqueta="Teléfono"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="+591 2 2000000"
                        maxLength={20}
                    />
                    <CampoTexto
                        {...campo('fax')}
                        etiqueta="Fax"
                        type="tel"
                        inputMode="tel"
                        obligatorio={false}
                        maxLength={20}
                    />
                    <CampoTexto
                        {...campo('casilla')}
                        etiqueta="Casilla"
                        maxLength={255}
                    />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                    <CampoTexto
                        {...campo('correo_electronico')}
                        etiqueta="Correo-e"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="contacto@empresa.com"
                        maxLength={255}
                    />
                    <CampoTexto
                        {...campo('pagina_web')}
                        etiqueta="Página web"
                        inputMode="url"
                        autoComplete="url"
                        placeholder="www.empresa.com"
                        maxLength={255}
                    />
                </div>
            </Bloque>

            <Bloque titulo="Representante ante la Cámara">
                <div className="grid gap-5 sm:grid-cols-2">
                    <CampoTexto
                        {...campo('representante_camara')}
                        etiqueta="Representante ante la Cámara"
                        autoComplete="name"
                        maxLength={255}
                    />
                    <CampoTexto
                        {...campo('cargo')}
                        etiqueta="Cargo"
                        autoComplete="organization-title"
                        maxLength={255}
                    />
                </div>
            </Bloque>

            <Bloque titulo="Servicios/Productos que ofrece">
                <CampoAreaTexto
                    {...campo('servicios_productos')}
                    etiqueta="Describa los servicios o productos de la empresa"
                    maximo={MAXIMO_SERVICIOS}
                    filas={6}
                />
            </Bloque>

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
// PÁGINA
// ============================================
export default function FormularioAfiliacionPage() {
    return (
        <PublicLayout>
            <Head title="Formulario de afiliación" />
            <SeccionesDelModulo lugar="arriba" />

            <section className="bg-gray-50 py-16 md:py-20">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="mx-auto max-w-3xl">
                        <div className="mb-10 text-center md:mb-12">
                            <div className="mb-4 flex items-center justify-center gap-3">
                                <span className="h-px w-10 bg-red-600" />
                                <Building2 className="h-5 w-5 text-red-600" />
                                <span className="h-px w-10 bg-red-600" />
                            </div>
                            <h1 className="text-3xl font-bold tracking-wide text-gray-900 uppercase md:text-4xl">
                                Formulario de{' '}
                                <span className="text-red-600">afiliación</span>
                            </h1>
                            <p className="mx-auto mt-4 max-w-xl leading-relaxed text-gray-600">
                                Complete los datos de su empresa. La Cámara
                                revisará la solicitud y se pondrá en contacto
                                con usted.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_10px_50px_rgba(0,0,0,0.08)] md:p-10">
                            <Formulario />
                        </div>
                    </div>
                </div>
            </section>

            <SeccionesDelModulo lugar="abajo" />
        </PublicLayout>
    );
}
