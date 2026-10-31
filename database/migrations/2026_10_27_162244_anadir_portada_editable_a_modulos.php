<?php

use App\Bloques\PortadasDeModulo;
use App\Models\Pagina;
use Illuminate\Database\Migrations\Migration;

/**
 * Las portadas de los módulos pasan del código a una sección editable: cada
 * página de módulo que ya exista recibe la suya con el contenido de siempre.
 */
return new class extends Migration
{
    public function up(): void
    {
        Pagina::where('tipo', Pagina::TIPO_MODULO)
            ->get()
            ->each(fn (Pagina $pagina) => PortadasDeModulo::anadirA($pagina));
    }

    public function down(): void
    {
        // Las secciones añadidas ya pueden estar editadas: no se deshacen.
    }
};
