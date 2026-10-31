<?php

/*
 * Si el navegador traduce la página, reescribe los nodos de texto y React
 * revienta al actualizarlos (pantalla en negro en el editor). El documento
 * se declara en español y pide no ser traducido.
 */

test('el documento se declara en español y bloquea la traducción automática', function () {
    $this->get(route('servicios'))
        ->assertOk()
        ->assertSee('<html lang="es" translate="no"', false)
        ->assertSee('<meta name="google" content="notranslate">', false);
});
