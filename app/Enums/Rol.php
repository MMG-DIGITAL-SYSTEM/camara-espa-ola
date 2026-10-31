<?php

namespace App\Enums;

enum Rol: string
{
    case Administrador = 'Administrador';
    case Editor = 'Editor';
    case Empresa = 'Empresa';
    case Usuario = 'Usuario';

    /**
     * Nombre legible del rol para la interfaz.
     */
    public function etiqueta(): string
    {
        return match ($this) {
            self::Administrador => 'Administrador',
            self::Editor => 'Editor de contenido',
            self::Empresa => 'Empresa afiliada',
            self::Usuario => 'Usuario',
        };
    }

    /**
     * Descripción del alcance del rol.
     */
    public function descripcion(): string
    {
        return match ($this) {
            self::Administrador => 'Acceso total al panel, incluida la gestión de usuarios y ajustes.',
            self::Editor => 'Puede crear y publicar contenido, pero no administrar usuarios ni ajustes.',
            self::Empresa => 'Cuenta de un socio: publica y gestiona sus ofertas en la bolsa de trabajo.',
            self::Usuario => 'Sin acceso al panel de administración.',
        };
    }

    /**
     * Determina si el rol puede entrar al panel de administración.
     *
     * La empresa no entra: tiene su propio portal, limitado a sus ofertas.
     */
    public function accedeAlPanel(): bool
    {
        return in_array($this, [self::Administrador, self::Editor], true);
    }

    /**
     * Determina si el rol entra al portal de empresas.
     */
    public function accedeAlPortalDeEmpresas(): bool
    {
        return $this === self::Empresa;
    }

    /**
     * Roles que pueden entrar al panel de administración.
     *
     * @return array<int, self>
     */
    public static function conAccesoAlPanel(): array
    {
        return array_values(array_filter(self::cases(), fn (self $rol): bool => $rol->accedeAlPanel()));
    }
}
