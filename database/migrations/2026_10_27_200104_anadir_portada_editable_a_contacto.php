<?php

use App\Bloques\PortadasDeModulo;
use App\Models\Pagina;
use Illuminate\Database\Migrations\Migration;

/**
 * La cabecera de Contacto («Conéctate con nosotros») también pasa del código
 * a una sección editable, con el estilo claro de la portada.
 */
return new class extends Migration
{
    public function up(): void
    {
        $pagina = Pagina::delModulo('contacto')->first();

        if ($pagina) {
            PortadasDeModulo::anadirA($pagina);
        }
    }

    public function down(): void
    {
        // La sección añadida ya puede estar editada: no se deshace.
    }
};
