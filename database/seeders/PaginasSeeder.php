<?php

namespace Database\Seeders;

use App\Bloques\PortadasDeModulo;
use App\Models\Pagina;
use Illuminate\Database\Seeder;

/**
 * Crea las páginas que el sitio da por hechas.
 *
 * Solo las siembra si no existen: este seeder se puede volver a ejecutar sin
 * pisar lo que la Cámara haya editado después desde el panel.
 */
class PaginasSeeder extends Seeder
{
    public function run(): void
    {
        $this->sembrar(
            slug: 'inicio',
            titulo: 'Inicio',
            esSistema: true,
            seoDescripcion: 'La Cámara Oficial Española de Comercio en Bolivia conecta oportunidades de negocio entre España y Bolivia.',
            secciones: self::seccionesDePortada(),
        );

        $this->sembrarModulos();
    }

    /**
     * Portada: un resumen de los módulos, sin copiar sus datos. Cada bloque
     * dinámico lee su propia tabla (contenido institucional, actividades,
     * servicios y socios), así que la fuente de verdad sigue en cada módulo.
     *
     * @return array<int, array<string, mixed>>
     */
    public static function seccionesDePortada(): array
    {
        return [
            [
                'bloque' => 'hero',
                'estilos' => ['fondo' => 'oscuro', 'espaciado' => 'amplio'],
                'datos' => [
                    'antetitulo' => 'Cámara Oficial Española en Bolivia',
                    'titulo' => 'Cámara de Comercio',
                    'titulo_destacado' => 'Española',
                    'subtitulo' => 'en Bolivia',
                    'imagen' => 'https://i.pinimg.com/736x/46/71/09/467109db6d8eb79817f2af351ac7d85b.jpg',
                    'alineacion' => 'centro',
                    'boton_texto' => 'Afíliate',
                    'boton_enlace' => '/afiliate/formulario',
                ],
            ],
            [
                'bloque' => 'presentacion',
                'estilos' => ['fondo' => 'claro', 'espaciado' => 'amplio'],
                'datos' => [
                    'antetitulo' => 'Quiénes somos',
                    'titulo' => 'Impulsamos las relaciones económicas entre España y Bolivia',
                    'seccion' => 'nosotros',
                    'boton_texto' => 'Conoce la Cámara',
                    'boton_enlace' => '/la-camara',
                ],
            ],
            [
                'bloque' => 'actividades-proximas',
                'estilos' => ['fondo' => 'suave'],
                'datos' => [
                    'titulo' => 'Últimas actividades',
                    'columnas' => '3',
                    'limite' => 3,
                    'solo_proximas' => false,
                    'enlace_texto' => 'Ver todas',
                    'enlace' => '/actividades',
                ],
            ],
            [
                'bloque' => 'servicios',
                'estilos' => ['fondo' => 'claro'],
                'datos' => [
                    'titulo' => 'Nuestros servicios',
                    'columnas' => '3',
                    'limite' => 6,
                    'enlace_texto' => 'Ver todos',
                    'enlace' => '/servicios',
                ],
            ],
            [
                // Presentación de la comunidad de socios; el listado completo está en /socios.
                'bloque' => 'texto-imagen',
                'estilos' => ['fondo' => 'suave', 'espaciado' => 'amplio'],
                'datos' => [
                    'antetitulo' => 'Nuestros socios',
                    'titulo' => 'Juntos en Crecimiento: Potenciando Negocios, Forjando Alianzas',
                    'contenido' => '<p>Nuestros socios son el corazón de nuestra comunidad empresarial. Juntos, potenciamos negocios y forjamos alianzas duraderas, fomentando un crecimiento sostenible en el panorama comercial hispano-boliviano. Únete a nosotros y sé parte de esta sinergia empresarial transformadora.</p>',
                    'imagen' => 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&q=80',
                    'posicion_imagen' => 'izquierda',
                    'boton_texto' => 'Conoce nuestros socios',
                    'boton_enlace' => '/socios',
                ],
            ],
        ];
    }

    /**
     * Páginas de módulo: conservan su vista a medida y solo aportan el
     * encabezado editable. El separador llamado «listado» marca dónde encaja
     * el listado propio de la vista.
     */
    private function sembrarModulos(): void
    {
        $modulos = [
            'noticias' => ['Noticias', 'Lo último de la Cámara y de sus empresas asociadas.'],
            'actividades' => ['Actividades', 'Encuentros, ferias y misiones comerciales.'],
            'socios' => ['Socios', 'Las empresas que forman parte de la Cámara.'],
            'servicios' => ['Servicios', 'Lo que ofrecemos a nuestras empresas asociadas.'],
            'fichas-pais' => ['Fichas país', 'Información económica de España y Bolivia.'],
            'red-camaras' => ['Red de cámaras', 'Cámaras españolas repartidas por el mundo.'],
            'la-camara' => ['La Cámara', 'Quiénes somos y a qué nos dedicamos.'],
            'bolsa-trabajo' => ['Bolsa de trabajo', 'Ofertas de empleo de las empresas asociadas.'],
            // Las oficinas y el formulario salen de la base; aquí solo va el encabezado.
            'contacto' => ['Contacto', 'Escríbenos o visítanos en nuestras oficinas.'],
        ];

        foreach ($modulos as $modulo => [$titulo, $descripcion]) {
            if (Pagina::delModulo($modulo)->exists()) {
                continue;
            }

            $pagina = Pagina::create([
                // El slug de una página de módulo no la sirve: lo hace su ruta
                // fija. Se le da uno propio para no chocar con ella.
                'slug' => 'modulo-'.$modulo,
                'titulo' => $titulo,
                'tipo' => Pagina::TIPO_MODULO,
                'modulo' => $modulo,
                'es_sistema' => true,
                'seo_descripcion' => $descripcion,
            ]);

            /*
             * El marcador indica dónde va el listado propio de la vista: lo
             * que se añada por encima o por debajo se pinta alrededor de él.
             */
            $pagina->secciones()->create([
                'bloque' => 'separador',
                'nombre' => 'listado',
                'orden' => 0,
                'estilos' => [],
                'datos' => ['altura' => 8],
            ]);

            // La portada que antes venía fija en la vista, ahora editable.
            PortadasDeModulo::anadirA($pagina);

            $pagina->publicar(etiqueta: 'Contenido inicial');

            $this->command?->info(sprintf('  módulo %s listo', $modulo));
        }
    }

    /**
     * @param  array<int, array<string, mixed>>  $secciones
     */
    private function sembrar(
        string $slug,
        string $titulo,
        bool $esSistema,
        string $seoDescripcion,
        array $secciones,
    ): void {
        if (Pagina::where('slug', $slug)->exists()) {
            $this->command?->warn("  La página «{$slug}» ya existe; se deja como está.");

            return;
        }

        $pagina = Pagina::create([
            'slug' => $slug,
            'titulo' => $titulo,
            'es_sistema' => $esSistema,
            'seo_descripcion' => $seoDescripcion,
        ]);

        foreach ($secciones as $orden => $seccion) {
            $pagina->secciones()->create([
                ...$seccion,
                'orden' => $orden,
            ]);
        }

        $pagina->publicar(etiqueta: 'Contenido inicial');

        $this->command?->info(sprintf('  %s: %d secciones', $slug, count($secciones)));
    }
}
