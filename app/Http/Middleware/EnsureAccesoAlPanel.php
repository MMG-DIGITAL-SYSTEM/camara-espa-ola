<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Restringe el panel de administración a usuarios activos con rol Administrador o Editor.
 */
class EnsureAccesoAlPanel
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $usuario = $request->user();

        if (! $usuario) {
            return redirect()->guest(route('login'));
        }

        abort_unless($usuario->accedeAlPanel(), 403, 'No tienes acceso al panel de administración.');

        return $next($request);
    }
}
