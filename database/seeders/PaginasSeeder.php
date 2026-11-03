<?php

namespace Database\Seeders;

use App\Models\Pagina;
use Database\Seeders\Concerns\SeedsFromDump;
use Illuminate\Database\Seeder;

/**
 * Páginas reales del sitio, con su historial de versiones y secciones, tal
 * como quedaron en camaraesp.sql.
 *
 * paginas.version_publicada_id y pagina_versiones.pagina_id se referencian
 * entre sí: paginas se inserta primero con esa columna en null y se restaura
 * después de crear las versiones.
 *
 * Solo siembra si no hay páginas todavía, para poder volver a correrlo sin
 * pisar ediciones hechas desde el panel.
 */
class PaginasSeeder extends Seeder
{
    use SeedsFromDump;

    public function run(): void
    {
        if (Pagina::exists()) {
            $this->command?->warn('  Ya hay páginas creadas; se dejan como están.');

            return;
        }

        $versionPublicadaIdDiferido = $this->insertRowsDiferido('paginas', 'version_publicada_id');
        $this->insertRows('pagina_versiones');
        $this->restaurarColumna('paginas', 'version_publicada_id', $versionPublicadaIdDiferido);

        $this->insertRows('pagina_secciones');
    }
}
