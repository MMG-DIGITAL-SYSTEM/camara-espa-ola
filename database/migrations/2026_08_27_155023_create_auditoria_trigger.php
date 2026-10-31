<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private array $tablas = [
        'users', 'socios', 'patrocinadores', 'actividades',
        'noticias', 'boletines', 'suscriptores', 'tramites',
    ];

    public function up(): void
    {
        DB::unprepared(<<<'SQL'
CREATE OR REPLACE FUNCTION fn_registrar_auditoria() RETURNS TRIGGER AS $$
DECLARE
    v_usuario_id INTEGER;
BEGIN
    BEGIN
        v_usuario_id := NULLIF(current_setting('app.usuario_id', true), '')::INTEGER;
    EXCEPTION WHEN OTHERS THEN
        v_usuario_id := NULL;
    END;

    IF TG_OP = 'DELETE' THEN
        INSERT INTO auditoria (tabla, registro_id, accion, usuario_id, datos_anteriores)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', v_usuario_id, to_jsonb(OLD));
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO auditoria (tabla, registro_id, accion, usuario_id, datos_anteriores, datos_nuevos)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', v_usuario_id, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO auditoria (tabla, registro_id, accion, usuario_id, datos_nuevos)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', v_usuario_id, to_jsonb(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
SQL);

        foreach ($this->tablas as $tabla) {
            DB::unprepared("CREATE TRIGGER trg_{$tabla}_auditoria AFTER INSERT OR UPDATE OR DELETE ON {$tabla} FOR EACH ROW EXECUTE FUNCTION fn_registrar_auditoria();");
        }
    }

    public function down(): void
    {
        foreach ($this->tablas as $tabla) {
            DB::unprepared("DROP TRIGGER IF EXISTS trg_{$tabla}_auditoria ON {$tabla};");
        }

        DB::unprepared('DROP FUNCTION IF EXISTS fn_registrar_auditoria();');
    }
};
