---
paths:
  - 'resources/js/components/admin/editor/**'
---

# Editor

## Editor visual: un solo DndContext y la regla de los pointer-events
Arrastre: un único `DndContext` para todo el árbol, con un `SortableContext` por lista (secciones, y uno por lienzo). Anidar contextos hace que el mismo gesto lo atiendan los dos. En `onDragEnd` se averigua a qué lista pertenece el id activo. `PointerSensor` siempre con `activationConstraint: { distance: 5 }`, o un clic para seleccionar se lee como arrastre.

Vista previa: el contenido va en `pointer-events-none` para que los enlaces no naveguen. Un elemento seleccionable recupera el puntero con `pointer-events-auto` en su marco y lo vuelve a soltar en un div interior, de modo que el clic cae en el marco y no en el enlace de debajo. Las tres capas son necesarias.

Autoguardado: petición JSON con `peticionJson()`, nunca una visita de Inertia — una visita recarga las props y el input pierde el foco a mitad de palabra.
