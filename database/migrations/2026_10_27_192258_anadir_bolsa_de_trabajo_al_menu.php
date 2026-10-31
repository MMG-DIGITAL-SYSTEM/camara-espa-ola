<?php

use App\Models\MenuItem;
use Illuminate\Database\Migrations\Migration;

/**
 * La bolsa de trabajo entra en el desplegable de «La Cámara».
 *
 * Solo si el menú ya existe y aún no enlaza a la bolsa: un menú recién creado
 * la trae del seeder, y si alguien ya la colocó a mano no se duplica.
 */
return new class extends Migration
{
    private const URL = '/bolsa-de-trabajo';

    public function up(): void
    {
        $camara = MenuItem::where('ubicacion', MenuItem::PRINCIPAL)
            ->whereNull('padre_id')
            ->where('url', '/la-camara')
            ->first();

        if (! $camara || MenuItem::where('url', self::URL)->exists()) {
            return;
        }

        MenuItem::create([
            'ubicacion' => MenuItem::PRINCIPAL,
            'titulo' => 'Bolsa de trabajo',
            'url' => self::URL,
            'padre_id' => $camara->id,
            'orden' => (int) MenuItem::where('padre_id', $camara->id)->max('orden') + 1,
        ]);
    }

    public function down(): void
    {
        MenuItem::where('url', self::URL)->delete();
    }
};
