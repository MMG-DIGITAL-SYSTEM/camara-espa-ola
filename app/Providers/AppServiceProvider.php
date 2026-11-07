<?php

namespace App\Providers;

use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configurarPermisos();
        $this->configurarLimites();
    }

    /**
     * Límites de uso de los formularios públicos, por IP.
     *
     * `contacto`: basta para escribir un par de veces seguidas, corrigiendo un
     * dato, pero corta a quien intente llenar la bandeja con envíos masivos.
     */
    protected function configurarLimites(): void
    {
        RateLimiter::for('contacto', fn (Request $request): array => [
            Limit::perMinute(3)->by($request->ip()),
            Limit::perDay(20)->by($request->ip()),
        ]);

        RateLimiter::for('asistente', fn (Request $request): Limit => Limit::perMinute(15)->by($request->ip()));

        // Una empresa rara vez manda más de una solicitud: el margen es menor.
        RateLimiter::for('afiliacion', fn (Request $request): array => [
            Limit::perMinute(3)->by($request->ip()),
            Limit::perDay(10)->by($request->ip()),
        ]);
    }

    /**
     * Permisos del panel.
     *
     * - `gestionar-contenido`: crear y publicar contenido (Administrador y Editor).
     * - `administrar`: cuentas, roles y ajustes del sitio (solo Administrador).
     */
    protected function configurarPermisos(): void
    {
        Gate::define('gestionar-contenido', fn (User $usuario): bool => $usuario->accedeAlPanel());

        Gate::define('administrar', fn (User $usuario): bool => $usuario->activo && $usuario->esAdmin());
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
