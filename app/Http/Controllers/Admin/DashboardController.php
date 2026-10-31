<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Actividad;
use App\Models\Noticia;
use App\Models\Servicio;
use App\Models\Socio;
use Carbon\CarbonInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        return Inertia::render('Admin/Dashboard', [
            'metricas' => $this->metricas(),
            'publicacionesPorMes' => $this->publicacionesPorMes(),
            'actividadReciente' => Inertia::defer(fn () => $this->actividadReciente()),
        ]);
    }

    /**
     * @return array<string, array{valor: int, detalle: string}>
     */
    private function metricas(): array
    {
        $actividadesProximas = Actividad::whereNotNull('fecha_evento')
            ->where('fecha_evento', '>=', now())
            ->count();

        return [
            'socios' => [
                'valor' => Socio::activos()->count(),
                'detalle' => 'activos en el directorio',
            ],
            'noticias' => [
                'valor' => Noticia::count(),
                'detalle' => sprintf('%d publicadas', Noticia::activas()->count()),
            ],
            'actividades' => [
                'valor' => Actividad::count(),
                'detalle' => $actividadesProximas === 1
                    ? '1 próxima en agenda'
                    : sprintf('%d próximas en agenda', $actividadesProximas),
            ],
            'servicios' => [
                'valor' => Servicio::count(),
                'detalle' => sprintf('%d visibles', Servicio::where('activo', true)->count()),
            ],
            'solicitudes' => [
                'valor' => $this->contar('solicitudes_afiliacion', ['estado' => 'pendiente']),
                'detalle' => 'solicitudes de afiliación pendientes',
            ],
            'mensajes' => [
                'valor' => $this->contar('mensajes_contacto', ['estado' => 'pendiente']),
                'detalle' => 'mensajes de contacto sin atender',
            ],
        ];
    }

    /**
     * Noticias y actividades publicadas en los últimos seis meses.
     *
     * @return array<int, array{mes: string, noticias: int, actividades: int}>
     */
    private function publicacionesPorMes(): array
    {
        $desde = now()->startOfMonth()->subMonths(5);

        $noticias = $this->conteoMensual('noticias', $desde);
        $actividades = $this->conteoMensual('actividades', $desde);

        return collect(range(0, 5))
            ->map(function (int $desplazamiento) use ($desde, $noticias, $actividades): array {
                $mes = $desde->copy()->addMonths($desplazamiento);
                $clave = $mes->format('Y-m');

                return [
                    'mes' => $mes->locale('es')->isoFormat('MMM'),
                    'noticias' => $noticias[$clave] ?? 0,
                    'actividades' => $actividades[$clave] ?? 0,
                ];
            })
            ->all();
    }

    /**
     * @return Collection<string, int>
     */
    private function conteoMensual(string $tabla, CarbonInterface $desde): Collection
    {
        return DB::table($tabla)
            ->selectRaw("to_char(fecha_publicacion, 'YYYY-MM') as mes, count(*) as total")
            ->whereNull('deleted_at')
            ->where('fecha_publicacion', '>=', $desde)
            ->groupBy('mes')
            ->pluck('total', 'mes');
    }

    /**
     * Últimos cambios registrados por el trigger de auditoría.
     *
     * @return array<int, array<string, mixed>>
     */
    private function actividadReciente(): array
    {
        return DB::table('auditoria')
            ->leftJoin('users', 'users.id', '=', 'auditoria.usuario_id')
            ->select('auditoria.tabla', 'auditoria.accion', 'auditoria.fecha', 'users.name as usuario')
            ->orderByDesc('auditoria.fecha')
            ->limit(12)
            ->get()
            ->map(fn (object $registro) => [
                'tabla' => $registro->tabla,
                'accion' => $registro->accion,
                'usuario' => $registro->usuario ?? 'Sistema',
                'cuando' => Carbon::parse($registro->fecha)->locale('es')->diffForHumans(),
            ])
            ->all();
    }

    /**
     * Cuenta filas de tablas que aún no tienen modelo propio, tolerando que la
     * tabla no exista todavía.
     *
     * @param  array<string, mixed>  $condiciones
     */
    private function contar(string $tabla, array $condiciones = []): int
    {
        if (! Schema::hasTable($tabla)) {
            return 0;
        }

        return DB::table($tabla)
            ->where($condiciones)
            ->whereNull('deleted_at')
            ->count();
    }
}
