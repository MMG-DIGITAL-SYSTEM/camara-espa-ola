import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { peticionJson } from '@/lib/http';
import { listar } from '@/routes/admin/medios';
import { RejillaMedios, SinMedios } from './rejilla-medios';
import type { Medio, MediosPaginados } from './rejilla-medios';
import { ZonaDeSubida } from './zona-de-subida';

/**
 * Elegir un archivo de la biblioteca sin salir de donde estabas.
 *
 * Lo abre el campo `imagen` del editor de páginas. El listado se pide en JSON
 * para no provocar una visita de Inertia que recargaría el editor entero.
 */
export function SelectorDeMedios({
    abierto,
    onAbiertoChange,
    onElegir,
    soloImagenes = true,
}: {
    abierto: boolean;
    onAbiertoChange: (abierto: boolean) => void;
    onElegir: (medio: Medio) => void;
    soloImagenes?: boolean;
}) {
    return (
        <Dialog open={abierto} onOpenChange={onAbiertoChange}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Biblioteca de medios</DialogTitle>
                    <DialogDescription>
                        Elige un archivo ya subido o añade uno nuevo.
                    </DialogDescription>
                </DialogHeader>

                {/* Se monta al abrir: la búsqueda empieza siempre limpia. */}
                {abierto && (
                    <Contenido
                        soloImagenes={soloImagenes}
                        onElegir={(medio) => {
                            onElegir(medio);
                            onAbiertoChange(false);
                        }}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}

function Contenido({
    soloImagenes,
    onElegir,
}: {
    soloImagenes: boolean;
    onElegir: (medio: Medio) => void;
}) {
    const [buscar, setBuscar] = useState('');
    const [medios, setMedios] = useState<Medio[] | null>(null);
    const [recarga, setRecarga] = useState(0);

    useEffect(() => {
        const control = new AbortController();
        // Se espera a que deje de teclear antes de consultar.
        const temporizador = setTimeout(() => {
            peticionJson<MediosPaginados>(
                listar({
                    query: {
                        buscar: buscar || undefined,
                        tipo: soloImagenes ? 'imagenes' : undefined,
                    },
                }).url,
                'GET',
                undefined,
                control.signal,
            )
                .then((respuesta) => setMedios(respuesta.data))
                .catch(() => setMedios([]));
        }, 250);

        return () => {
            clearTimeout(temporizador);
            control.abort();
        };
    }, [buscar, soloImagenes, recarga]);

    return (
        <div className="space-y-4">
            <ZonaDeSubida onSubido={() => setRecarga((n) => n + 1)} />

            <div className="relative">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={buscar}
                    onChange={(evento) => setBuscar(evento.target.value)}
                    placeholder="Buscar por nombre o descripción"
                    className="pl-9"
                    aria-label="Buscar en la biblioteca"
                />
            </div>

            <div className="max-h-[50vh] overflow-y-auto">
                {medios === null ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, indice) => (
                            <Skeleton key={indice} className="aspect-square" />
                        ))}
                    </div>
                ) : (
                    <RejillaMedios
                        medios={medios}
                        onElegir={onElegir}
                        vacio={
                            <SinMedios
                                mensaje={
                                    buscar
                                        ? `Nada coincide con «${buscar}».`
                                        : 'La biblioteca está vacía. Sube el primer archivo.'
                                }
                            />
                        }
                    />
                )}
            </div>
        </div>
    );
}
