<?php

namespace App\Policies;

use App\Models\OfertaEmpleo;
use App\Models\User;

/**
 * Una empresa solo toca las ofertas de su propio socio; el equipo del panel
 * las modera todas.
 */
class OfertaEmpleoPolicy
{
    public function gestionar(User $usuario, OfertaEmpleo $oferta): bool
    {
        if ($usuario->accedeAlPanel()) {
            return true;
        }

        return $usuario->accedeAlPortalDeEmpresas() && $usuario->socio_id === $oferta->socio_id;
    }
}
