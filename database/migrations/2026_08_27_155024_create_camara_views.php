<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared('CREATE VIEW v_socios_activos AS SELECT * FROM socios WHERE deleted_at IS NULL');
        DB::unprepared('CREATE VIEW v_patrocinadores_activos AS SELECT * FROM patrocinadores WHERE deleted_at IS NULL');
        DB::unprepared("CREATE VIEW v_noticias_publicadas AS SELECT n.* FROM noticias n JOIN estados_publicacion e ON e.id = n.estado_id WHERE n.deleted_at IS NULL AND e.nombre = 'Publicada'");
        DB::unprepared("CREATE VIEW v_actividades_publicadas AS SELECT a.* FROM actividades a JOIN estados_publicacion e ON e.id = a.estado_id WHERE a.deleted_at IS NULL AND e.nombre = 'Publicada'");
    }

    public function down(): void
    {
        DB::unprepared('DROP VIEW IF EXISTS v_socios_activos');
        DB::unprepared('DROP VIEW IF EXISTS v_patrocinadores_activos');
        DB::unprepared('DROP VIEW IF EXISTS v_noticias_publicadas');
        DB::unprepared('DROP VIEW IF EXISTS v_actividades_publicadas');
    }
};
