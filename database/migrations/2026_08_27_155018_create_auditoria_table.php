<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('auditoria', function (Blueprint $table) {
            $table->id();
            $table->string('tabla', 50);
            $table->unsignedBigInteger('registro_id');
            $table->string('accion', 10);
            $table->foreignId('usuario_id')->nullable()->constrained('users')->nullOnDelete();
            $table->jsonb('datos_anteriores')->nullable();
            $table->jsonb('datos_nuevos')->nullable();
            $table->timestamp('fecha')->useCurrent();
            $table->string('ip_origen', 45)->nullable();
        });
        DB::statement("ALTER TABLE auditoria ADD CONSTRAINT auditoria_accion_check CHECK (accion IN ('INSERT','UPDATE','DELETE'))");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('auditoria');
    }
};
