import { Head, useForm } from '@inertiajs/react';
import { Check, Info, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/admin/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { update } from '@/routes/admin/roles';

type Rol = {
    id: number;
    nombre: string;
    descripcion: string | null;
    usuarios: number;
    accede_al_panel: boolean;
    es_administrador: boolean;
};

function FilaRol({ rol, alcance }: { rol: Rol; alcance?: string }) {
    const formulario = useForm({ descripcion: rol.descripcion ?? '' });
    const cambiada = formulario.data.descripcion !== (rol.descripcion ?? '');

    return (
        <li className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
            <span
                className={
                    rol.es_administrador
                        ? 'flex size-10 shrink-0 items-center justify-center rounded-lg bg-marca-suave text-marca'
                        : 'flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground'
                }
            >
                <ShieldCheck className="size-5" />
            </span>

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-medium">{rol.nombre}</h2>
                    {rol.accede_al_panel ? (
                        <Badge variant="secondary">Accede al panel</Badge>
                    ) : (
                        <Badge variant="outline">Solo sitio público</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                        {rol.usuarios === 1
                            ? '1 usuario'
                            : `${rol.usuarios} usuarios`}
                    </span>
                </div>

                {alcance && (
                    <p className="mt-1 text-sm text-muted-foreground">
                        {alcance}
                    </p>
                )}

                <form
                    onSubmit={(evento) => {
                        evento.preventDefault();
                        formulario.submit(update(rol.id), {
                            preserveScroll: true,
                        });
                    }}
                    className="mt-3 flex gap-2"
                >
                    <Input
                        value={formulario.data.descripcion}
                        onChange={(evento) =>
                            formulario.setData(
                                'descripcion',
                                evento.target.value,
                            )
                        }
                        placeholder="Nota interna sobre este rol"
                        aria-label={`Descripción del rol ${rol.nombre}`}
                    />
                    <Button
                        type="submit"
                        variant="outline"
                        size="icon"
                        disabled={!cambiada || formulario.processing}
                        aria-label="Guardar descripción"
                    >
                        <Check className="size-4" />
                    </Button>
                </form>
            </div>
        </li>
    );
}

export default function RolesIndex({
    roles,
    alcances,
}: {
    roles: Rol[];
    alcances: Record<string, string>;
}) {
    return (
        <>
            <Head title="Roles" />

            <PageHeader
                titulo="Roles"
                descripcion="Qué puede hacer cada tipo de cuenta dentro del panel."
            />

            <div className="mb-4 flex items-start gap-3 rounded-xl border border-marca/25 bg-marca-suave/40 p-4 text-sm">
                <Info className="mt-0.5 size-4 shrink-0 text-marca" />
                <p className="text-muted-foreground">
                    Los permisos van ligados al nombre del rol y están definidos
                    en el código, de modo que un rol inventado no concedería
                    ningún acceso. Por eso aquí solo se ajusta la descripción:
                    para cambiar qué puede hacer alguien, cámbiale el rol desde{' '}
                    <span className="font-medium text-foreground">
                        Usuarios
                    </span>
                    .
                </p>
            </div>

            <ul className="divide-y rounded-xl border bg-card">
                {roles.map((rol) => (
                    <FilaRol
                        key={rol.id}
                        rol={rol}
                        alcance={alcances[rol.nombre]}
                    />
                ))}
            </ul>
        </>
    );
}

RolesIndex.layout = {
    migas: [{ titulo: 'Sistema' }, { titulo: 'Roles' }],
};
