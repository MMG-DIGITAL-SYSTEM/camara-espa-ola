---
paths:
  - 'resources/js/**'
---

# Js

## Regenerar Wayfinder siempre con --with-form
`vite.config.ts` configura el plugin con `formVariants: true`, pero `php artisan wayfinder:generate` por CLI NO las incluye por defecto: regenera sin `.form()` y rompe el tipado de login, register, profile, security y delete-user, que sí lo usan.

Usa siempre `php artisan wayfinder:generate --with-form`, o deja que lo regenere `npm run build` / `npm run dev`.
