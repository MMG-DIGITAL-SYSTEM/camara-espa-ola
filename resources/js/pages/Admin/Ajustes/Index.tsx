import { Head, useForm } from '@inertiajs/react';
import { ImagePlus } from 'lucide-react';
import { useState } from 'react';
import { SelectorDeMedios } from '@/components/admin/medios/selector-de-medios';
import { PageHeader } from '@/components/admin/page-header';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { update } from '@/routes/admin/ajustes';

type TipoCampo = 'texto' | 'textarea' | 'enlace' | 'imagen';

type Campo = {
    clave: string;
    grupo: string;
    etiqueta: string;
    tipo: TipoCampo;
    ayuda: string | null;
    valor: string;
};

type Valores = Record<string, string>;

function CampoDeAjuste({
    campo,
    valor,
    error,
    onCambio,
}: {
    campo: Campo;
    valor: string;
    error?: string;
    onCambio: (valor: string) => void;
}) {
    const [selectorAbierto, setSelectorAbierto] = useState(false);

    return (
        <div className="grid gap-1.5">
            <Label htmlFor={campo.clave}>{campo.etiqueta}</Label>

            {campo.tipo === 'textarea' ? (
                <textarea
                    id={campo.clave}
                    rows={3}
                    value={valor}
                    onChange={(evento) => onCambio(evento.target.value)}
                    className="w-full resize-y rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
            ) : campo.tipo === 'imagen' ? (
                <div className="space-y-2">
                    {valor && (
                        <div className="w-40 overflow-hidden rounded-md border bg-muted p-2">
                            <img
                                src={valor}
                                alt=""
                                className="h-12 w-full object-contain"
                            />
                        </div>
                    )}
                    <div className="flex gap-2">
                        <Input
                            id={campo.clave}
                            value={valor}
                            onChange={(evento) => onCambio(evento.target.value)}
                            className="flex-1"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setSelectorAbierto(true)}
                            aria-label="Elegir de la biblioteca"
                        >
                            <ImagePlus className="size-4" />
                        </Button>
                    </div>

                    <SelectorDeMedios
                        abierto={selectorAbierto}
                        onAbiertoChange={setSelectorAbierto}
                        onElegir={(medio) => onCambio(medio.url)}
                    />
                </div>
            ) : (
                <Input
                    id={campo.clave}
                    type={campo.tipo === 'enlace' ? 'url' : 'text'}
                    value={valor}
                    onChange={(evento) => onCambio(evento.target.value)}
                    placeholder={
                        campo.tipo === 'enlace' ? 'https://…' : undefined
                    }
                />
            )}

            {campo.ayuda && (
                <p className="text-xs text-muted-foreground">{campo.ayuda}</p>
            )}
            <InputError message={error} />
        </div>
    );
}

export default function AjustesIndex({ campos }: { campos: Campo[] }) {
    const formulario = useForm<Valores>(
        Object.fromEntries(campos.map((campo) => [campo.clave, campo.valor])),
    );

    // Se agrupan conservando el orden en que los declara el servidor.
    const grupos = campos.reduce<Record<string, Campo[]>>(
        (acumulado, campo) => {
            acumulado[campo.grupo] = [...(acumulado[campo.grupo] ?? []), campo];

            return acumulado;
        },
        {},
    );

    return (
        <>
            <Head title="Ajustes del sitio" />

            <PageHeader
                titulo="Ajustes del sitio"
                descripcion="Los datos que aparecen en el pie, en los bloques de contacto y en los buscadores."
            />

            <form
                onSubmit={(evento) => {
                    evento.preventDefault();
                    formulario.submit(update(), { preserveScroll: true });
                }}
                className="max-w-2xl space-y-6"
            >
                {Object.entries(grupos).map(([grupo, camposDelGrupo]) => (
                    <section
                        key={grupo}
                        className="space-y-4 rounded-xl border bg-card p-5"
                    >
                        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                            {grupo}
                        </h2>

                        {camposDelGrupo.map((campo) => (
                            <CampoDeAjuste
                                key={campo.clave}
                                campo={campo}
                                valor={formulario.data[campo.clave] ?? ''}
                                error={formulario.errors[campo.clave]}
                                onCambio={(valor) =>
                                    formulario.setData(campo.clave, valor)
                                }
                            />
                        ))}
                    </section>
                ))}

                <div className="flex items-center gap-3">
                    <Button type="submit" disabled={formulario.processing}>
                        Guardar ajustes
                    </Button>
                    {formulario.recentlySuccessful && (
                        <span className="text-sm text-muted-foreground">
                            Guardado.
                        </span>
                    )}
                </div>
            </form>
        </>
    );
}

AjustesIndex.layout = {
    migas: [{ titulo: 'Sistema' }, { titulo: 'Ajustes del sitio' }],
};
