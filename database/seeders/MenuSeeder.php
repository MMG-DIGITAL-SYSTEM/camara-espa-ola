<?php

namespace Database\Seeders;

use App\Models\MenuItem;
use Database\Seeders\Concerns\SeedsFromDump;
use Illuminate\Database\Seeder;

/**
 * Menú real del sitio, extraído de camaraesp.sql.
 *
 * Solo siembra si no hay menú todavía: así se puede volver a correr sin
 * pisar lo que la Cámara haya editado después desde el panel.
 */
class MenuSeeder extends Seeder
{
    use SeedsFromDump;

    public function run(): void
    {
        if (MenuItem::exists()) {
            $this->command?->warn('  El menú ya está creado; se deja como está.');

            return;
        }

        $this->insertRows('menu_items');
    }
}
