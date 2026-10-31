<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Cuentas de empresa: un usuario con rol Empresa actúa en nombre de un socio.
 *
 * El rol en sí lo crea RolSeeder a partir del enum, como los demás.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('socio_id')->nullable()->after('rol_id')->constrained('socios')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('socio_id');
        });
    }
};
