<?php

namespace App\Http\Middleware;

use App\Models\Ajuste;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            /*
             * El editor visual incrusta la página pública de un módulo para
             * enseñar su contenido propio: sin menú, pie ni secciones
             * editables, que el editor ya pinta por su cuenta.
             */
            'soloContenido' => $request->boolean('solo_contenido')
                && ($user?->accedeAlPanel() ?? false),
            'auth' => [
                'user' => $user ? [
                    ...$user->only('id', 'name', 'email', 'email_verified_at', 'activo'),
                    'rol' => $user->rol?->nombre,
                    'es_admin' => $user->esAdmin(),
                    'accede_al_panel' => $user->accedeAlPanel(),
                    'accede_al_portal_de_empresas' => $user->accedeAlPortalDeEmpresas(),
                    'empresa' => $user->socio_id ? $user->socio?->nombre : null,
                ] : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',

            /*
             * Menús del sitio público. Van como closure para que solo se
             * consulten cuando la vista los pide, y el panel no pague dos
             * consultas por pantalla.
             */
            'menus' => fn () => [
                'principal' => MenuItem::arbol(MenuItem::PRINCIPAL),
                'pie' => MenuItem::arbol(MenuItem::PIE),
            ],

            // Datos de contacto y redes, cacheados en el propio modelo.
            'ajustes' => fn () => Ajuste::todos(),
        ];
    }
}
