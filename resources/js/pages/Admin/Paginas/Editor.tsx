import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Check,
    FileStack,
    History,
    Loader2,
    Monitor,
    Redo2,
    Smartphone,
    Tablet,
    Undo2,
    Upload,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
    useCallback,
    useEffect,
    useMemo,
    useReducer,
    useRef,
    useState,
} from 'react';
import { toast } from 'sonner';
import type { AnchoElemento, ElementoLienzo, Seccion } from '@/blocks/tipos';
import { ArbolSecciones } from '@/components/admin/editor/arbol-secciones';
import { CatalogoBloques } from '@/components/admin/editor/catalogo-bloques';
import { CatalogoElementos } from '@/components/admin/editor/catalogo-elementos';
import { PanelHistorial } from '@/components/admin/editor/panel-historial';
import { PanelPropiedades } from '@/components/admin/editor/panel-propiedades';
import { VistaPrevia } from '@/components/admin/editor/vista-previa';
import type { Dispositivo } from '@/components/admin/editor/vista-previa';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useAreaPanel } from '@/hooks/use-area-panel';
import { useFlashToast } from '@/hooks/use-flash-toast';
import { ErrorDeValidacion, ErrorHttp, peticionJson } from '@/lib/http';
import { cn } from '@/lib/utils';
import {
    index as listaPaginas,
    borrador,
    publicar,
} from '@/routes/admin/paginas';
import {
    cargaUtil,
    elementosDe,
    firma,
    reducir,
    seccionDesdeServidor,
} from './estado';

type PaginaEditada = {
    id: number;
    titulo: string;
    slug: string;
    url: string;
    es_modulo: boolean;
    es_sistema: boolean;
    publicada: boolean;
    sin_publicar: boolean;
    publicada_el: string | null;
};

type Props = {
    pagina: PaginaEditada;
    secciones: Seccion[];
    datosBloques: Record<string, unknown>;
};

type EstadoGuardado = 'limpio' | 'pendiente' | 'guardando' | 'error';

const DISPOSITIVOS: {
    valor: Dispositivo;
    icono: LucideIcon;
    etiqueta: string;
}[] = [
    { valor: 'escritorio', icono: Monitor, etiqueta: 'Escritorio' },
    { valor: 'tablet', icono: Tablet, etiqueta: 'Tablet' },
    { valor: 'movil', icono: Smartphone, etiqueta: 'Móvil' },
];

const RETARDO_AUTOGUARDADO = 900;

/** Explica en palabras del usuario por qué no se guardó el borrador. */
function motivoDelFallo(error: unknown): string {
    if (error instanceof ErrorDeValidacion) {
        const primero = Object.values(error.errores).flat()[0];

        return `No se pudo guardar: ${primero ?? 'hay datos no válidos.'}`;
    }

    if (error instanceof ErrorHttp && error.estado === 419) {
        return 'Tu sesión caducó. Recarga la página para seguir guardando.';
    }

    if (error instanceof ErrorHttp && error.estado === 403) {
        return 'Tu cuenta ya no tiene permiso para editar páginas.';
    }

    return 'No se pudo guardar el borrador. Revisa tu conexión.';
}

function IndicadorGuardado({ estado }: { estado: EstadoGuardado }) {
    const textos: Record<EstadoGuardado, { icono: LucideIcon; texto: string }> =
        {
            limpio: { icono: Check, texto: 'Guardado' },
            pendiente: { icono: Loader2, texto: 'Sin guardar' },
            guardando: { icono: Loader2, texto: 'Guardando…' },
            error: { icono: AlertCircle, texto: 'No se pudo guardar' },
        };

    const { icono: Icono, texto } = textos[estado];

    return (
        <span
            className={cn(
                'flex items-center gap-1.5 text-xs',
                estado === 'error'
                    ? 'text-destructive'
                    : 'text-muted-foreground',
            )}
        >
            <Icono
                className={cn(
                    'size-3.5',
                    estado === 'guardando' && 'animate-spin',
                )}
            />
            {texto}
        </span>
    );
}

export default function Editor({ pagina, secciones, datosBloques }: Props) {
    const [historial, despachar] = useReducer(reducir, undefined, () => ({
        presente: {
            secciones: secciones.map(seccionDesdeServidor),
            seleccion: null,
            seleccionElemento: null,
        },
        pasado: [],
        futuro: [],
    }));

    const {
        secciones: actuales,
        seleccion,
        seleccionElemento,
    } = historial.presente;

    const [dispositivo, setDispositivo] = useState<Dispositivo>('escritorio');
    const [catalogoAbierto, setCatalogoAbierto] = useState(false);
    // Qué lienzo recibirá la pieza que se elija del catálogo de elementos.
    const [destinoDeElemento, setDestinoDeElemento] = useState<string | null>(
        null,
    );
    const [historialAbierto, setHistorialAbierto] = useState(false);
    const [estadoGuardado, setEstadoGuardado] =
        useState<EstadoGuardado>('limpio');
    const [sinPublicar, setSinPublicar] = useState(pagina.sin_publicar);

    // Firma de lo último confirmado por el servidor.
    const guardado = useRef(firma(actuales));
    // Guardado en vuelo: publicar tiene que esperarlo, no saltárselo.
    const enVuelo = useRef<Promise<boolean> | null>(null);

    // El editor no usa el layout del panel: recoge aquí los avisos del
    // servidor y adopta por su cuenta los colores del panel.
    useFlashToast();
    useAreaPanel();

    const seccionActiva = useMemo(
        () => actuales.find((s) => s.clave === seleccion) ?? null,
        [actuales, seleccion],
    );

    const elementoActivo = useMemo<ElementoLienzo | null>(() => {
        if (!seccionActiva || !seleccionElemento) {
            return null;
        }

        return (
            elementosDe(seccionActiva).find(
                (pieza) => pieza.clave === seleccionElemento,
            ) ?? null
        );
    }, [seccionActiva, seleccionElemento]);

    const indiceDe = useCallback(
        (clave: string) => actuales.findIndex((s) => s.clave === clave),
        [actuales],
    );

    // Se memorizan porque la vista previa los reparte por contexto a cada
    // pieza del lienzo: si cambiaran en cada render, todas se repintarían.
    const seleccionarElemento = useCallback(
        (seccion: string, clave: string) =>
            despachar({ tipo: 'seleccionarElemento', seccion, clave }),
        [],
    );

    const moverElemento = useCallback(
        (seccion: string, desde: number, hasta: number) =>
            despachar({ tipo: 'moverElemento', seccion, desde, hasta }),
        [],
    );

    const duplicarElemento = useCallback(
        (seccion: string, clave: string) =>
            despachar({ tipo: 'duplicarElemento', seccion, clave }),
        [],
    );

    const eliminarElemento = useCallback(
        (seccion: string, clave: string) =>
            despachar({ tipo: 'eliminarElemento', seccion, clave }),
        [],
    );

    /**
     * Guarda el borrador y dice si el servidor lo confirmó.
     *
     * Si ya hay un guardado en vuelo, lo espera y vuelve a comprobar: lo
     * escrito mientras tanto también tiene que llegar al servidor.
     */
    const guardar = useCallback(async (): Promise<boolean> => {
        if (enVuelo.current) {
            await enVuelo.current;
        }

        const instantanea = firma(actuales);

        if (instantanea === guardado.current) {
            setEstadoGuardado('limpio');

            return true;
        }

        setEstadoGuardado('guardando');

        const peticion = peticionJson<{
            mapa: Record<string, number>;
            sin_publicar: boolean;
        }>(borrador(pagina.slug).url, 'PUT', {
            secciones: cargaUtil(actuales),
        })
            .then((respuesta) => {
                guardado.current = instantanea;
                setSinPublicar(respuesta.sin_publicar);
                // Las secciones nuevas reciben aquí su id definitivo.
                despachar({ tipo: 'asignarIds', mapa: respuesta.mapa });
                setEstadoGuardado('limpio');

                return true;
            })
            .catch((error: unknown) => {
                setEstadoGuardado('error');
                toast.error(motivoDelFallo(error));

                return false;
            })
            .finally(() => {
                enVuelo.current = null;
            });

        enVuelo.current = peticion;

        return peticion;
    }, [actuales, pagina.slug]);

    // Autoguardado con retardo: se reinicia con cada cambio.
    useEffect(() => {
        if (firma(actuales) === guardado.current) {
            setEstadoGuardado('limpio');

            return;
        }

        setEstadoGuardado('pendiente');

        const temporizador = setTimeout(guardar, RETARDO_AUTOGUARDADO);

        return () => clearTimeout(temporizador);
    }, [actuales, guardar]);

    // Avisa si se intenta salir con cambios sin guardar.
    useEffect(() => {
        const alSalir = (evento: BeforeUnloadEvent) => {
            if (firma(actuales) !== guardado.current) {
                evento.preventDefault();
            }
        };

        window.addEventListener('beforeunload', alSalir);

        return () => window.removeEventListener('beforeunload', alSalir);
    }, [actuales]);

    useEffect(() => {
        const alPulsar = (evento: KeyboardEvent) => {
            if (!(evento.metaKey || evento.ctrlKey)) {
                return;
            }

            const tecla = evento.key.toLowerCase();

            if (tecla === 'z') {
                evento.preventDefault();
                despachar({ tipo: evento.shiftKey ? 'rehacer' : 'deshacer' });
            }

            if (tecla === 's') {
                evento.preventDefault();
                void guardar();
            }
        };

        document.addEventListener('keydown', alPulsar);

        return () => document.removeEventListener('keydown', alPulsar);
    }, [guardar]);

    const publicarPagina = async () => {
        /*
         * Publicar congela lo que hay en el servidor, no lo que se ve aquí.
         * Si el guardado falla, publicar dejaría en el sitio el borrador
         * anterior mientras el editor enseña el nuevo: mejor no publicar.
         */
        if (!(await guardar())) {
            toast.error(
                'No se publicó: los últimos cambios no se pudieron guardar.',
            );

            return;
        }

        router.post(
            publicar(pagina.slug).url,
            {},
            {
                preserveScroll: true,
                onSuccess: () => setSinPublicar(false),
            },
        );
    };

    return (
        <div className="flex h-svh flex-col overflow-hidden bg-background">
            <Head title={`Editando: ${pagina.titulo}`} />

            {/* ---------- Barra superior ---------- */}
            <header className="relative flex h-14 shrink-0 items-center gap-3 border-b bg-card/80 px-3 backdrop-blur-sm">
                <span
                    aria-hidden
                    className="degradado-marca absolute inset-x-0 top-0 h-0.5"
                />

                <Button variant="ghost" size="sm" asChild>
                    <Link href={listaPaginas()}>
                        <ArrowLeft className="size-4" />
                        <span className="hidden sm:inline">Páginas</span>
                    </Link>
                </Button>

                <Separator orientation="vertical" className="h-5" />

                <div className="flex min-w-0 items-center gap-2.5">
                    <span className="degradado-marca hidden size-8 shrink-0 items-center justify-center rounded-lg text-white shadow-md shadow-marca/25 sm:flex">
                        <FileStack className="size-4" />
                    </span>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                            {pagina.titulo}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                            /{pagina.slug}
                        </p>
                    </div>
                </div>

                <div className="ml-2 flex items-center gap-0.5">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        title="Deshacer (Ctrl+Z)"
                        aria-label="Deshacer"
                        disabled={historial.pasado.length === 0}
                        onClick={() => despachar({ tipo: 'deshacer' })}
                    >
                        <Undo2 className="size-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        title="Rehacer (Ctrl+Shift+Z)"
                        aria-label="Rehacer"
                        disabled={historial.futuro.length === 0}
                        onClick={() => despachar({ tipo: 'rehacer' })}
                    >
                        <Redo2 className="size-4" />
                    </Button>
                </div>

                <div className="mx-auto hidden md:block">
                    <ToggleGroup
                        type="single"
                        value={dispositivo}
                        onValueChange={(valor) =>
                            valor && setDispositivo(valor as Dispositivo)
                        }
                        className="rounded-lg border bg-muted/50 p-0.5"
                    >
                        {DISPOSITIVOS.map(
                            ({ valor, icono: Icono, etiqueta }) => (
                                <ToggleGroupItem
                                    key={valor}
                                    value={valor}
                                    title={etiqueta}
                                    aria-label={etiqueta}
                                    className="size-7 rounded-md data-[state=on]:degradado-marca data-[state=on]:text-white data-[state=on]:shadow-sm"
                                >
                                    <Icono className="size-3.5" />
                                </ToggleGroupItem>
                            ),
                        )}
                    </ToggleGroup>
                </div>

                <div className="ml-auto flex items-center gap-2">
                    <IndicadorGuardado estado={estadoGuardado} />

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setHistorialAbierto(true)}
                    >
                        <History className="size-4" />
                        <span className="hidden lg:inline">Historial</span>
                    </Button>

                    <Button variant="outline" size="sm" asChild>
                        <a
                            href={`${pagina.url}?borrador=1`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Ver
                        </a>
                    </Button>

                    <Button
                        size="sm"
                        onClick={publicarPagina}
                        className="degradado-marca relative text-white shadow-md shadow-marca/30 transition-all hover:-translate-y-px hover:shadow-lg hover:brightness-110"
                    >
                        <Upload className="size-4" />
                        Publicar
                        {sinPublicar && (
                            <span
                                aria-label="Hay cambios sin publicar"
                                className="absolute -top-1 -right-1 size-2.5 rounded-full bg-amber-400 ring-2 ring-background"
                            />
                        )}
                    </Button>
                </div>
            </header>

            {/* ---------- Tres columnas ---------- */}
            <div className="flex min-h-0 flex-1">
                <aside className="hidden w-64 shrink-0 border-r bg-card lg:block">
                    <ArbolSecciones
                        secciones={actuales}
                        seleccion={seleccion}
                        seleccionElemento={seleccionElemento}
                        onSeleccionar={(clave) =>
                            despachar({ tipo: 'seleccionar', clave })
                        }
                        onMover={(desde, hasta) =>
                            despachar({ tipo: 'mover', desde, hasta })
                        }
                        onAlternarVisible={(clave) =>
                            despachar({ tipo: 'alternarVisible', clave })
                        }
                        onAnadir={() => setCatalogoAbierto(true)}
                        onSeleccionarElemento={seleccionarElemento}
                        onMoverElemento={moverElemento}
                        onAnadirElemento={setDestinoDeElemento}
                    />
                </aside>

                <main className="min-w-0 flex-1">
                    <VistaPrevia
                        secciones={actuales}
                        seleccion={seleccion}
                        seleccionElemento={seleccionElemento}
                        dispositivo={dispositivo}
                        datos={datosBloques}
                        urlModulo={pagina.es_modulo ? pagina.url : null}
                        onSeleccionar={(clave) =>
                            despachar({ tipo: 'seleccionar', clave })
                        }
                        onSubir={(clave) =>
                            despachar({
                                tipo: 'mover',
                                desde: indiceDe(clave),
                                hasta: indiceDe(clave) - 1,
                            })
                        }
                        onBajar={(clave) =>
                            despachar({
                                tipo: 'mover',
                                desde: indiceDe(clave),
                                hasta: indiceDe(clave) + 1,
                            })
                        }
                        onDuplicar={(clave) =>
                            despachar({ tipo: 'duplicar', clave })
                        }
                        onOcultar={(clave) =>
                            despachar({ tipo: 'alternarVisible', clave })
                        }
                        onEliminar={(clave) =>
                            despachar({ tipo: 'eliminar', clave })
                        }
                        onSeleccionarElemento={seleccionarElemento}
                        onMoverElemento={moverElemento}
                        onDuplicarElemento={duplicarElemento}
                        onEliminarElemento={eliminarElemento}
                    />
                </main>

                <aside className="hidden w-80 shrink-0 border-l bg-card xl:block">
                    <PanelPropiedades
                        seccion={seccionActiva}
                        elementoActivo={elementoActivo}
                        onCambiarDato={(campo, valor) =>
                            seleccion &&
                            despachar({
                                tipo: 'cambiarDato',
                                clave: seleccion,
                                campo,
                                valor,
                            })
                        }
                        onCambiarEstilo={(campo, valor) =>
                            seleccion &&
                            despachar({
                                tipo: 'cambiarEstilo',
                                clave: seleccion,
                                campo,
                                valor,
                            })
                        }
                        onRenombrar={(nombre) =>
                            seleccion &&
                            despachar({
                                tipo: 'renombrar',
                                clave: seleccion,
                                nombre,
                            })
                        }
                        onDuplicar={() =>
                            seleccion &&
                            despachar({ tipo: 'duplicar', clave: seleccion })
                        }
                        onEliminar={() =>
                            seleccion &&
                            despachar({ tipo: 'eliminar', clave: seleccion })
                        }
                        onSeleccionarElemento={(clave) =>
                            seleccion && seleccionarElemento(seleccion, clave)
                        }
                        onAnadirElemento={() => setDestinoDeElemento(seleccion)}
                        onCambiarDatoElemento={(campo, valor) =>
                            seleccion &&
                            seleccionElemento &&
                            despachar({
                                tipo: 'cambiarDatoElemento',
                                seccion: seleccion,
                                clave: seleccionElemento,
                                campo,
                                valor,
                            })
                        }
                        onCambiarAnchoElemento={(ancho: AnchoElemento) =>
                            seleccion &&
                            seleccionElemento &&
                            despachar({
                                tipo: 'cambiarAnchoElemento',
                                seccion: seleccion,
                                clave: seleccionElemento,
                                ancho,
                            })
                        }
                        onDuplicarElemento={() =>
                            seleccion &&
                            seleccionElemento &&
                            duplicarElemento(seleccion, seleccionElemento)
                        }
                        onEliminarElemento={() =>
                            seleccion &&
                            seleccionElemento &&
                            eliminarElemento(seleccion, seleccionElemento)
                        }
                        onVolverALaSeccion={() =>
                            seleccion &&
                            despachar({
                                tipo: 'seleccionarElemento',
                                seccion: seleccion,
                                clave: null,
                            })
                        }
                    />
                </aside>
            </div>

            <CatalogoBloques
                abierto={catalogoAbierto}
                onAbiertoChange={setCatalogoAbierto}
                onElegir={(claveBloque) =>
                    despachar({
                        tipo: 'anadir',
                        bloque: claveBloque,
                        despuesDe: seleccion,
                    })
                }
            />

            <CatalogoElementos
                abierto={destinoDeElemento !== null}
                onAbiertoChange={(abierto) =>
                    !abierto && setDestinoDeElemento(null)
                }
                onElegir={(claveElemento) =>
                    destinoDeElemento &&
                    despachar({
                        tipo: 'anadirElemento',
                        seccion: destinoDeElemento,
                        elemento: claveElemento,
                    })
                }
            />

            <PanelHistorial
                abierto={historialAbierto}
                onAbiertoChange={setHistorialAbierto}
                slug={pagina.slug}
            />
        </div>
    );
}
