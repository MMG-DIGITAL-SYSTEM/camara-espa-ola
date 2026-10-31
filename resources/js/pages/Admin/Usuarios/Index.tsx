import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Search, Trash2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { DataTable, Paginacion } from '@/components/admin/data-table';
import type { Columna, Paginado } from '@/components/admin/data-table';
import { EmptyState } from '@/components/admin/empty-state';
import { PageHeader } from '@/components/admin/page-header';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { destroy, index, store, update } from '@/routes/admin/usuarios';

type Usuario = {
    id: number;
    name: string;
    email: string;
    activo: boolean;
    rol_id: number | null;
    rol: string | null;
    socio_id: number | null;
    empresa: string | null;
    ultimo_acceso: string | null;
    creado: string | null;
    es_usted: boolean;
};

type Rol = { id: number; nombre: string; descripcion: string | null };

type Socio = { id: number; nombre: string };

type Props = {
    usuarios: Paginado<Usuario>;
    roles: Rol[];
    socios: Socio[];
    filtros: { buscar?: string; rol?: string };
};

const SIN_CAMBIO = '';

/** Rol más restringido: el que se propone para una cuenta nueva. */
function rolPorDefecto(roles: Rol[]): string {
    return String(
        (roles.find((rol) => rol.nombre === 'Usuario') ?? roles.at(-1))?.id ??
            '',
    );
}

function DialogoUsuario({
    usuario,
    roles,
    socios,
    abierto,
    onAbiertoChange,
}: {
    usuario: Usuario | null;
    roles: Rol[];
    socios: Socio[];
    abierto: boolean;
    onAbiertoChange: (abierto: boolean) => void;
}) {
    const esEdicion = usuario !== null;

    const formulario = useForm({
        name: '',
        email: '',
        rol_id: rolPorDefecto(roles),
        socio_id: '',
        activo: true,
        password: SIN_CAMBIO,
        password_confirmation: SIN_CAMBIO,
    });

    // Recarga los valores cada vez que se abre el diálogo.
    useEffect(() => {
        if (!abierto) {
            return;
        }

        formulario.setDefaults({
            name: usuario?.name ?? '',
            email: usuario?.email ?? '',
            rol_id: usuario?.rol_id
                ? String(usuario.rol_id)
                : rolPorDefecto(roles),
            socio_id: usuario?.socio_id ? String(usuario.socio_id) : '',
            activo: usuario?.activo ?? true,
            password: SIN_CAMBIO,
            password_confirmation: SIN_CAMBIO,
        });
        formulario.reset();
        formulario.clearErrors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [abierto, usuario]);

    const esCuentaDeEmpresa =
        roles.find((rol) => String(rol.id) === formulario.data.rol_id)
            ?.nombre === 'Empresa';

    const enviar = (evento: React.FormEvent) => {
        evento.preventDefault();

        const opciones = {
            preserveScroll: true,
            onSuccess: () => onAbiertoChange(false),
        };

        if (esEdicion) {
            formulario.submit(update(usuario.id), opciones);
        } else {
            formulario.submit(store(), opciones);
        }
    };

    return (
        <Dialog open={abierto} onOpenChange={onAbiertoChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {esEdicion ? 'Editar usuario' : 'Nuevo usuario'}
                    </DialogTitle>
                    <DialogDescription>
                        {esEdicion
                            ? 'Deja la contraseña en blanco para conservar la actual.'
                            : 'La persona podrá entrar con el correo y la contraseña que definas.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={enviar} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input
                            id="name"
                            value={formulario.data.name}
                            onChange={(evento) =>
                                formulario.setData('name', evento.target.value)
                            }
                            autoComplete="name"
                            required
                        />
                        <InputError message={formulario.errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formulario.data.email}
                            onChange={(evento) =>
                                formulario.setData('email', evento.target.value)
                            }
                            autoComplete="email"
                            required
                        />
                        <InputError message={formulario.errors.email} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="rol_id">Rol</Label>
                            <Select
                                value={formulario.data.rol_id}
                                onValueChange={(valor) =>
                                    formulario.setData('rol_id', valor)
                                }
                            >
                                <SelectTrigger id="rol_id">
                                    <SelectValue placeholder="Elige un rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((rol) => (
                                        <SelectItem
                                            key={rol.id}
                                            value={String(rol.id)}
                                        >
                                            {rol.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={formulario.errors.rol_id} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="activo">Estado</Label>
                            <Select
                                value={formulario.data.activo ? '1' : '0'}
                                onValueChange={(valor) =>
                                    formulario.setData('activo', valor === '1')
                                }
                            >
                                <SelectTrigger id="activo">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Activo</SelectItem>
                                    <SelectItem value="0">
                                        Desactivado
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={formulario.errors.activo} />
                        </div>
                    </div>

                    {esCuentaDeEmpresa && (
                        <div className="grid gap-2">
                            <Label htmlFor="socio_id">Empresa afiliada</Label>
                            <Select
                                value={formulario.data.socio_id}
                                onValueChange={(valor) =>
                                    formulario.setData('socio_id', valor)
                                }
                            >
                                <SelectTrigger id="socio_id">
                                    <SelectValue placeholder="Elige el socio que representa" />
                                </SelectTrigger>
                                <SelectContent>
                                    {socios.map((socio) => (
                                        <SelectItem
                                            key={socio.id}
                                            value={String(socio.id)}
                                        >
                                            {socio.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                La cuenta publicará ofertas de empleo en nombre
                                de este socio.
                            </p>
                            <InputError message={formulario.errors.socio_id} />
                        </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="password">
                                Contraseña
                                {esEdicion && (
                                    <span className="ml-1 font-normal text-muted-foreground">
                                        (opcional)
                                    </span>
                                )}
                            </Label>
                            <PasswordInput
                                id="password"
                                value={formulario.data.password}
                                onChange={(evento) =>
                                    formulario.setData(
                                        'password',
                                        evento.target.value,
                                    )
                                }
                                autoComplete="new-password"
                                required={!esEdicion}
                            />
                            <InputError message={formulario.errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">
                                Repetir contraseña
                            </Label>
                            <PasswordInput
                                id="password_confirmation"
                                value={formulario.data.password_confirmation}
                                onChange={(evento) =>
                                    formulario.setData(
                                        'password_confirmation',
                                        evento.target.value,
                                    )
                                }
                                autoComplete="new-password"
                                required={!esEdicion}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onAbiertoChange(false)}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={formulario.processing}>
                            {esEdicion ? 'Guardar cambios' : 'Crear usuario'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function UsuariosIndex({
    usuarios,
    roles,
    socios,
    filtros,
}: Props) {
    const [buscar, setBuscar] = useState(filtros.buscar ?? '');
    const [editando, setEditando] = useState<Usuario | null>(null);
    const [dialogoAbierto, setDialogoAbierto] = useState(false);
    const [aEliminar, setAEliminar] = useState<Usuario | null>(null);

    const filtrar = (cambios: Record<string, string | undefined>) => {
        router.get(
            index().url,
            { buscar, rol: filtros.rol, ...cambios },
            { preserveState: true, replace: true },
        );
    };

    const columnas: Columna<Usuario>[] = [
        {
            clave: 'name',
            titulo: 'Usuario',
            render: (usuario) => (
                <div className="min-w-0">
                    <p className="flex items-center gap-2 font-medium">
                        <span className="truncate">{usuario.name}</span>
                        {usuario.es_usted && (
                            <Badge variant="secondary" className="shrink-0">
                                Tú
                            </Badge>
                        )}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                        {usuario.email}
                    </p>
                </div>
            ),
        },
        {
            clave: 'rol',
            titulo: 'Rol',
            render: (usuario) => (
                <div className="min-w-0">
                    <p>{usuario.rol ?? '—'}</p>
                    {usuario.empresa && (
                        <p className="truncate text-xs text-muted-foreground">
                            {usuario.empresa}
                        </p>
                    )}
                </div>
            ),
        },
        {
            clave: 'activo',
            titulo: 'Estado',
            render: (usuario) => (
                <span className="flex items-center gap-1.5">
                    <span
                        className={
                            usuario.activo
                                ? 'size-1.5 rounded-full bg-emerald-500'
                                : 'size-1.5 rounded-full bg-muted-foreground/40'
                        }
                    />
                    {usuario.activo ? 'Activo' : 'Desactivado'}
                </span>
            ),
        },
        {
            clave: 'ultimo_acceso',
            titulo: 'Último acceso',
            ocultarEnMovil: true,
            render: (usuario) => usuario.ultimo_acceso ?? 'Nunca',
        },
    ];

    return (
        <>
            <Head title="Usuarios" />

            <PageHeader
                titulo="Usuarios"
                descripcion="Quién puede entrar al panel y con qué alcance."
                acciones={
                    <Button
                        onClick={() => {
                            setEditando(null);
                            setDialogoAbierto(true);
                        }}
                    >
                        <Plus className="size-4" />
                        Nuevo usuario
                    </Button>
                }
            />

            <div className="mb-4 flex flex-wrap items-center gap-2">
                <form
                    onSubmit={(evento) => {
                        evento.preventDefault();
                        filtrar({});
                    }}
                    className="relative flex-1 sm:max-w-xs"
                >
                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={buscar}
                        onChange={(evento) => setBuscar(evento.target.value)}
                        placeholder="Buscar por nombre o correo"
                        className="pl-9"
                        aria-label="Buscar usuarios"
                    />
                </form>

                <Select
                    value={filtros.rol ?? 'todos'}
                    onValueChange={(valor) =>
                        filtrar({ rol: valor === 'todos' ? undefined : valor })
                    }
                >
                    <SelectTrigger className="w-44">
                        <SelectValue placeholder="Todos los roles" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todos">Todos los roles</SelectItem>
                        {roles.map((rol) => (
                            <SelectItem key={rol.id} value={String(rol.id)}>
                                {rol.nombre}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <DataTable
                columnas={columnas}
                filas={usuarios.data}
                vacio={
                    <EmptyState
                        icono={Users}
                        titulo="Ningún usuario coincide"
                        descripcion="Prueba con otro término de búsqueda o cambia el filtro de rol."
                    />
                }
                acciones={(usuario) => (
                    <div className="flex justify-end gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setEditando(usuario);
                                setDialogoAbierto(true);
                            }}
                            aria-label={`Editar ${usuario.name}`}
                        >
                            <Pencil className="size-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            disabled={usuario.es_usted}
                            onClick={() => setAEliminar(usuario)}
                            aria-label={`Eliminar ${usuario.name}`}
                            className="text-muted-foreground hover:text-destructive"
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                )}
            />

            <Paginacion
                links={usuarios.links}
                from={usuarios.from}
                to={usuarios.to}
                total={usuarios.total}
            />

            <DialogoUsuario
                usuario={editando}
                roles={roles}
                socios={socios}
                abierto={dialogoAbierto}
                onAbiertoChange={setDialogoAbierto}
            />

            <ConfirmDialog
                abierto={aEliminar !== null}
                onAbiertoChange={(abierto) => !abierto && setAEliminar(null)}
                titulo="Eliminar usuario"
                descripcion={`La cuenta de ${aEliminar?.name ?? ''} dejará de tener acceso. Se conserva el registro de lo que publicó.`}
                textoConfirmar="Eliminar"
                onConfirmar={() => {
                    if (!aEliminar) {
                        return;
                    }

                    router.delete(destroy(aEliminar.id), {
                        preserveScroll: true,
                        onFinish: () => setAEliminar(null),
                    });
                }}
            />
        </>
    );
}

UsuariosIndex.layout = {
    migas: [{ titulo: 'Sistema' }, { titulo: 'Usuarios' }],
};
