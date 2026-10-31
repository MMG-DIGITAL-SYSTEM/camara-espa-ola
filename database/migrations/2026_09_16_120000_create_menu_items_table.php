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
        Schema::create('menu_items', function (Blueprint $table) {
            $table->id();

            // 'principal' es la barra de navegación; 'pie', el pie de página.
            $table->string('ubicacion', 20)->default('principal');

            $table->string('titulo', 120);

            // Null en las entradas que solo despliegan un submenú.
            $table->string('url')->nullable();

            $table->foreignId('padre_id')->nullable()->constrained('menu_items')->cascadeOnDelete();
            $table->integer('orden')->default(0);
            $table->boolean('activo')->default(true);
            $table->boolean('nueva_pestana')->default(false);
            $table->timestamps();

            $table->index(['ubicacion', 'orden']);
        });

        DB::statement("ALTER TABLE menu_items ADD CONSTRAINT menu_items_ubicacion_check CHECK (ubicacion IN ('principal','pie'))");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_items');
    }
};
