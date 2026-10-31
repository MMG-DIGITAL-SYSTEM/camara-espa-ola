<?php

// database/migrations/2026_08_30_000001_create_contactos_afiliados_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contactos_afiliados', function (Blueprint $table) {
            $table->id();

            // Relación con el socio (empresa afiliada)
            $table->foreignId('socio_id')
                ->constrained('socios')
                ->cascadeOnDelete();

            // Datos del contacto
            $table->string('nombre');
            $table->string('cargo')->nullable();
            $table->string('telefono', 20)->nullable();
            $table->string('correo_electronico')->nullable();

            // Orden de visualización
            $table->integer('orden')->default(0);

            // Activo/visible
            $table->boolean('activo')->default(true);

            // Auditoría
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            // Índices
            $table->index('socio_id');
            $table->index('activo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contactos_afiliados');
    }
};
