---
paths:
  - 'app/Models/**'
---

# Models

## No llamar `visible` a una columna: colisiona con Eloquent
Eloquent\Model ya define `protected $visible` (atributos visibles al serializar). Una columna llamada `visible` hace que `$modelo->visible` devuelva esa propiedad (un array vacío) en vez del atributo, sin lanzar ningún error.

Pasó en `pagina_secciones`; se renombró a `es_visible`. Usa `es_*` o `activo` para los booleanos, como el resto del esquema.

Otros nombres reservados a evitar: `hidden`, `casts`, `fillable`, `appends`, `attributes`, `connection`, `table`, `keyType`, `timestamps`, `with`, `original`, `exists`, `incrementing`.

## Pivotes: withTimestamps() solo si la tabla tiene las dos columnas
`actividades_patrocinadores` se creó con `created_at` a secas (clave primaria compuesta, sin `updated_at`), pero `Actividad::patrocinadores()` y `Patrocinador::actividades()` pedían `withTimestamps()`. Eloquent añade `pivot_updated_at` al SELECT y la consulta revienta con «no existe la columna» — el detalle público de cualquier actividad devolvía 500.

Antes de declarar `withTimestamps()` en un belongsToMany, comprueba la migración del pivote. Si solo hay `created_at`, usa `->withPivot('…', 'created_at')` y deja que la base lo rellene con `useCurrent()`.

Es la misma familia que el resto de la deriva de esquema de este proyecto (columnas que el modelo declara y la tabla no tiene): la migración manda, el modelo se adapta.
