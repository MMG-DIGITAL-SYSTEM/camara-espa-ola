<?php

use App\Models\MenuItem;
use Database\Seeders\MenuSeeder;

test('la bolsa de trabajo cuelga del desplegable de La Cámara', function () {
    $this->seed(MenuSeeder::class);

    $bolsa = MenuItem::where('url', '/bolsa-de-trabajo')->sole();

    expect($bolsa->padre_id)
        ->toBe(MenuItem::whereNull('padre_id')->where('url', '/la-camara')->value('id'));
});
