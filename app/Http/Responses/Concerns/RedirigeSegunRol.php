<?php

namespace App\Http\Responses\Concerns;

use Illuminate\Http\Request;

trait RedirigeSegunRol
{
    /**
     * Destino tras autenticarse: el panel o el portal de empresas para quien
     * tiene acceso, el sitio público para el resto.
     */
    protected function rutaSegunRol(Request $request): string
    {
        $usuario = $request->user();

        return match (true) {
            $usuario?->accedeAlPanel() ?? false => route('admin.dashboard', absolute: false),
            $usuario?->accedeAlPortalDeEmpresas() ?? false => route('empresa.ofertas.index', absolute: false),
            default => route('home', absolute: false),
        };
    }
}
