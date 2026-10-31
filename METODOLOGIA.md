# Cómo se construyó este panel, paso a paso

Guía para repetir esta arquitectura en otro proyecto. No es la documentación del
código —eso está en los comentarios— sino **el orden de las decisiones** y el
porqué de cada una, que es lo que no se deduce leyendo los archivos.

Pila: Laravel 13 · PHP 8.3 · Inertia v3 · React 19 · TypeScript · Tailwind v4 ·
PostgreSQL · Pest. La metodología no depende de esa pila; lo que importa son los
cuatro principios de la sección siguiente.

---

## 0. Los cuatro principios

Todo lo demás sale de aquí. Si copias una sola cosa de este documento, que sea
esta sección.

### 0.1 Una pieza se declara en un sitio, no en cinco

El error clásico al hacer un constructor visual es que añadir un bloque nuevo
obligue a tocar: el componente, el formulario de edición, la validación, el
renderizador y la lista del catálogo. A la tercera pieza ya nadie quiere añadir
la cuarta.

Aquí cada pieza se declara **una vez**, con un esquema de campos, y el editor se
genera solo:

```ts
{
  clave: 'hero',
  nombre: 'Portada',
  icono: Layers,
  categoria: 'Estructura',
  componente: BloqueHero,
  defaults: { titulo: '…' },
  campos: [
    { tipo: 'texto',  clave: 'titulo',  etiqueta: 'Título' },
    { tipo: 'imagen', clave: 'imagen',  etiqueta: 'Imagen de fondo' },
    { tipo: 'enlace', clave: 'boton_enlace', etiqueta: 'Enlace del botón' },
  ],
}
```

El panel de propiedades recorre `campos` y pinta el control que corresponde a
cada `tipo`. **Añadir un bloque no toca el editor.** Ese es el test: si añadir
una pieza te obliga a abrir el editor, el diseño está mal.

### 0.2 Borrador y publicado son dos cosas distintas

- `pagina_secciones` es el **borrador vivo**: lo que el editor está tocando.
- `pagina_versiones` guarda **instantáneas** (`snapshot jsonb`) congeladas.
- `paginas.version_publicada_id` apunta a la instantánea que ve el público.

Publicar = copiar el borrador a una versión nueva y mover el puntero. Con eso
sale gratis el historial, la reversión y que nadie vea a medias lo que estás
editando. Sin esto acabas inventando un campo `estado` y parcheando casos raros
para siempre.

### 0.3 La vista previa usa los componentes reales

Nada de un renderizador «de mentira» para el editor. El preview monta
`BloqueHero` — el mismo que sirve el sitio público. Lo que ves es lo que hay.

Dos consecuencias que hay que resolver a propósito:

- **Las animaciones de entrada sobran dentro del editor.** Los bloques aparecen
  con `IntersectionObserver`; en un preview que se repinta a cada tecla eso los
  deja parpadeando o invisibles. Solución: un contexto `ContextoEditor` que los
  hace nacer visibles.
- **Los enlaces no deben navegar.** El contenido del preview va dentro de un
  `pointer-events-none`, y solo los adornos del editor reactivan el puntero.

Se descartó el iframe: aislaría el CSS, pero cada clic pasaría a ser un mensaje
entre ventanas. Con el preview en la misma página, seleccionar es una llamada a
función.

### 0.4 El saneamiento vive en el servidor, sin excepciones

El HTML del editor enriquecido acaba en `dangerouslySetInnerHTML`. Sanearlo en
el cliente no sirve de nada: quien llame al endpoint manda lo que quiera. Se
sanea **en el modelo, al guardar**, no en el controlador, para que ninguna ruta
futura se lo salte por olvido.

---

## 1. Fase 0 — Desbloquear el entorno

Antes de escribir una línea, comprobar que la base de datos responde:

```bash
php -m | grep pgsql          # ¿está la extensión?
php artisan migrate:status   # ¿conecta de verdad?
```

**No se avanza hasta que `migrate:status` responda.** Arrancar a escribir
migraciones con el driver sin habilitar es garantía de perder una tarde.

Aquí faltaba `pdo_pgsql` en el `php.ini` de Laragon. Un detalle así bloquea el
proyecto entero y no se ve en el código.

Después: instalar de una vez las dependencias que sabes que vas a usar, y
ninguna más.

```bash
npm i @tiptap/react @tiptap/starter-kit @tiptap/extension-link \
      @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
php artisan storage:link
```

---

## 2. Fase 1 — Quitar lo que estorba antes de construir

Este proyecto arrancó de un starter kit **con equipos** (multi-tenant). Eso
contaminaba URLs (`/{current_team}/dashboard`), middleware, respuestas de login
y ~80 archivos. Y la tabla `teams` se había reutilizado como directorio de
socios: dos conceptos sin relación en la misma tabla.

**Lección metodológica: la limpieza va primero, no al final.** Construir encima
de una capa que vas a quitar significa hacerlo dos veces.

El orden que funcionó:

1. Listar lo que se borra, archivo por archivo, antes de borrar nada.
2. **Reescribir las migraciones en vez de apilar una migración de limpieza.** Si
   la base es de pruebas, `migrate:fresh` deja un esquema limpio de verdad. Una
   pila de «añade columna / quita columna» es deuda desde el día uno.
3. Sustituir el concepto, no solo borrarlo: `teams` → `socios` como entidad
   propia, con su migración en la misma posición (las claves foráneas dependen
   del orden de los timestamps del nombre de archivo).
4. Roles: reutilizar `roles` y `users.rol_id` si ya existen. Un enum
   `App\Enums\Rol`, un `EnsureEsAdmin` como alias `admin`, y las respuestas de
   Fortify redirigiendo según el rol.
5. Comprobación objetiva: `grep -ri "team" app/ routes/ resources/js/` no
   devuelve nada.

---

## 3. Fase 2 — El armazón del panel

Un layout **propio**, no el del starter kit. Mezclarlos obliga a condicionales
en cada componente compartido.

```
resources/js/layouts/admin/admin-layout.tsx
resources/js/components/admin/
  admin-sidebar.tsx   admin-topbar.tsx   command-palette.tsx
  page-header.tsx     data-table.tsx     empty-state.tsx
  stat-card.tsx       confirm-dialog.tsx lista-ordenable.tsx
```

Decisiones que ahorraron trabajo después:

- **Los primitivos de `components/ui/` no se reescriben.** Botón, diálogo,
  select, sheet, badge ya estaban; el panel los usa tal cual.
- **Tokens de color en un solo sitio** (`--marca`, `--marca-suave`,
  `--marca-foreground` en `app.css`), en `oklch`, compartidos entre el panel y
  el sitio. Cambiar el rojo de marca es cambiar una línea.
- **El layout se elige en el resolvedor de Inertia, por prefijo de ruta**, no
  archivo por archivo:

```tsx
layout: (name) => {
    if (name.startsWith('Public/')) return null;   // traen el suyo
    if (name === 'Admin/Paginas/Editor') return null; // pantalla completa
    if (name.startsWith('Admin/')) return AdminLayout;
    return AppLayout;
},
```

- **El primer CRUD es el que valida el `DataTable`.** Aquí fueron Usuarios y
  Roles: pequeños, sin lógica de negocio, y obligan a resolver paginación,
  búsqueda, confirmación de borrado y avisos. Los diez CRUD siguientes ya solo
  rellenan una plantilla.

---

## 4. Fase 3 — El motor

### 4.1 Esquema

```
paginas            id, slug unique, titulo, tipo ('libre'|'modulo'), modulo,
                   version_publicada_id, seo_*, es_sistema, orden, autoría, softDeletes
pagina_secciones   id, pagina_id, bloque, nombre, orden, es_visible,
                   datos jsonb, estilos jsonb          ← el borrador
pagina_versiones   id, pagina_id, snapshot jsonb, etiqueta, created_by, created_at
medios             id, disco, ruta, nombre_original, mime, tamano, ancho, alto, alt
```

Tres avisos que cuestan tiempo si no los sabes:

- **`jsonb` no conserva el orden de las claves.** Comparar el borrador con el
  snapshot con `===` da siempre «hay cambios». Hay que normalizar recursivamente
  ordenando claves antes de comparar.
- **No llames `visible` a una columna de un modelo Eloquent.** Choca con la
  propiedad `$visible` del propio Eloquent y el atributo devuelve `[]` en
  silencio, sin error. Aquí se llama `es_visible`.
- **Si recortas la relación con `select`, incluye lo que usa tu lógica.**
  `with('versionPublicada:id,created_at')` dejaba fuera `snapshot`, y entonces
  *todas* las páginas publicadas se reportaban «con cambios sin publicar».

### 4.2 El registro, en los dos lados

En el cliente vive el aspecto. En el servidor vive **qué claves son válidas y
cuáles necesitan datos de la base**:

```php
private const ESTRUCTURALES = ['lienzo', 'hero', 'texto', …];
private const CON_DATOS = ['noticias-recientes' => UltimasNoticias::class, …];
private const RICHTEXT  = ['texto' => ['contenido'], …];
```

**Las dos listas se separan tarde o temprano.** La solución barata es un test
que lee el archivo TypeScript con una expresión regular y compara:

```php
test('los registros de bloques de PHP y del cliente coinciden', function () {
    preg_match_all("/^\s{8}clave: '([^']+)',/m", $fuenteTs, $js);
    expect(sort($js[1]))->toBe(sort(RegistroDeBloques::claves()));
});
```

Poco elegante y enormemente rentable: cuando alguien añade un bloque solo en un
lado, lo dice la suite, no un 500 en producción.

### 4.3 Bloques con datos

Un bloque «últimas noticias» consulta la base. Contrato `ProveeDatos`, una clase
por proveedor, y **memoización por bloque + configuración**: dos bloques de
noticias iguales en la misma página hacen una consulta, no dos.

```php
$huella = $bloque.':'.md5(json_encode($config));
$resueltos[$seccion['id']] = $memoria[$huella] ??= self::datosDe($bloque, $config);
```

### 4.4 Render público

`PaginaController@show`: slug → snapshot publicado → precarga de datos →
`Inertia::render('Public/Pagina')`. La ruta comodín va **la última** de
`routes/web.php`, después de todas las fijas.

Un slug sin versión publicada responde 404, salvo que el visitante sea admin:
eso da la previsualización del borrador gratis.

---

## 5. Fase 4 — El editor

Tres columnas: árbol · vista previa · propiedades.

### 5.1 Estado: un reducer con historial

```ts
type HistorialEditor = {
    presente: EstadoEditor;
    pasado: EstadoEditor[];
    futuro: EstadoEditor[];
};
```

Deshacer mueve `presente` a `futuro` y saca de `pasado`. Detalle que casi
siempre se olvida: **hay acciones que no deben ensuciar el historial.**
Seleccionar una sección no es una edición; si lo fuera, Ctrl+Z desharía clics.

```ts
const SIN_HISTORIAL = ['seleccionar', 'asignarIds', 'reemplazar', …];
```

### 5.2 Claves locales: el detalle que evita duplicados

Una sección recién añadida no tiene `id` todavía. Si el autoguardado se dispara
dos veces seguidas, se crea dos veces.

La solución es dar a cada sección una **clave local estable** en el momento de
crearla (`s_x7f3k2…`). Se manda al servidor, el servidor responde un mapa
`clave → id`, y el cliente asigna los ids sin recargar ni perder el foco.

```ts
despachar({ tipo: 'asignarIds', mapa: respuesta.mapa });
```

### 5.3 Autoguardado sin robar el foco

**El autoguardado no puede ser una visita de Inertia.** Una visita recarga las
props y el input pierde el cursor a mitad de una palabra. Se usa `fetch` con el
`X-XSRF-TOKEN` de la cookie, y el controlador responde JSON:

```ts
await peticionJson(borrador(slug).url, 'PUT', { secciones: cargaUtil(actuales) });
```

Con retardo (900 ms), y una **firma** (`JSON.stringify` de la carga útil) para
no guardar cuando no hay cambios ni comparar objetos enteros a cada tecla.

### 5.4 Arrastrar y soltar

`@dnd-kit/sortable` con dos detalles:

```ts
useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
```

Sin ese umbral, un clic para seleccionar se interpreta como arrastre.

Y la regla importante: **un solo `DndContext` para todo el árbol**, con un
`SortableContext` por lista. Anidar contextos hace que el mismo gesto lo
atiendan los dos a la vez. Si necesitas ordenar listas dentro de listas, es una
lista de `SortableContext` hermanos bajo un contexto único, y en `onDragEnd`
averiguas a qué lista pertenece lo que se arrastró.

---

## 6. Fase 5 — Catálogo y conversión de las vistas

Dos familias de bloques:

- **Estructurales**: muestran lo que escribió el editor (hero, texto, galería,
  acordeón, cifras, línea de tiempo, vídeo, mapa…).
- **Dinámicos**: leen la base (servicios, últimas noticias, próximas
  actividades, directorio, socios…).

Para convertir vistas ya escritas a mano, **no se rediseña nada**: se recorta el
JSX existente y se parametriza lo que era texto fijo. El diseño ya estaba
aprobado; rehacerlo solo añade riesgo.

Para las páginas de módulo (Noticias, Socios…), que tienen filtros y paginación
propios, el patrón es distinto: **conservan su componente a medida** y el
controlador les inyecta secciones alrededor del listado. Un separador con nombre
`listado` parte las secciones en `seccionesArriba` y `seccionesAbajo`. Así el
hero y el pie son editables sin reescribir la lógica de filtrado.

---

## 7. Fase 6 — Lo que convierte el prototipo en producto

Un constructor de páginas sin esto no lo usa nadie:

- **Biblioteca de medios** con subida por arrastre, búsqueda, texto alternativo
  y —lo importante— un **selector reutilizable** que aparece en todo campo de
  tipo `imagen`. Validar por extensión *y* por MIME real.
- **CRUDs** del contenido que alimenta los bloques dinámicos.
- **Menú del sitio** en base de datos, no en un archivo de configuración.
- **Ajustes**: datos de contacto, redes, SEO por defecto. Declarados como una
  constante en el controlador con grupo, etiqueta, tipo y reglas; el formulario
  se genera desde ahí. Mismo principio que los bloques.

Aquí aparecieron dos bugs que conviene buscar a propósito en cualquier proyecto
heredado:

- **Catálogos con entradas duplicadas** («publicado» con id 5 y «Publicada» con
  id 1), y esos ids escritos a pelo en modelos y en el API. Una noticia creada
  desde el panel no habría aparecido nunca en el sitio. Regla: **resolver
  siempre por nombre, nunca por id literal.**
- **Columnas que el modelo declara y la tabla no tiene.** `servicios` no tenía
  `created_by`/`updated_by`; cualquier alta fallaba al insertar.

---

## 8. Fase 7 — El lienzo libre

Hasta aquí el editor apila secciones de un catálogo cerrado. Eso resuelve el 80 %
de las páginas de un clic, pero no deja **componer**: no puedes añadir una
tarjeta suelta donde quieras.

La solución no fue abrir los bloques, sino **repetir el mismo patrón un nivel
más abajo**.

### 8.1 La idea

Un bloque contenedor (`lienzo`) cuyo contenido es una lista de **elementos**, y
un catálogo de elementos con exactamente el mismo contrato que el de bloques:

```ts
type DefinicionElemento = {
    clave, nombre, descripcion, icono, categoria,
    componente, defaults, campos,
    anchoPorDefecto?: AnchoElemento,
};
```

Cada elemento guardado lleva su sitio en la rejilla:

```ts
type ElementoLienzo = {
    clave: string;          // identificador local estable
    elemento: string;       // clave del catálogo
    ancho: AnchoElemento;   // 'completo' | 'dos-tercios' | 'mitad' | 'tercio' | 'cuarto'
    datos: Record<string, unknown>;
};
```

**El ancho se guarda por nombre, no en columnas.** Si mañana la rejilla pasa de
12 a 16 columnas, no hay que reescribir el contenido publicado.

El bloque declara que es contenedor con una bandera, y el panel de propiedades
reacciona a ella:

```ts
{ clave: 'lienzo', admiteElementos: true, … }
```

### 8.2 Selección dentro del preview, sin iframe

El truco que hace que funcione:

```tsx
<div className="pointer-events-none">        {/* la sección entera */}
    <div className="pointer-events-auto" onClick={seleccionar}>  {/* el marco */}
        <div className="pointer-events-none">{children}</div>    {/* la pieza */}
    </div>
</div>
```

El marco recupera el puntero para poder recibir el clic; su contenido lo vuelve
a soltar, así que **el clic siempre cae en el marco y nunca en el enlace que hay
debajo**. Sin la tercera capa, pulsar una tarjeta navegaría fuera del editor.

Las acciones viajan por contexto, y valen `null` en el sitio público:

```tsx
export const ContextoLienzo = createContext<AccionesLienzo | null>(null);

// dentro del componente del marco
if (!acciones) return <>{children}</>;   // web pública: ningún adorno
```

Un mismo componente sirve para el sitio y para el editor sin una sola bandera
`if (editando)` repartida por el código.

### 8.3 Saneamiento anidado

El HTML enriquecido ya no está solo en `datos.contenido`, sino en
`datos.elementos[*].datos.contenido`. En vez de un caso especial, una lista
declarativa más:

```php
private const CON_ELEMENTOS = ['lienzo'];

if (self::admiteElementos($bloque)) {
    $datos['elementos'] = RegistroDeElementos::sanearElementos($datos['elementos'] ?? []);
}
```

Y `sanearElementos` **descarta lo que no reconoce en lugar de fallar**. Una
página publicada puede arrastrar una pieza retirada del catálogo; es preferible
perder esa pieza a bloquear el guardado entero de la página.

### 8.4 Qué piezas incluir

Doce bastan para componer casi todo: título, párrafo, lista de puntos, cita,
imagen, vídeo, tarjeta, característica, cifra, botón, separador y espacio.

Criterio: **una pieza entra al catálogo cuando aparece por tercera vez** en un
diseño. Antes de eso es un caso particular y ensucia el catálogo.

---

## 9. Recetas

### Añadir un bloque

1. Escribe el componente en `resources/js/blocks/componentes/`. Recibe
   `{ datos, estilos, contenido? }` y envuelve todo en `EnvoltorioSeccion`.
2. Añade la entrada al array `BLOQUES` con sus `campos`.
3. Añade la clave a `ESTRUCTURALES` (o a `CON_DATOS` con su proveedor) en PHP.
4. Si tiene HTML enriquecido, decláralo en `RICHTEXT` en ambos lados.
5. `php artisan test --filter=BloqueTest`.

No hay paso 6. El editor ya sabe editarlo.

### Añadir un elemento del lienzo

Lo mismo, con `ELEMENTOS`, `RegistroDeElementos` y `ElementoTest`.

### Añadir un tipo de campo

Este sí toca el editor, y es el único que debería:

1. Amplía la unión `Campo` en `blocks/tipos.ts`.
2. Añade el `case` en `components/admin/editor/campo.tsx`.
3. Si acepta HTML, súmalo al saneamiento del servidor.

---

## 10. Trampas que costaron tiempo

| Síntoma | Causa | Regla que queda |
| --- | --- | --- |
| Una vista da 500 y las demás no | El *entrypoint* de Vite se construía como `pages/{componente}.tsx` y esa vivía en `.../index.tsx` | Resuelve el entrypoint contra el manifiesto y devuelve `null` si no está; y nombra los archivos igual que los componentes |
| Un atributo devuelve `[]` sin error | Columna llamada `visible`, choca con `$visible` de Eloquent | No uses nombres de propiedades de Eloquent como columnas |
| Todo sale «sin publicar» | `select` en la relación sin la columna que usa la comparación | Si recortas columnas, incluye las que lee tu lógica |
| Comparar jsonb siempre da distinto | Postgres no conserva el orden de claves | Normaliza ordenando claves antes de comparar |
| `TypeError` con fechas | `Date::use(CarbonImmutable::class)` activo | Tipa `CarbonInterface`, nunca la clase concreta |
| El primer elemento de una lista recibe orden 1 | `(int) null + 1` | Un helper `siguienteOrden()` que trate el caso vacío |
| El input pierde el foco al guardar | El autoguardado era una visita de Inertia | Autoguardado = petición JSON, nunca una visita |
| El clic para seleccionar arrastra | `PointerSensor` sin umbral | `activationConstraint: { distance: 5 }` |
| Dos zonas de arrastre pelean | `DndContext` anidados | Un contexto, varios `SortableContext` |

---

## 11. Verificación

**Por fase, no al final.** Cada fase cierra con:

```bash
php artisan test --compact
npx tsc --noEmit
npx eslint resources/js --max-warnings=0
vendor/bin/pint --dirty --format agent
npm run build
```

Y los tests que de verdad protegen esta arquitectura:

- **Sincronía de registros** PHP ↔ TypeScript (bloques, elementos, ajustes).
- **Ciclo completo del constructor**: crear página, añadir sección, reordenar,
  publicar, revertir a una versión anterior.
- **Saneamiento**: que el `<script>` no sobreviva al guardado, y que el texto
  plano **no** se escape (un título «Costes < 10 %» debe guardarse tal cual).
- **Visibilidad pública**: un borrador da 404 al visitante y 200 al admin.
- **Rechazos**: un bloque inventado y un estilo fuera de las opciones no pasan
  la validación.

---

## 12. Trasplantar esto a otro proyecto

En orden, y sin saltarse pasos:

1. **Fase 0** — entorno verificado. No negociable.
2. **Fase 1** — fuera lo que sobra del starter kit, migraciones reescritas.
3. **Fase 3 antes que la 2 si tienes prisa** — el motor (esquema + registro +
   render público) es lo que da valor; el armazón del panel puede ser feo al
   principio.
4. **Un solo bloque de extremo a extremo antes que diez.** Hero, con su campo de
   texto y su imagen, publicado y visible en el sitio. Hasta que ese recorrido
   funciona, no se añaden más piezas.
5. **El lienzo, al final.** Es una capa sobre el motor; sin motor no hay dónde
   apoyarla.

Lo que se lleva tal cual entre proyectos:
`app/Support/HtmlSeguro.php`, `app/Bloques/*`, `resources/js/blocks/*`,
`resources/js/components/admin/editor/*`, el reducer `estado.ts` y
`lib/http.ts`. Lo que cambia es el catálogo de piezas y la identidad visual.
