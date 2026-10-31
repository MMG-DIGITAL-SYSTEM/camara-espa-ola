---
paths:
  - 'resources/js/blocks/**'
---

# Blocks

## Bloques y elementos: una pieza se declara en dos sitios y hay test que lo comprueba
Cada bloque se declara en `resources/js/blocks/registro.ts` (aspecto + campos) y su clave en `App\Bloques\RegistroDeBloques`. Cada elemento del lienzo, en `blocks/elementos.ts` y `App\Bloques\RegistroDeElementos`. BloqueTest y ElementoTest leen los archivos TS con regex y comparan claves y campos richtext: si añades una pieza solo en un lado, falla la suite.

El panel de propiedades se genera desde `campos`, así que añadir una pieza NO debe obligar a tocar `components/admin/editor/*`. Si te ves editando el editor para añadir un bloque, falta un `tipo` de campo, no un caso especial.

Los campos `richtext` se sanean en el servidor al guardar (`Pagina::guardarBorrador` → `RegistroDeBloques::sanearDatos`), nunca en el cliente.
