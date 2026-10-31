<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\NotificaAlPanel;
use App\Enums\Rol as RolEnum;
use App\Http\Controllers\Controller;
use App\Models\Rol;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Los roles no se crean ni se borran desde el panel: el acceso lo decide el
 * enum App\Enums\Rol, así que un rol inventado no otorgaría ningún permiso.
 * Aquí se consultan y se ajusta su descripción.
 */
class RolController extends Controller
{
    use NotificaAlPanel;

    public function index(): Response
    {
        $roles = Rol::withCount('usuarios')
            ->orderBy('id')
            ->get()
            ->map(fn (Rol $rol) => [
                'id' => $rol->id,
                'nombre' => $rol->nombre,
                'descripcion' => $rol->descripcion,
                'usuarios' => $rol->usuarios_count,
                'accede_al_panel' => $rol->accedeAlPanel(),
                'es_administrador' => $rol->esAdministrador(),
            ]);

        return Inertia::render('Admin/Roles/Index', [
            'roles' => $roles,
            'alcances' => collect(RolEnum::cases())
                ->mapWithKeys(fn (RolEnum $rol) => [$rol->value => $rol->descripcion()]),
        ]);
    }

    public function update(Request $request, Rol $rol): RedirectResponse
    {
        $datos = $request->validate(
            ['descripcion' => ['nullable', 'string', 'max:255']],
            [],
            ['descripcion' => 'descripción'],
        );

        $rol->update($datos);

        return $this->exito('Rol actualizado.');
    }
}
