<?php

namespace App\Concerns;

use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

/**
 * Envía avisos efímeros al panel. El front los recoge en `useFlashToast`
 * a través del evento `flash` de Inertia y los muestra con sonner.
 */
trait NotificaAlPanel
{
    protected function exito(string $mensaje): RedirectResponse
    {
        return $this->avisar('success', $mensaje);
    }

    protected function error(string $mensaje): RedirectResponse
    {
        return $this->avisar('error', $mensaje);
    }

    protected function aviso(string $mensaje): RedirectResponse
    {
        return $this->avisar('warning', $mensaje);
    }

    private function avisar(string $tipo, string $mensaje): RedirectResponse
    {
        return Inertia::flash('toast', [
            'type' => $tipo,
            'message' => $mensaje,
        ])->back();
    }
}
