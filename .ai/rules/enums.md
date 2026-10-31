---
paths:
  - app/Enums/Rol.php
---

# Enums

## El rol Empresa no accede al panel: tiene su portal
`accedeAlPanel()` es solo Administrador y Editor. Se usa en el middleware `admin`, en el gate `gestionar-contenido` y en la vista previa de borradores, así que si devolviera true para Empresa, una cuenta de socio podría editar páginas y noticias.

Las cuentas Empresa entran por `/empresa` (middleware `empresa`, `accedeAlPortalDeEmpresas()`), necesitan `users.socio_id` y solo tocan las ofertas de su socio (`OfertaEmpleoPolicy::gestionar`). Si añades un rol nuevo, decide de forma explícita en qué área entra.
