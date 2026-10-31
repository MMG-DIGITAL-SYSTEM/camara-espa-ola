<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Restringe el portal de empresas a cuentas activas con rol Empresa y un socio asignado.
 */
class EnsureAccesoAlPortalDeEmpresas
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

        abort_unless($usuario->accedeAlPortalDeEmpresas(), 403, 'No tienes acceso al portal de empresas.');

        return $next($request);
    }
}
