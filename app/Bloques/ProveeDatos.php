<?php

namespace App\Bloques;

/**
 * Bloque «inteligente»: el que no se limita a mostrar lo que el editor
 * escribió, sino que consulta la base (últimas noticias, directorio…).
 *
 * El controlador recorre las secciones de la página, llama a estos
 * proveedores y adjunta el resultado en un mapa indexado por id de sección,
 * de modo que el componente React recibe sus datos ya resueltos.
 */
interface ProveeDatos
{
    /**
     * @param  array<string, mixed>  $config  Los `datos` que guardó el editor.
     * @return mixed Lo que el bloque necesita para pintarse.
     */
    public function datos(array $config): mixed;
}
