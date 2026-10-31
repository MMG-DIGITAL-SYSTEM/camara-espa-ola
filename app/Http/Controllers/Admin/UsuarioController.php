<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\NotificaAlPanel;
use App\Enums\Rol as RolEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\GuardarUsuarioRequest;
use App\Models\Rol;
use App\Models\Socio;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UsuarioController extends Controller
{
    use NotificaAlPanel;

    public function index(Request $request): Response
    {
        $usuarios = User::query()
            ->with('rol', 'socio:id,nombre')
            ->when($request->filled('buscar'), function ($consulta) use ($request) {
                $termino = '%'.$request->string('buscar')->trim().'%';

                $consulta->where(fn ($q) => $q
                    ->where('name', 'ilike', $termino)
                    ->orWhere('email', 'ilike', $termino));
            })
            ->when($request->filled('rol'), fn ($consulta) => $consulta->where('rol_id', $request->integer('rol')))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Usuarios/Index', [
            'usuarios' => $usuarios->through(fn (User $usuario) => [
                'id' => $usuario->id,
                'name' => $usuario->name,
                'email' => $usuario->email,
                'activo' => $usuario->activo,
                'rol_id' => $usuario->rol_id,
                'rol' => $usuario->rol?->nombre,
                'socio_id' => $usuario->socio_id,
                'empresa' => $usuario->socio?->nombre,
                'ultimo_acceso' => $usuario->ultimo_acceso?->diffForHumans(),
                'creado' => $usuario->created_at?->format('d/m/Y'),
                'es_usted' => $usuario->id === $request->user()->id,
            ]),
            'roles' => $this->roles(),
            'socios' => Socio::orderBy('nombre')->get(['id', 'nombre']),
            'filtros' => $request->only('buscar', 'rol'),
        ]);
    }

    public function store(GuardarUsuarioRequest $request): RedirectResponse
    {
        User::create($request->datosDeUsuario());

        return $this->exito('Usuario creado.');
    }

    public function update(GuardarUsuarioRequest $request, User $usuario): RedirectResponse
    {
        $datos = $request->datosDeUsuario();

        // Contraseña vacía al editar significa «conservar la actual».
        if (blank($datos['password'] ?? null)) {
            unset($datos['password']);
        }

        $this->protegerUltimoAdministrador($usuario, $datos);

        $usuario->update($datos);

        return $this->exito('Usuario actualizado.');
    }

    public function destroy(Request $request, User $usuario): RedirectResponse
    {
        if ($usuario->id === $request->user()->id) {
            return $this->error('No puedes eliminar tu propia cuenta desde aquí.');
        }

        if ($usuario->esAdmin() && $this->administradoresActivos() <= 1) {
            return $this->error('Debe quedar al menos un administrador activo.');
        }

        $usuario->delete();

        return $this->exito('Usuario eliminado.');
    }

    /**
     * Evita quedarse sin ningún administrador activo, lo que dejaría el panel
     * inaccesible para todos.
     *
     * @param  array<string, mixed>  $datos
     */
    private function protegerUltimoAdministrador(User $usuario, array $datos): void
    {
        if (! $usuario->esAdmin() || $this->administradoresActivos() > 1) {
            return;
        }

        $pierdeElRol = (int) $datos['rol_id'] !== $usuario->rol_id;
        $seDesactiva = ! (bool) $datos['activo'];

        if ($pierdeElRol || $seDesactiva) {
            abort(422, 'Debe quedar al menos un administrador activo.');
        }
    }

    private function administradoresActivos(): int
    {
        return User::where('activo', true)
            ->whereHas('rol', fn ($consulta) => $consulta->where('nombre', RolEnum::Administrador->value))
            ->count();
    }

    /**
     * @return array<int, array{id: int, nombre: string, descripcion: string|null}>
     */
    private function roles(): array
    {
        return Rol::orderBy('id')
            ->get(['id', 'nombre', 'descripcion'])
            ->map(fn (Rol $rol) => [
                'id' => $rol->id,
                'nombre' => $rol->nombre,
                'descripcion' => $rol->descripcion,
            ])
            ->toArray();
    }
}
