<?php

use App\Http\Controllers\Admin\ActividadController as AdminActividadController;
use App\Http\Controllers\Admin\AjusteController;
use App\Http\Controllers\Admin\ComentarioController as AdminComentarioController;
use App\Http\Controllers\Admin\ContenidoInstitucionalController;
use App\Http\Controllers\Admin\ConvenioController as AdminConvenioController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DirectivoController;
use App\Http\Controllers\Admin\FichaPaisController as AdminFichaPaisController;
use App\Http\Controllers\Admin\MedioController;
use App\Http\Controllers\Admin\MenuController;
use App\Http\Controllers\Admin\NoticiaController as AdminNoticiaController;
use App\Http\Controllers\Admin\OfertaEmpleoController as AdminOfertaEmpleoController;
use App\Http\Controllers\Admin\PaginaController as AdminPaginaController;
use App\Http\Controllers\Admin\PaginaVersionController;
use App\Http\Controllers\Admin\RedCamaraController as AdminRedCamaraController;
use App\Http\Controllers\Admin\RolController;
use App\Http\Controllers\Admin\ServicioController as AdminServicioController;
use App\Http\Controllers\Admin\SocioController as AdminSocioController;
use App\Http\Controllers\Admin\SolicitudAfiliacionController as AdminSolicitudAfiliacionController;
use App\Http\Controllers\Admin\UsuarioController;
use App\Http\Controllers\Api\ActividadController;
use App\Http\Controllers\Api\AsistenteController;
use App\Http\Controllers\Api\CamaraController;
use App\Http\Controllers\Api\ComentarioController as ApiComentarioController;
use App\Http\Controllers\Api\ContactoController;
use App\Http\Controllers\Api\ConvenioController;
use App\Http\Controllers\Api\FichaPaisController;
use App\Http\Controllers\Api\MeGustaController;
use App\Http\Controllers\Api\NoticiaController;
use App\Http\Controllers\Api\OficinaController;
use App\Http\Controllers\Api\RedCamaraController;
use App\Http\Controllers\Api\ServicioController;
use App\Http\Controllers\Api\SocioController;
use App\Http\Controllers\Api\SolicitudAfiliacionController;
use App\Http\Controllers\BolsaTrabajoController;
use App\Http\Controllers\Empresa\OfertaController as EmpresaOfertaController;
use App\Http\Controllers\ModuloController;
use App\Http\Controllers\PaginaController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Sitio público
|--------------------------------------------------------------------------
*/

// La portada se construye con bloques, igual que el resto.
Route::get('/', [PaginaController::class, 'portada'])->name('home');

Route::redirect('/inicio', '/')->name('public.home');

Route::get('/la-camara', [CamaraController::class, 'index'])->name('camara');

// Actividades
Route::prefix('actividades')->group(function () {
    Route::get('/', [ActividadController::class, 'index'])->name('actividades');
    Route::get('/categorias', [ActividadController::class, 'categorias']);
    Route::get('/{id}', [ActividadController::class, 'show']);
});

// Socios
Route::get('/socios', ModuloController::class)->defaults('modulo', 'socios')->name('socios');
Route::get('/socios/{slug}', fn (string $slug) => Inertia::render('Public/Socios/Show', ['slug' => $slug]))->name('socios.show');

// Fichas país
Route::get('/fichas-pais', ModuloController::class)->defaults('modulo', 'fichas-pais')->name('fichas-pais');

// Red de cámaras
Route::get('/red-camaras', ModuloController::class)->defaults('modulo', 'red-camaras')->name('red-camaras');

// Noticias
Route::get('/noticias', ModuloController::class)->defaults('modulo', 'noticias')->name('noticias');
Route::get('/noticias/{slug}', fn (string $slug) => Inertia::render('Public/Noticias/Show', ['slug' => $slug]))->name('noticias.show');

// Contacto: formulario y oficinas
Route::get('/contacto', ModuloController::class)->defaults('modulo', 'contacto')->name('contacto');

// Formulario de afiliación: dos segmentos, así no choca con la página «afiliate».
// Convenios: el detalle de cada uno es su PDF, no hay página propia.
Route::get('/convenios', ModuloController::class)->defaults('modulo', 'convenios')->name('convenios');

// La antigua página «Afíliate» se retiró: sus enlaces llevan al formulario.
Route::permanentRedirect('/afiliate', '/afiliate/formulario')->name('afiliacion');

Route::get('/afiliate/formulario', ModuloController::class)
    ->defaults('modulo', 'formulario-afiliacion')
    ->name('afiliacion.formulario');

// Servicios
Route::get('/servicios', ModuloController::class)->defaults('modulo', 'servicios')->name('servicios');

// Bolsa de trabajo: ofertas que publican los socios desde su portal.
Route::get('/bolsa-de-trabajo', [BolsaTrabajoController::class, 'index'])->name('bolsa-trabajo');
Route::get('/bolsa-de-trabajo/{oferta}', [BolsaTrabajoController::class, 'show'])
    ->whereNumber('oferta')
    ->name('bolsa-trabajo.show');

/*
|--------------------------------------------------------------------------
| API pública (consumida por las vistas)
|--------------------------------------------------------------------------
*/

Route::prefix('api')->group(function () {
    Route::post('/asistente', [AsistenteController::class, 'store'])
        ->middleware('throttle:asistente')
        ->name('api.asistente.store');
    Route::post('/contacto', [ContactoController::class, 'store'])
        ->middleware('throttle:contacto')
        ->name('api.contacto.store');
    Route::get('/oficinas', [OficinaController::class, 'index'])->name('api.oficinas.index');
    Route::get('/convenios', [ConvenioController::class, 'index'])->name('api.convenios.index');

    Route::post('/solicitudes-afiliacion', [SolicitudAfiliacionController::class, 'store'])
        ->middleware('throttle:afiliacion')
        ->name('api.solicitudes-afiliacion.store');

    Route::prefix('socios')->group(function () {
        Route::get('/', [SocioController::class, 'index']);
        Route::get('/categorias', [SocioController::class, 'categorias']);
        Route::get('/carrusel', [SocioController::class, 'carrusel']);
        Route::get('/{slug}', [SocioController::class, 'show']);
    });

    Route::prefix('fichas-pais')->group(function () {
        Route::get('/', [FichaPaisController::class, 'index']);
        Route::get('/{pais}', [FichaPaisController::class, 'show']);
        Route::get('/{pais}/pdf', [FichaPaisController::class, 'pdf']);
    });

    Route::prefix('red-camaras')->group(function () {
        Route::get('/', [RedCamaraController::class, 'index']);
        Route::get('/{id}', [RedCamaraController::class, 'show']);
    });

    // Comentarios de visitantes: entran pendientes de moderación.
    Route::middleware('throttle:comentarios')->name('api.comentarios.')->group(function () {
        Route::post('/noticias/{slug}/comentarios', [ApiComentarioController::class, 'comentarNoticia'])->name('noticia');
        Route::post('/actividades/{actividad}/comentarios', [ApiComentarioController::class, 'comentarActividad'])
            ->whereNumber('actividad')
            ->name('actividad');
    });

    // «Me gusta» de visitantes anónimos: POST lo marca, DELETE lo quita.
    Route::middleware('throttle:me-gusta')->name('api.me-gusta.')->group(function () {
        Route::post('/noticias/{slug}/me-gusta', [MeGustaController::class, 'marcarNoticia'])->name('noticia.marcar');
        Route::delete('/noticias/{slug}/me-gusta', [MeGustaController::class, 'quitarNoticia'])->name('noticia.quitar');
        Route::post('/actividades/{actividad}/me-gusta', [MeGustaController::class, 'marcarActividad'])
            ->whereNumber('actividad')
            ->name('actividad.marcar');
        Route::delete('/actividades/{actividad}/me-gusta', [MeGustaController::class, 'quitarActividad'])
            ->whereNumber('actividad')
            ->name('actividad.quitar');
    });

    Route::prefix('noticias')->group(function () {
        Route::get('/', [NoticiaController::class, 'index']);
        Route::get('/categorias', [NoticiaController::class, 'categorias']);
        Route::get('/{slug}', [NoticiaController::class, 'show']);
    });

    Route::get('/servicios', [ServicioController::class, 'index']);
});

/*
|--------------------------------------------------------------------------
| Panel de administración
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified', 'admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/', DashboardController::class)->name('dashboard');

        // Constructor de páginas: Administrador y Editor.
        Route::prefix('paginas')->name('paginas.')->group(function () {
            Route::get('/', [AdminPaginaController::class, 'index'])->name('index');
            Route::post('/', [AdminPaginaController::class, 'store'])->name('store');
            Route::get('{pagina}/editar', [AdminPaginaController::class, 'edit'])->name('edit');
            Route::patch('{pagina}', [AdminPaginaController::class, 'update'])->name('update');
            Route::delete('{pagina}', [AdminPaginaController::class, 'destroy'])->name('destroy');

            // Autoguardado del editor: responde JSON, no una visita de Inertia.
            Route::put('{pagina}/borrador', [AdminPaginaController::class, 'guardarBorrador'])->name('borrador');

            Route::get('{pagina}/versiones', [PaginaVersionController::class, 'index'])->name('versiones');
            Route::post('{pagina}/publicar', [PaginaVersionController::class, 'publicar'])->name('publicar');
            Route::post('{pagina}/versiones/{version}/revertir', [PaginaVersionController::class, 'revertir'])->name('revertir');
        });

        // Noticias.
        Route::prefix('noticias')->name('noticias.')->group(function () {
            Route::get('/', [AdminNoticiaController::class, 'index'])->name('index');
            Route::get('{noticia}', [AdminNoticiaController::class, 'show'])->name('show');
            Route::post('/', [AdminNoticiaController::class, 'store'])->name('store');
            Route::patch('{noticia}', [AdminNoticiaController::class, 'update'])->name('update');
            Route::delete('{noticia}', [AdminNoticiaController::class, 'destroy'])->name('destroy');
        });

        // Actividades: contenido de base de datos, con secciones y archivos.
        Route::prefix('actividades')->name('actividades.')->group(function () {
            Route::get('/', [AdminActividadController::class, 'index'])->name('index');
            Route::get('{actividad}', [AdminActividadController::class, 'show'])->name('show');
            Route::post('/', [AdminActividadController::class, 'store'])->name('store');
            Route::patch('{actividad}', [AdminActividadController::class, 'update'])->name('update');
            Route::delete('{actividad}', [AdminActividadController::class, 'destroy'])->name('destroy');
        });

        // Socios: empresas afiliadas, con sus personas de contacto.
        Route::prefix('socios')->name('socios.')->group(function () {
            Route::get('/', [AdminSocioController::class, 'index'])->name('index');
            Route::get('{socio}', [AdminSocioController::class, 'show'])->name('show');
            Route::post('/', [AdminSocioController::class, 'store'])->name('store');
            Route::patch('{socio}', [AdminSocioController::class, 'update'])->name('update');
            Route::delete('{socio}', [AdminSocioController::class, 'destroy'])->name('destroy');
        });

        // Bolsa de trabajo: moderación de las ofertas de todos los socios.
        Route::prefix('bolsa-trabajo')->name('bolsa-trabajo.')->group(function () {
            Route::get('/', [AdminOfertaEmpleoController::class, 'index'])->name('index');
            Route::get('{oferta}', [AdminOfertaEmpleoController::class, 'show'])->name('show');
            Route::post('/', [AdminOfertaEmpleoController::class, 'store'])->name('store');
            Route::patch('{oferta}', [AdminOfertaEmpleoController::class, 'update'])->name('update');
            Route::delete('{oferta}', [AdminOfertaEmpleoController::class, 'destroy'])->name('destroy');
        });

        // Solicitudes de afiliación: llegan del formulario público.
        Route::prefix('solicitudes')->name('solicitudes.')->group(function () {
            Route::get('/', [AdminSolicitudAfiliacionController::class, 'index'])->name('index');
            Route::get('{solicitud}', [AdminSolicitudAfiliacionController::class, 'show'])->name('show');
            Route::patch('{solicitud}', [AdminSolicitudAfiliacionController::class, 'update'])->name('update');
            Route::post('{solicitud}/aprobar', [AdminSolicitudAfiliacionController::class, 'aprobar'])->name('aprobar');
            Route::delete('{solicitud}', [AdminSolicitudAfiliacionController::class, 'destroy'])->name('destroy');
        });

        // Fichas país: un PDF por mercado.
        Route::prefix('fichas-pais')->name('fichas-pais.')->group(function () {
            Route::get('/', [AdminFichaPaisController::class, 'index'])->name('index');
            Route::post('/', [AdminFichaPaisController::class, 'store'])->name('store');
            Route::patch('{ficha}', [AdminFichaPaisController::class, 'update'])->name('update');
            Route::delete('{ficha}', [AdminFichaPaisController::class, 'destroy'])->name('destroy');
        });

        // Red de cámaras.
        Route::prefix('red-camaras')->name('red-camaras.')->group(function () {
            Route::get('/', [AdminRedCamaraController::class, 'index'])->name('index');
            Route::post('/', [AdminRedCamaraController::class, 'store'])->name('store');
            Route::patch('{camara}', [AdminRedCamaraController::class, 'update'])->name('update');
            Route::delete('{camara}', [AdminRedCamaraController::class, 'destroy'])->name('destroy');
        });

        // Comentarios de noticias y actividades: moderación.
        Route::prefix('comentarios')->name('comentarios.')->group(function () {
            Route::get('/', [AdminComentarioController::class, 'index'])->name('index');
            Route::patch('{comentario}', [AdminComentarioController::class, 'update'])->name('update');
            Route::delete('{comentario}', [AdminComentarioController::class, 'destroy'])->name('destroy');
        });

        // Contenido institucional: las secciones fijas de «La Cámara».
        Route::prefix('contenido-institucional')->name('contenido-institucional.')->group(function () {
            Route::get('/', [ContenidoInstitucionalController::class, 'index'])->name('index');
            Route::patch('{contenido}', [ContenidoInstitucionalController::class, 'update'])->name('update');
        });

        // Servicios y directorio: listas cortas y ordenables.
        Route::prefix('servicios')->name('servicios.')->group(function () {
            Route::get('/', [AdminServicioController::class, 'index'])->name('index');
            Route::post('/', [AdminServicioController::class, 'store'])->name('store');
            Route::post('reordenar', [AdminServicioController::class, 'reordenar'])->name('reordenar');
            Route::patch('{servicio}', [AdminServicioController::class, 'update'])->name('update');
            Route::delete('{servicio}', [AdminServicioController::class, 'destroy'])->name('destroy');
        });

        // Convenios: sin vista en el panel todavía. Se envían como multipart
        // (imagen y PDF); al editar, POST con _method=PATCH.
        Route::prefix('convenios')->name('convenios.')->group(function () {
            Route::post('/', [AdminConvenioController::class, 'store'])->name('store');
            Route::patch('{convenio}', [AdminConvenioController::class, 'update'])->name('update');
            Route::delete('{convenio}', [AdminConvenioController::class, 'destroy'])->name('destroy');
        });

        Route::prefix('directivos')->name('directivos.')->group(function () {
            Route::get('/', [DirectivoController::class, 'index'])->name('index');
            Route::post('/', [DirectivoController::class, 'store'])->name('store');
            Route::post('reordenar', [DirectivoController::class, 'reordenar'])->name('reordenar');
            Route::patch('{directivo}', [DirectivoController::class, 'update'])->name('update');
            Route::delete('{directivo}', [DirectivoController::class, 'destroy'])->name('destroy');
        });

        // Menú del sitio.
        Route::prefix('menu')->name('menu.')->group(function () {
            Route::get('/', [MenuController::class, 'index'])->name('index');
            Route::post('/', [MenuController::class, 'store'])->name('store');
            Route::post('reordenar', [MenuController::class, 'reordenar'])->name('reordenar');
            Route::patch('{item}', [MenuController::class, 'update'])->name('update');
            Route::delete('{item}', [MenuController::class, 'destroy'])->name('destroy');
        });

        // Biblioteca de medios.
        Route::prefix('medios')->name('medios.')->group(function () {
            Route::get('/', [MedioController::class, 'index'])->name('index');
            // Listado en JSON para el selector del editor de páginas.
            Route::get('listar', [MedioController::class, 'listar'])->name('listar');
            Route::post('/', [MedioController::class, 'store'])->name('store');
            Route::patch('{medio}', [MedioController::class, 'update'])->name('update');
            Route::delete('{medio}', [MedioController::class, 'destroy'])->name('destroy');
        });

        // Ajustes del sitio y cuentas: reservados al rol Administrador.
        Route::middleware('can:administrar')->group(function () {
            Route::get('ajustes', [AjusteController::class, 'edit'])->name('ajustes.edit');
            Route::patch('ajustes', [AjusteController::class, 'update'])->name('ajustes.update');

            Route::get('usuarios', [UsuarioController::class, 'index'])->name('usuarios.index');
            Route::post('usuarios', [UsuarioController::class, 'store'])->name('usuarios.store');
            Route::patch('usuarios/{usuario}', [UsuarioController::class, 'update'])->name('usuarios.update');
            Route::delete('usuarios/{usuario}', [UsuarioController::class, 'destroy'])->name('usuarios.destroy');

            Route::get('roles', [RolController::class, 'index'])->name('roles.index');
            Route::patch('roles/{rol}', [RolController::class, 'update'])->name('roles.update');
        });
    });

/*
|--------------------------------------------------------------------------
| Portal de empresas
|--------------------------------------------------------------------------
| Cuentas con rol Empresa: solo gestionan las ofertas de su propio socio.
*/

Route::middleware(['auth', 'verified', 'empresa'])
    ->prefix('empresa')
    ->name('empresa.')
    ->group(function () {
        Route::redirect('/', '/empresa/ofertas')->name('inicio');

        Route::prefix('ofertas')->name('ofertas.')->group(function () {
            Route::get('/', [EmpresaOfertaController::class, 'index'])->name('index');
            Route::get('{oferta}', [EmpresaOfertaController::class, 'show'])->name('show');
            Route::post('/', [EmpresaOfertaController::class, 'store'])->name('store');
            Route::patch('{oferta}', [EmpresaOfertaController::class, 'update'])->name('update');
            Route::delete('{oferta}', [EmpresaOfertaController::class, 'destroy'])->name('destroy');
        });
    });

require __DIR__.'/settings.php';

/*
|--------------------------------------------------------------------------
| Páginas del constructor
|--------------------------------------------------------------------------
| Va la última a propósito: solo atiende lo que ninguna ruta fija reclamó,
| de modo que el panel pueda publicar URLs nuevas sin tocar código.
*/

Route::get('/{slug}', [PaginaController::class, 'show'])
    ->where('slug', '[a-z0-9]+(?:-[a-z0-9]+)*')
    ->name('pagina');
