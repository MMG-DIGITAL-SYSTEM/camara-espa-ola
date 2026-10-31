<?php

// database/migrations/2026_08_28_000001_create_directivos_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('directivos', function (Blueprint $table) {
            $table->id();

            $table->string('nombre');
            $table->string('cargo')->nullable();
            $table->string('empresa')->nullable();

            $table->string('imagen')->nullable();
            $table->integer('orden')->default(0);
            $table->boolean('activo')->default(true);

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            $table->index('activo');
            $table->index('orden');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('directivos');
    }
};
