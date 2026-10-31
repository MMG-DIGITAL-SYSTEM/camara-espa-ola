<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\NotificaAlPanel;
use App\Http\Controllers\Controller;
use App\Models\Ajuste;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AjusteController extends Controller
{
    use NotificaAlPanel;

    /**
     * Ajustes admitidos y sus reglas.
     *
     * La lista vive aquí y no en la base: así un formulario manipulado no
     * puede colar claves nuevas, y el formulario del panel se genera sola.
     *
     * @var array<string, array{grupo: string, etiqueta: string, tipo: string, ayuda?: string, reglas: array<int, string>}>
     */
    private const CAMPOS = [
        'sitio_nombre' => [
            'grupo' => 'Identidad',
            'etiqueta' => 'Nombre del sitio',
            'tipo' => 'texto',
            'reglas' => ['nullable', 'string', 'max:120'],
        ],
        'sitio_logo' => [
            'grupo' => 'Identidad',
            'etiqueta' => 'Logotipo',
            'tipo' => 'imagen',
            'reglas' => ['nullable', 'string', 'max:500'],
        ],
        'seo_descripcion' => [
            'grupo' => 'Identidad',
            'etiqueta' => 'Descripción por defecto',
            'tipo' => 'textarea',
            'ayuda' => 'La que usan los buscadores cuando una página no tiene la suya.',
            'reglas' => ['nullable', 'string', 'max:300'],
        ],

        'oficina_sc_titulo' => [
            'grupo' => 'Oficina de Santa Cruz',
            'etiqueta' => 'Nombre',
            'tipo' => 'texto',
            'reglas' => ['nullable', 'string', 'max:120'],
        ],
        'oficina_sc_direccion' => [
            'grupo' => 'Oficina de Santa Cruz',
            'etiqueta' => 'Dirección',
            'tipo' => 'textarea',
            'reglas' => ['nullable', 'string', 'max:300'],
        ],
        'oficina_sc_telefono' => [
            'grupo' => 'Oficina de Santa Cruz',
            'etiqueta' => 'Teléfono',
            'tipo' => 'texto',
            'reglas' => ['nullable', 'string', 'max:40'],
        ],

        'oficina_lp_titulo' => [
            'grupo' => 'Oficina de La Paz',
            'etiqueta' => 'Nombre',
            'tipo' => 'texto',
            'reglas' => ['nullable', 'string', 'max:120'],
        ],
        'oficina_lp_direccion' => [
            'grupo' => 'Oficina de La Paz',
            'etiqueta' => 'Dirección',
            'tipo' => 'textarea',
            'reglas' => ['nullable', 'string', 'max:300'],
        ],
        'oficina_lp_telefono' => [
            'grupo' => 'Oficina de La Paz',
            'etiqueta' => 'Teléfono',
            'tipo' => 'texto',
            'reglas' => ['nullable', 'string', 'max:40'],
        ],

        'contacto_correo' => [
            'grupo' => 'Contacto y redes',
            'etiqueta' => 'Correo electrónico',
            'tipo' => 'texto',
            'reglas' => ['nullable', 'email', 'max:120'],
        ],
        'red_facebook' => [
            'grupo' => 'Contacto y redes',
            'etiqueta' => 'Facebook',
            'tipo' => 'enlace',
            'reglas' => ['nullable', 'url', 'max:255'],
        ],
        'red_linkedin' => [
            'grupo' => 'Contacto y redes',
            'etiqueta' => 'LinkedIn',
            'tipo' => 'enlace',
            'reglas' => ['nullable', 'url', 'max:255'],
        ],
        'red_instagram' => [
            'grupo' => 'Contacto y redes',
            'etiqueta' => 'Instagram',
            'tipo' => 'enlace',
            'reglas' => ['nullable', 'url', 'max:255'],
        ],
        'red_twitter' => [
            'grupo' => 'Contacto y redes',
            'etiqueta' => 'X (Twitter)',
            'tipo' => 'enlace',
            'reglas' => ['nullable', 'url', 'max:255'],
        ],
    ];

    public function edit(): Response
    {
        $valores = Ajuste::todos();

        return Inertia::render('Admin/Ajustes/Index', [
            'campos' => collect(self::CAMPOS)
                ->map(fn (array $campo, string $clave) => [
                    'clave' => $clave,
                    'grupo' => $campo['grupo'],
                    'etiqueta' => $campo['etiqueta'],
                    'tipo' => $campo['tipo'],
                    'ayuda' => $campo['ayuda'] ?? null,
                    'valor' => $valores[$clave] ?? '',
                ])
                ->values(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $reglas = collect(self::CAMPOS)
            ->map(fn (array $campo) => $campo['reglas'])
            ->all();

        $etiquetas = collect(self::CAMPOS)
            ->map(fn (array $campo) => mb_strtolower($campo['etiqueta']))
            ->all();

        Ajuste::guardar($request->validate($reglas, [], $etiquetas));

        return $this->exito('Ajustes guardados.');
    }

    /**
     * Claves admitidas. Lo usa el test que vigila que el formulario del panel
     * y lo que se comparte al sitio no se separen.
     *
     * @return array<int, string>
     */
    public static function claves(): array
    {
        return array_keys(self::CAMPOS);
    }
}
