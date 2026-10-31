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
        Schema::create('paginas', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('titulo');

            /*
             * 'libre'  → se compone entera con bloques (Inicio, Afíliate…).
             * 'modulo' → conserva su vista a medida (listados con filtros,
             *            visor de PDF) y los bloques decoran arriba y abajo.
             */
            $table->string('tipo', 20)->default('libre');
            $table->string('modulo', 40)->nullable();

            // Apunta a la versión que ve el público. Null = nunca publicada.
            $table->unsignedBigInteger('version_publicada_id')->nullable();

            $table->string('seo_titulo')->nullable();
            $table->string('seo_descripcion', 500)->nullable();
            $table->string('seo_imagen')->nullable();

            // Las páginas de sistema no se pueden borrar desde el panel.
            $table->boolean('es_sistema')->default(false);
            $table->integer('orden')->default(0);

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('tipo');
            $table->index('modulo');
        });

        DB::statement("ALTER TABLE paginas ADD CONSTRAINT paginas_tipo_check CHECK (tipo IN ('libre','modulo'))");

        /*
         * El borrador vivo. El panel edita siempre esta tabla; el público
         * nunca la lee.
         */
        Schema::create('pagina_secciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pagina_id')->constrained('paginas')->cascadeOnDelete();

            // Clave del bloque en el registro (resources/js/blocks).
            $table->string('bloque', 60);

            // Etiqueta que el editor ve en el árbol de secciones.
            $table->string('nombre')->nullable();

            $table->integer('orden')->default(0);
            // 'visible' colisionaría con la propiedad $visible de Eloquent.
            $table->boolean('es_visible')->default(true);

            // Contenido del bloque y ajustes de presentación.
            $table->jsonb('datos')->default(DB::raw("'{}'::jsonb"));
            $table->jsonb('estilos')->default(DB::raw("'{}'::jsonb"));

            $table->timestamps();
            $table->softDeletes();

            $table->index(['pagina_id', 'orden']);
        });

        /*
         * Publicar congela el borrador en un snapshot. Así el historial y la
         * reversión salen gratis, y el público lee siempre algo estable.
         */
        Schema::create('pagina_versiones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pagina_id')->constrained('paginas')->cascadeOnDelete();
            $table->jsonb('snapshot');
            $table->string('etiqueta')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['pagina_id', 'created_at']);
        });

        // Se añade al final porque apunta a una tabla creada después.
        Schema::table('paginas', function (Blueprint $table) {
            $table->foreign('version_publicada_id')
                ->references('id')
                ->on('pagina_versiones')
                ->nullOnDelete();
        });

        Schema::create('medios', function (Blueprint $table) {
            $table->id();
            $table->string('disco', 30)->default('public');
            $table->string('ruta');
            $table->string('nombre_original');
            $table->string('mime', 100);
            $table->unsignedBigInteger('tamano');
            $table->unsignedInteger('ancho')->nullable();
            $table->unsignedInteger('alto')->nullable();
            $table->string('alt')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('mime');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('paginas', function (Blueprint $table) {
            $table->dropForeign(['version_publicada_id']);
        });

        Schema::dropIfExists('medios');
        Schema::dropIfExists('pagina_versiones');
        Schema::dropIfExists('pagina_secciones');
        Schema::dropIfExists('paginas');
    }
};
