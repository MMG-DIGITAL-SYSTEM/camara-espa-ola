# Camara-esp
PracticaProfesional

```
camara-esp
├─ .claude
│  └─ skills
│     ├─ fortify-development
│     │  └─ SKILL.md
│     ├─ inertia-react-development
│     │  └─ SKILL.md
│     ├─ infer-conventions
│     │  ├─ references
│     │  │  └─ checklist.md
│     │  └─ SKILL.md
│     ├─ laravel-best-practices
│     │  ├─ rules
│     │  │  ├─ advanced-queries.md
│     │  │  ├─ architecture.md
│     │  │  ├─ blade-views.md
│     │  │  ├─ caching.md
│     │  │  ├─ collections.md
│     │  │  ├─ config.md
│     │  │  ├─ db-performance.md
│     │  │  ├─ eloquent.md
│     │  │  ├─ error-handling.md
│     │  │  ├─ events-notifications.md
│     │  │  ├─ http-client.md
│     │  │  ├─ mail.md
│     │  │  ├─ migrations.md
│     │  │  ├─ queue-jobs.md
│     │  │  ├─ routing.md
│     │  │  ├─ scheduling.md
│     │  │  ├─ security.md
│     │  │  ├─ style.md
│     │  │  ├─ testing.md
│     │  │  └─ validation.md
│     │  └─ SKILL.md
│     ├─ pest-testing
│     │  └─ SKILL.md
│     ├─ tailwindcss-development
│     │  └─ SKILL.md
│     └─ wayfinder-development
│        └─ SKILL.md
├─ .editorconfig
├─ .mcp.json
├─ .npmrc
├─ .prettierignore
├─ .prettierrc
├─ app
│  ├─ Actions
│  │  ├─ Fortify
│  │  │  ├─ CreateNewUser.php
│  │  │  └─ ResetUserPassword.php
│  │  └─ Teams
│  │     └─ CreateTeam.php
│  ├─ Concerns
│  │  ├─ GeneratesUniqueTeamSlugs.php
│  │  ├─ HasTeams.php
│  │  ├─ PasswordValidationRules.php
│  │  └─ ProfileValidationRules.php
│  ├─ Console
│  │  └─ Commands
│  ├─ Data
│  │  ├─ TeamPermissions.php
│  │  └─ UserTeam.php
│  ├─ Enums
│  │  ├─ TeamPermission.php
│  │  └─ TeamRole.php
│  ├─ Http
│  │  ├─ Controllers
│  │  │  ├─ Controller.php
│  │  │  ├─ DashboardController.php
│  │  │  ├─ Settings
│  │  │  │  ├─ ProfileController.php
│  │  │  │  └─ SecurityController.php
│  │  │  └─ Teams
│  │  │     ├─ TeamController.php
│  │  │     ├─ TeamInvitationController.php
│  │  │     └─ TeamMemberController.php
│  │  ├─ Middleware
│  │  │  ├─ EnsureTeamMembership.php
│  │  │  ├─ HandleAppearance.php
│  │  │  ├─ HandleInertiaRequests.php
│  │  │  └─ SetTeamUrlDefaults.php
│  │  ├─ Requests
│  │  │  ├─ Settings
│  │  │  │  ├─ PasswordUpdateRequest.php
│  │  │  │  ├─ ProfileDeleteRequest.php
│  │  │  │  ├─ ProfileUpdateRequest.php
│  │  │  │  └─ TwoFactorAuthenticationRequest.php
│  │  │  └─ Teams
│  │  │     ├─ CreateTeamInvitationRequest.php
│  │  │     ├─ DeleteTeamRequest.php
│  │  │     ├─ RespondToTeamInvitationRequest.php
│  │  │     ├─ SaveTeamRequest.php
│  │  │     └─ UpdateTeamMemberRequest.php
│  │  └─ Responses
│  │     ├─ Concerns
│  │     │  └─ RedirectsToCurrentTeam.php
│  │     ├─ LoginResponse.php
│  │     ├─ RegisterResponse.php
│  │     ├─ TwoFactorLoginResponse.php
│  │     └─ VerifyEmailResponse.php
│  ├─ Models
│  │  ├─ Membership.php
│  │  ├─ Team.php
│  │  ├─ TeamInvitation.php
│  │  └─ User.php
│  ├─ Notifications
│  │  └─ Teams
│  │     └─ TeamInvitation.php
│  ├─ Policies
│  │  └─ TeamPolicy.php
│  ├─ Providers
│  │  ├─ AppServiceProvider.php
│  │  └─ FortifyServiceProvider.php
│  └─ Rules
│     ├─ TeamName.php
│     ├─ UniqueTeamInvitation.php
│     └─ ValidTeamInvitation.php
├─ artisan
├─ boost.json
├─ bootstrap
│  ├─ app.php
│  ├─ cache
│  │  ├─ packages.php
│  │  └─ services.php
│  └─ providers.php
├─ CLAUDE.md
├─ components.json
├─ composer.json
├─ composer.lock
├─ config
│  ├─ app.php
│  ├─ auth.php
│  ├─ cache.php
│  ├─ database.php
│  ├─ filesystems.php
│  ├─ fortify.php
│  ├─ inertia.php
│  ├─ logging.php
│  ├─ mail.php
│  ├─ queue.php
│  ├─ services.php
│  └─ session.php
├─ database
│  ├─ database.sqlite
│  ├─ factories
│  │  ├─ TeamFactory.php
│  │  ├─ TeamInvitationFactory.php
│  │  └─ UserFactory.php
│  ├─ migrations
│  │  ├─ 0001_01_01_000000_create_users_table.php
│  │  ├─ 0001_01_01_000001_create_cache_table.php
│  │  ├─ 0001_01_01_000002_create_jobs_table.php
│  │  ├─ 2026_01_27_000001_create_teams_table.php
│  │  ├─ 2026_01_27_000002_add_current_team_id_to_users_table.php
│  │  ├─ 2026_08_27_154956_create_roles_table.php
│  │  ├─ 2026_08_27_154958_create_permisos_table.php
│  │  ├─ 2026_08_27_154959_create_roles_permisos_table.php
│  │  ├─ 2026_08_27_155000_add_camara_columns_to_users_table.php
│  │  ├─ 2026_08_27_155001_create_estados_publicacion_table.php
│  │  ├─ 2026_08_27_155002_create_estados_comercial_table.php
│  │  ├─ 2026_08_27_155003_create_estados_tramite_table.php
│  │  ├─ 2026_08_27_155004_create_estadosuscriptor_table.php
│  │  ├─ 2026_08_27_155005_create_visibilidad_table.php
│  │  ├─ 2026_08_27_155006_create_categorias_table.php
│  │  ├─ 2026_08_27_155007_create_categorias_afiliados_table.php
│  │  ├─ 2026_08_27_155008_create_categoriaspatrocinadores_table.php
│  │  ├─ 2026_08_27_155009_create_listasuscriptores_table.php
│  │  ├─ 2026_08_27_155010_create_tipos_tramite_table.php
│  │  ├─ 2026_08_27_155011_add_camara_columns_to_teams_table.php
│  │  ├─ 2026_08_27_155012_create_patrocinadores_table.php
│  │  ├─ 2026_08_27_155013_create_actividades_table.php
│  │  ├─ 2026_08_27_155014_create_noticias_table.php
│  │  ├─ 2026_08_27_155015_create_boletines_table.php
│  │  ├─ 2026_08_27_155016_create_suscriptores_table.php
│  │  ├─ 2026_08_27_155017_create_tramites_table.php
│  │  ├─ 2026_08_27_155018_create_auditoria_table.php
│  │  ├─ 2026_08_27_155019_create_actividades_patrocinadores_table.php
│  │  ├─ 2026_08_27_155020_create_boletin_noticias_table.php
│  │  ├─ 2026_08_27_155021_create_boletin_actividades_table.php
│  │  ├─ 2026_08_27_155022_create_boletin_envios_table.php
│  │  ├─ 2026_08_27_155023_create_auditoria_trigger.php
│  │  ├─ 2026_08_27_155024_create_camara_views.php
│  │  ├─ 2026_08_27_155025_create_solicitudes_afiliacion_table.php
│  │  ├─ 2026_08_27_155026_create_fichas_pais_table.php
│  │  ├─ 2026_08_27_155027_create_redes_camaras_table.php
│  │  ├─ 2026_08_27_155028_create_oficinas_table.php
│  │  ├─ 2026_08_27_155029_create_mensajes_contacto_table.php
│  │  ├─ 2026_08_27_155030_create_noticia_categoria_table.php
│  │  ├─ 2026_08_27_155031_create_contenido_institucional_table.php
│  │  ├─ 2026_08_27_155032_create_actividad_secciones_table.php
│  │  ├─ 2026_08_27_155033_create_actividad_archivos_table.php
│  │  ├─ 2026_08_27_155034_create_servicios_table.php
│  │  ├─ 2026_08_27_155035_create_actividad_categoria_table.php
│  │  └─ 2026_08_28_204439_create_directivos_table.php
│  └─ seeders
│     └─ DatabaseSeeder.php
├─ eslint.config.js
├─ package-lock.json
├─ package.json
├─ phpstan.neon
├─ phpunit.xml
├─ pint.json
├─ pnpm-workspace.yaml
├─ public
│  ├─ .htaccess
│  ├─ apple-touch-icon.png
│  ├─ favicon.ico
│  ├─ favicon.svg
│  ├─ index.php
│  └─ robots.txt
├─ README.md
├─ resources
│  ├─ css
│  │  └─ app.css
│  ├─ js
│  │  ├─ app.tsx
│  │  ├─ components
│  │  │  ├─ alert-error.tsx
│  │  │  ├─ app-content.tsx
│  │  │  ├─ app-header.tsx
│  │  │  ├─ app-logo-icon.tsx
│  │  │  ├─ app-logo.tsx
│  │  │  ├─ app-shell.tsx
│  │  │  ├─ app-sidebar-header.tsx
│  │  │  ├─ app-sidebar.tsx
│  │  │  ├─ appearance-tabs.tsx
│  │  │  ├─ breadcrumbs.tsx
│  │  │  ├─ cancel-invitation-modal.tsx
│  │  │  ├─ create-team-modal.tsx
│  │  │  ├─ delete-team-modal.tsx
│  │  │  ├─ delete-user.tsx
│  │  │  ├─ heading.tsx
│  │  │  ├─ input-error.tsx
│  │  │  ├─ invite-member-modal.tsx
│  │  │  ├─ leave-team-modal.tsx
│  │  │  ├─ nav-footer.tsx
│  │  │  ├─ nav-main.tsx
│  │  │  ├─ nav-user.tsx
│  │  │  ├─ password-input.tsx
│  │  │  ├─ pending-invitations-modal.tsx
│  │  │  ├─ remove-member-modal.tsx
│  │  │  ├─ team-invitation-alert.tsx
│  │  │  ├─ team-switcher.tsx
│  │  │  ├─ text-link.tsx
│  │  │  ├─ ui
│  │  │  │  ├─ alert.tsx
│  │  │  │  ├─ avatar.tsx
│  │  │  │  ├─ badge.tsx
│  │  │  │  ├─ breadcrumb.tsx
│  │  │  │  ├─ button.tsx
│  │  │  │  ├─ card.tsx
│  │  │  │  ├─ checkbox.tsx
│  │  │  │  ├─ collapsible.tsx
│  │  │  │  ├─ dialog.tsx
│  │  │  │  ├─ dropdown-menu.tsx
│  │  │  │  ├─ icon.tsx
│  │  │  │  ├─ input.tsx
│  │  │  │  ├─ label.tsx
│  │  │  │  ├─ navigation-menu.tsx
│  │  │  │  ├─ placeholder-pattern.tsx
│  │  │  │  ├─ select.tsx
│  │  │  │  ├─ separator.tsx
│  │  │  │  ├─ sheet.tsx
│  │  │  │  ├─ sidebar.tsx
│  │  │  │  ├─ skeleton.tsx
│  │  │  │  ├─ sonner.tsx
│  │  │  │  ├─ spinner.tsx
│  │  │  │  ├─ toggle-group.tsx
│  │  │  │  ├─ toggle.tsx
│  │  │  │  └─ tooltip.tsx
│  │  │  ├─ user-info.tsx
│  │  │  └─ user-menu-content.tsx
│  │  ├─ hooks
│  │  │  ├─ use-appearance.tsx
│  │  │  ├─ use-clipboard.ts
│  │  │  ├─ use-current-url.ts
│  │  │  ├─ use-flash-toast.ts
│  │  │  ├─ use-initials.tsx
│  │  │  ├─ use-mobile-navigation.ts
│  │  │  └─ use-mobile.tsx
│  │  ├─ layouts
│  │  │  ├─ app
│  │  │  │  ├─ app-header-layout.tsx
│  │  │  │  └─ app-sidebar-layout.tsx
│  │  │  ├─ app-layout.tsx
│  │  │  ├─ auth
│  │  │  │  ├─ auth-card-layout.tsx
│  │  │  │  ├─ auth-simple-layout.tsx
│  │  │  │  └─ auth-split-layout.tsx
│  │  │  ├─ auth-layout.tsx
│  │  │  └─ settings
│  │  │     └─ layout.tsx
│  │  ├─ lib
│  │  │  └─ utils.ts
│  │  ├─ pages
│  │  │  ├─ auth
│  │  │  │  ├─ confirm-password.tsx
│  │  │  │  ├─ forgot-password.tsx
│  │  │  │  ├─ login.tsx
│  │  │  │  ├─ register.tsx
│  │  │  │  ├─ reset-password.tsx
│  │  │  │  └─ verify-email.tsx
│  │  │  ├─ dashboard.tsx
│  │  │  ├─ settings
│  │  │  │  ├─ appearance.tsx
│  │  │  │  ├─ profile.tsx
│  │  │  │  └─ security.tsx
│  │  │  ├─ teams
│  │  │  │  ├─ edit.tsx
│  │  │  │  └─ index.tsx
│  │  │  └─ welcome.tsx
│  │  └─ types
│  │     ├─ auth.ts
│  │     ├─ global.d.ts
│  │     ├─ index.ts
│  │     ├─ navigation.ts
│  │     ├─ teams.ts
│  │     ├─ ui.ts
│  │     └─ vite-env.d.ts
│  └─ views
│     └─ app.blade.php
├─ routes
│  ├─ console.php
│  ├─ settings.php
│  └─ web.php
├─ storage
│  ├─ app
│  │  ├─ private
│  │  └─ public
│  ├─ framework
│  │  ├─ cache
│  │  │  └─ data
│  │  ├─ sessions
│  │  ├─ testing
│  │  │  └─ _pest.php
│  │  └─ views
│  │     ├─ 093b6739504649ce308ec3957cbc8f1f.php
│  │     ├─ 0970958b377dca34c970ad1c8f5a1bb3.blade.php
│  │     ├─ 0bd0bc01099e5da9374c7042ce7b9296.php
│  │     ├─ 0dff1502615ac1bed3968097cdc28187.php
│  │     ├─ 124d6cb277d4f958edfc780bef1d113a.php
│  │     ├─ 1413be15a1b20f402b582ef172b57af6.php
│  │     ├─ 153f35438b5b2a7c91374dbd3114fe87.blade.php
│  │     ├─ 1672af5a7ddc1dc391e84534e360d375.php
│  │     ├─ 1d11366a81f64a5752e6bb1638eb9feb.php
│  │     ├─ 291a0dfc282226c7a4cde7bf4d03ed32.php
│  │     ├─ 2a86e36d03d8aa615eaceff8688ea8c5.blade.php
│  │     ├─ 2b3b75ec9892892981b355f1d066492b.blade.php
│  │     ├─ 2d21c7721a51fb6d42304f35ce55c99a.blade.php
│  │     ├─ 2ed238d55ad6483420d2837e3435803a.php
│  │     ├─ 2f4c5b316b4cb31ef0cd8c1e35ddd7b4.blade.php
│  │     ├─ 3b55dc6d57eaa87219dd682dc429ff3e.blade.php
│  │     ├─ 41230c113801cdc07b47032529bcc646.blade.php
│  │     ├─ 41a9d04eec95e41c7431c8e53035c026.php
│  │     ├─ 58f6b5ecbad88fc4da15879dbc7f6e69.blade.php
│  │     ├─ 5e5620683b4bfb1013703013471f36a7.php
│  │     ├─ 611b23d46f6932fe103e94fef0fc5126.php
│  │     ├─ 68103a2cb7348148fb65816b7c8aaa6b.blade.php
│  │     ├─ 6dc6d0aef864bb403facace5ffc97441.blade.php
│  │     ├─ 6f1cfdf4f2693c1552f9151ff2d41db0.php
│  │     ├─ 7a5f080e3343ac7c353479d7352a6a39.php
│  │     ├─ 817729ce434fca950a639aae40c177d8.php
│  │     ├─ 88b9a4f68c7688cc6a0339ed43d1669f.blade.php
│  │     ├─ 8be5f41bb9bd7c0d84eb9b808c5a987e.php
│  │     ├─ a8f2638daac871fd3d2a2c73e4de1313.blade.php
│  │     ├─ b847698a22ba7d5e26272cf20c9ca647.php
│  │     ├─ bbd59ee6d51d54bc802f4634c4b10b38.php
│  │     ├─ be08d6916a4d3cdfb909fe0a7eacc2f5.php
│  │     ├─ c171fffd32ee4668d0f75682681d7fac.blade.php
│  │     ├─ c3cd2e998e8219916a00d57b8f630463.php
│  │     ├─ c72c1f1a218c64585c918e319a80265b.php
│  │     ├─ cf2b5272300017a55d791a9e1c44afb7.blade.php
│  │     ├─ cf7688bb22800317fdbe56a89453b0bb.php
│  │     ├─ d0e4b67e70f38e441531d3cc4f61f4dd.php
│  │     ├─ d8538b296a27d310f6b71584696c8836.blade.php
│  │     ├─ da1290c043c35f6c227d7fe5bea6388f.blade.php
│  │     ├─ dc3f7cbac1cc18e14b9d123e94ac20ae.php
│  │     ├─ dca1a29b69452d307c2c30a7b9cc0a6e.blade.php
│  │     └─ ebc984afafdd26d89a5308188f35ccbf.blade.php
│  ├─ inertia-devtools
│  │  ├─ 01M06S86C7ERMDSYFE41NR0ANG.json
│  │  ├─ 01M06S8PG7713KG0RBG8R7BQSS.json
│  │  ├─ 01M06S965C1G229R1CVJCNM6AG.json
│  │  ├─ 01M06SJ4GV89SG504N5RN2JT17.json
│  │  ├─ 01M06SJ9CFQWF6VJX7QK2D7474.json
│  │  ├─ 01M06SJQ4SZJ3C3A2DRJXBY2R0.json
│  │  ├─ 01M06SJVAAK7MMC7KTWA3SP21X.json
│  │  ├─ 01M06SM2A039YZB1RN6QJ9K1FS.json
│  │  ├─ 01M06SM3FSJ11QGKNGP4A7A323.json
│  │  ├─ _last_prune
│  │  └─ _meta.json
│  └─ logs
│     ├─ browser.log
│     └─ laravel.log
├─ tests
│  ├─ Feature
│  │  ├─ Auth
│  │  │  ├─ AuthenticationTest.php
│  │  │  ├─ EmailVerificationTest.php
│  │  │  ├─ PasswordConfirmationTest.php
│  │  │  ├─ PasswordResetTest.php
│  │  │  ├─ RegistrationTest.php
│  │  │  └─ VerificationNotificationTest.php
│  │  ├─ DashboardTest.php
│  │  ├─ ExampleTest.php
│  │  ├─ Settings
│  │  │  ├─ ProfileUpdateTest.php
│  │  │  └─ SecurityTest.php
│  │  └─ Teams
│  │     ├─ PruneExpiredTeamInvitationsTest.php
│  │     ├─ TeamInvitationTest.php
│  │     ├─ TeamMemberTest.php
│  │     └─ TeamTest.php
│  ├─ Pest.php
│  ├─ TestCase.php
│  └─ Unit
│     └─ ExampleTest.php
├─ tsconfig.json
└─ vite.config.ts

```
```
camara-esp
├─ .claude
│  └─ skills
│     ├─ fortify-development
│     │  └─ SKILL.md
│     ├─ inertia-react-development
│     │  └─ SKILL.md
│     ├─ infer-conventions
│     │  ├─ references
│     │  │  └─ checklist.md
│     │  └─ SKILL.md
│     ├─ laravel-best-practices
│     │  ├─ rules
│     │  │  ├─ advanced-queries.md
│     │  │  ├─ architecture.md
│     │  │  ├─ blade-views.md
│     │  │  ├─ caching.md
│     │  │  ├─ collections.md
│     │  │  ├─ config.md
│     │  │  ├─ db-performance.md
│     │  │  ├─ eloquent.md
│     │  │  ├─ error-handling.md
│     │  │  ├─ events-notifications.md
│     │  │  ├─ http-client.md
│     │  │  ├─ mail.md
│     │  │  ├─ migrations.md
│     │  │  ├─ queue-jobs.md
│     │  │  ├─ routing.md
│     │  │  ├─ scheduling.md
│     │  │  ├─ security.md
│     │  │  ├─ style.md
│     │  │  ├─ testing.md
│     │  │  └─ validation.md
│     │  └─ SKILL.md
│     ├─ pest-testing
│     │  └─ SKILL.md
│     ├─ tailwindcss-development
│     │  └─ SKILL.md
│     └─ wayfinder-development
│        └─ SKILL.md
├─ .editorconfig
├─ .mcp.json
├─ .npmrc
├─ .prettierignore
├─ .prettierrc
├─ app
│  ├─ Actions
│  │  ├─ Fortify
│  │  │  ├─ CreateNewUser.php
│  │  │  └─ ResetUserPassword.php
│  │  └─ Teams
│  │     └─ CreateTeam.php
│  ├─ Concerns
│  │  ├─ GeneratesUniqueTeamSlugs.php
│  │  ├─ HasTeams.php
│  │  ├─ PasswordValidationRules.php
│  │  └─ ProfileValidationRules.php
│  ├─ Console
│  │  └─ Commands
│  ├─ Data
│  │  ├─ TeamPermissions.php
│  │  └─ UserTeam.php
│  ├─ Enums
│  │  ├─ TeamPermission.php
│  │  └─ TeamRole.php
│  ├─ Http
│  │  ├─ Controllers
│  │  │  ├─ Api
│  │  │  │  ├─ ActividadController.php
│  │  │  │  ├─ CamaraController.php
│  │  │  │  ├─ FichaPaisController.php
│  │  │  │  ├─ ServicioController.php
│  │  │  │  └─ SocioController.php
│  │  │  ├─ Controller.php
│  │  │  ├─ DashboardController.php
│  │  │  ├─ Settings
│  │  │  │  ├─ ProfileController.php
│  │  │  │  └─ SecurityController.php
│  │  │  └─ Teams
│  │  │     ├─ TeamController.php
│  │  │     ├─ TeamInvitationController.php
│  │  │     └─ TeamMemberController.php
│  │  ├─ Middleware
│  │  │  ├─ EnsureTeamMembership.php
│  │  │  ├─ HandleAppearance.php
│  │  │  ├─ HandleInertiaRequests.php
│  │  │  └─ SetTeamUrlDefaults.php
│  │  ├─ Requests
│  │  │  ├─ Settings
│  │  │  │  ├─ PasswordUpdateRequest.php
│  │  │  │  ├─ ProfileDeleteRequest.php
│  │  │  │  ├─ ProfileUpdateRequest.php
│  │  │  │  └─ TwoFactorAuthenticationRequest.php
│  │  │  └─ Teams
│  │  │     ├─ CreateTeamInvitationRequest.php
│  │  │     ├─ DeleteTeamRequest.php
│  │  │     ├─ RespondToTeamInvitationRequest.php
│  │  │     ├─ SaveTeamRequest.php
│  │  │     └─ UpdateTeamMemberRequest.php
│  │  └─ Responses
│  │     ├─ Concerns
│  │     │  └─ RedirectsToCurrentTeam.php
│  │     ├─ LoginResponse.php
│  │     ├─ RegisterResponse.php
│  │     ├─ TwoFactorLoginResponse.php
│  │     └─ VerifyEmailResponse.php
│  ├─ Models
│  │  ├─ Actividad.php
│  │  ├─ ActividadArchivo.php
│  │  ├─ ActividadSeccion.php
│  │  ├─ categoria.php
│  │  ├─ CategoriaAfiliado.php
│  │  ├─ CategoriaPatrocinador.php
│  │  ├─ ContactoAfiliado.php
│  │  ├─ ContenidoInstitucional.php
│  │  ├─ Directivo.php
│  │  ├─ EstadoComercial.php
│  │  ├─ EstadoPublicacion.php
│  │  ├─ FichaPais.php
│  │  ├─ Membership.php
│  │  ├─ Patrocinador.php
│  │  ├─ Servicio.php
│  │  ├─ Team.php
│  │  ├─ TeamInvitation.php
│  │  ├─ User.php
│  │  └─ visibilidad.php
│  ├─ Notifications
│  │  └─ Teams
│  │     └─ TeamInvitation.php
│  ├─ Policies
│  │  └─ TeamPolicy.php
│  ├─ Providers
│  │  ├─ AppServiceProvider.php
│  │  └─ FortifyServiceProvider.php
│  └─ Rules
│     ├─ TeamName.php
│     ├─ UniqueTeamInvitation.php
│     └─ ValidTeamInvitation.php
├─ artisan
├─ boost.json
├─ bootstrap
│  ├─ app.php
│  ├─ cache
│  │  ├─ packages.php
│  │  └─ services.php
│  └─ providers.php
├─ CLAUDE.md
├─ components.json
├─ composer.json
├─ composer.lock
├─ config
│  ├─ app.php
│  ├─ auth.php
│  ├─ cache.php
│  ├─ database.php
│  ├─ filesystems.php
│  ├─ fortify.php
│  ├─ inertia.php
│  ├─ logging.php
│  ├─ mail.php
│  ├─ queue.php
│  ├─ services.php
│  └─ session.php
├─ database
│  ├─ database.sqlite
│  ├─ factories
│  │  ├─ TeamFactory.php
│  │  ├─ TeamInvitationFactory.php
│  │  └─ UserFactory.php
│  ├─ migrations
│  │  ├─ 0001_01_01_000000_create_users_table.php
│  │  ├─ 0001_01_01_000001_create_cache_table.php
│  │  ├─ 0001_01_01_000002_create_jobs_table.php
│  │  ├─ 2026_01_27_000001_create_teams_table.php
│  │  ├─ 2026_01_27_000002_add_current_team_id_to_users_table.php
│  │  ├─ 2026_08_27_154956_create_roles_table.php
│  │  ├─ 2026_08_27_154958_create_permisos_table.php
│  │  ├─ 2026_08_27_154959_create_roles_permisos_table.php
│  │  ├─ 2026_08_27_155000_add_camara_columns_to_users_table.php
│  │  ├─ 2026_08_27_155001_create_estados_publicacion_table.php
│  │  ├─ 2026_08_27_155002_create_estados_comercial_table.php
│  │  ├─ 2026_08_27_155003_create_estados_tramite_table.php
│  │  ├─ 2026_08_27_155004_create_estadosuscriptor_table.php
│  │  ├─ 2026_08_27_155005_create_visibilidad_table.php
│  │  ├─ 2026_08_27_155006_create_categorias_table.php
│  │  ├─ 2026_08_27_155007_create_categorias_afiliados_table.php
│  │  ├─ 2026_08_27_155008_create_categoriaspatrocinadores_table.php
│  │  ├─ 2026_08_27_155009_create_listasuscriptores_table.php
│  │  ├─ 2026_08_27_155010_create_tipos_tramite_table.php
│  │  ├─ 2026_08_27_155011_add_camara_columns_to_teams_table.php
│  │  ├─ 2026_08_27_155012_create_patrocinadores_table.php
│  │  ├─ 2026_08_27_155013_create_actividades_table.php
│  │  ├─ 2026_08_27_155014_create_noticias_table.php
│  │  ├─ 2026_08_27_155015_create_boletines_table.php
│  │  ├─ 2026_08_27_155016_create_suscriptores_table.php
│  │  ├─ 2026_08_27_155017_create_tramites_table.php
│  │  ├─ 2026_08_27_155018_create_auditoria_table.php
│  │  ├─ 2026_08_27_155019_create_actividades_patrocinadores_table.php
│  │  ├─ 2026_08_27_155020_create_boletin_noticias_table.php
│  │  ├─ 2026_08_27_155021_create_boletin_actividades_table.php
│  │  ├─ 2026_08_27_155022_create_boletin_envios_table.php
│  │  ├─ 2026_08_27_155023_create_auditoria_trigger.php
│  │  ├─ 2026_08_27_155024_create_camara_views.php
│  │  ├─ 2026_08_27_155025_create_solicitudes_afiliacion_table.php
│  │  ├─ 2026_08_27_155026_create_fichas_pais_table.php
│  │  ├─ 2026_08_27_155027_create_redes_camaras_table.php
│  │  ├─ 2026_08_27_155028_create_oficinas_table.php
│  │  ├─ 2026_08_27_155029_create_mensajes_contacto_table.php
│  │  ├─ 2026_08_27_155030_create_noticia_categoria_table.php
│  │  ├─ 2026_08_27_155031_create_contenido_institucional_table.php
│  │  ├─ 2026_08_27_155032_create_actividad_secciones_table.php
│  │  ├─ 2026_08_27_155033_create_actividad_archivos_table.php
│  │  ├─ 2026_08_27_155034_create_servicios_table.php
│  │  ├─ 2026_08_27_155035_create_actividad_categoria_table.php
│  │  ├─ 2026_08_28_204439_create_directivos_table.php
│  │  └─ 2026_08_30_225802_create_contactos_afiliados_table.php
│  └─ seeders
│     └─ DatabaseSeeder.php
├─ eslint.config.js
├─ package-lock.json
├─ package.json
├─ phpstan.neon
├─ phpunit.xml
├─ pint.json
├─ pnpm-workspace.yaml
├─ public
│  ├─ .htaccess
│  ├─ apple-touch-icon.png
│  ├─ favicon.ico
│  ├─ favicon.svg
│  ├─ index.php
│  └─ robots.txt
├─ README.md
├─ resources
│  ├─ css
│  │  └─ app.css
│  ├─ js
│  │  ├─ app.tsx
│  │  ├─ components
│  │  │  ├─ alert-error.tsx
│  │  │  ├─ app-content.tsx
│  │  │  ├─ app-header.tsx
│  │  │  ├─ app-logo-icon.tsx
│  │  │  ├─ app-logo.tsx
│  │  │  ├─ app-shell.tsx
│  │  │  ├─ app-sidebar-header.tsx
│  │  │  ├─ app-sidebar.tsx
│  │  │  ├─ appearance-tabs.tsx
│  │  │  ├─ breadcrumbs.tsx
│  │  │  ├─ cancel-invitation-modal.tsx
│  │  │  ├─ create-team-modal.tsx
│  │  │  ├─ delete-team-modal.tsx
│  │  │  ├─ delete-user.tsx
│  │  │  ├─ heading.tsx
│  │  │  ├─ input-error.tsx
│  │  │  ├─ invite-member-modal.tsx
│  │  │  ├─ leave-team-modal.tsx
│  │  │  ├─ nav-footer.tsx
│  │  │  ├─ nav-main.tsx
│  │  │  ├─ nav-user.tsx
│  │  │  ├─ password-input.tsx
│  │  │  ├─ pending-invitations-modal.tsx
│  │  │  ├─ remove-member-modal.tsx
│  │  │  ├─ team-invitation-alert.tsx
│  │  │  ├─ team-switcher.tsx
│  │  │  ├─ text-link.tsx
│  │  │  ├─ ui
│  │  │  │  ├─ alert.tsx
│  │  │  │  ├─ avatar.tsx
│  │  │  │  ├─ badge.tsx
│  │  │  │  ├─ breadcrumb.tsx
│  │  │  │  ├─ button.tsx
│  │  │  │  ├─ card.tsx
│  │  │  │  ├─ checkbox.tsx
│  │  │  │  ├─ collapsible.tsx
│  │  │  │  ├─ dialog.tsx
│  │  │  │  ├─ dropdown-menu.tsx
│  │  │  │  ├─ icon.tsx
│  │  │  │  ├─ input.tsx
│  │  │  │  ├─ label.tsx
│  │  │  │  ├─ navigation-menu.tsx
│  │  │  │  ├─ placeholder-pattern.tsx
│  │  │  │  ├─ select.tsx
│  │  │  │  ├─ separator.tsx
│  │  │  │  ├─ sheet.tsx
│  │  │  │  ├─ sidebar.tsx
│  │  │  │  ├─ skeleton.tsx
│  │  │  │  ├─ sonner.tsx
│  │  │  │  ├─ spinner.tsx
│  │  │  │  ├─ toggle-group.tsx
│  │  │  │  ├─ toggle.tsx
│  │  │  │  └─ tooltip.tsx
│  │  │  ├─ user-info.tsx
│  │  │  └─ user-menu-content.tsx
│  │  ├─ hooks
│  │  │  ├─ use-appearance.tsx
│  │  │  ├─ use-clipboard.ts
│  │  │  ├─ use-current-url.ts
│  │  │  ├─ use-flash-toast.ts
│  │  │  ├─ use-initials.tsx
│  │  │  ├─ use-mobile-navigation.ts
│  │  │  └─ use-mobile.tsx
│  │  ├─ layouts
│  │  │  ├─ app
│  │  │  │  ├─ app-header-layout.tsx
│  │  │  │  └─ app-sidebar-layout.tsx
│  │  │  ├─ app-layout.tsx
│  │  │  ├─ auth
│  │  │  │  ├─ auth-card-layout.tsx
│  │  │  │  ├─ auth-simple-layout.tsx
│  │  │  │  └─ auth-split-layout.tsx
│  │  │  ├─ auth-layout.tsx
│  │  │  └─ settings
│  │  │     └─ layout.tsx
│  │  ├─ lib
│  │  │  └─ utils.ts
│  │  ├─ pages
│  │  │  ├─ auth
│  │  │  │  ├─ confirm-password.tsx
│  │  │  │  ├─ forgot-password.tsx
│  │  │  │  ├─ login.tsx
│  │  │  │  ├─ register.tsx
│  │  │  │  ├─ reset-password.tsx
│  │  │  │  └─ verify-email.tsx
│  │  │  ├─ dashboard.tsx
│  │  │  ├─ settings
│  │  │  │  ├─ appearance.tsx
│  │  │  │  ├─ profile.tsx
│  │  │  │  └─ security.tsx
│  │  │  ├─ teams
│  │  │  │  ├─ edit.tsx
│  │  │  │  └─ index.tsx
│  │  │  └─ welcome.tsx
│  │  └─ types
│  │     ├─ auth.ts
│  │     ├─ global.d.ts
│  │     ├─ index.ts
│  │     ├─ navigation.ts
│  │     ├─ teams.ts
│  │     ├─ ui.ts
│  │     └─ vite-env.d.ts
│  └─ views
│     └─ app.blade.php
├─ routes
│  ├─ console.php
│  ├─ settings.php
│  └─ web.php
├─ storage
│  ├─ app
│  │  ├─ private
│  │  └─ public
│  │     └─ prueba.png
│  ├─ framework
│  │  ├─ cache
│  │  │  └─ data
│  │  ├─ sessions
│  │  ├─ testing
│  │  │  └─ _pest.php
│  │  └─ views
│  │     ├─ 035087e73b9b34962f7a8ce790a17d99.php
│  │     ├─ 05fe3f6e914de49f1e45413690d31263.php
│  │     ├─ 1b8ff3eafa966059b7feb26b4d2168a5.php
│  │     ├─ 1ba6a0ebf0998d9fbc839ea959eca1c5.php
│  │     ├─ 24b41b3c75760a5045df0b7b468a74bc.php
│  │     ├─ 26a93c71ea4f36a8a88312d0eb1ac5f7.php
│  │     ├─ 2a74a195f10d320b4037f7b44dfc7f76.php
│  │     ├─ 335a93da76ff383e6c2e9c90eb182ea1.php
│  │     ├─ 33604bb89188a0d0b3065e801b9c2df1.php
│  │     ├─ 378256aa563ba9e33bb35307914f6eac.php
│  │     ├─ 405f86c2300355791089f1b861f15e84.php
│  │     ├─ 407458cf2bb7a3d2da5e10511548b184.php
│  │     ├─ 49582ac84a687a81f1442aafa3d718e4.php
│  │     ├─ 5b6e274bd983ff386ba885d32715ba7f.php
│  │     ├─ 61ec2d186f402e9978f85333bdae5e74.php
│  │     ├─ 630c81dcdcceff903b00b796abb59efc.php
│  │     ├─ 69e884941499b122ee55688d2584a787.php
│  │     ├─ 74ed580a4849d00e066541de1a42da2e.php
│  │     ├─ 75c3f96869da043b592bcf626e552105.php
│  │     ├─ 799ce228e12d6c82bc25d8c280d9e375.php
│  │     ├─ 7bd05c548073fe951b8e2626c06da387.php
│  │     ├─ 8abcd059c22efe634db50dc4ee044612.php
│  │     ├─ 92cadf71763b232ba0b2db3464d9bd63.php
│  │     ├─ 955197d51c6418ceb2396427f7bc2179.php
│  │     ├─ 975fc0d6419f1090618639c94f0d3943.php
│  │     ├─ 9f5afa3ab236cc29575483f567643fdc.php
│  │     ├─ a5298f05c803e5fbf61e5e79180372d6.php
│  │     ├─ a7aacd200b8dc1a6e61fb78f3fc14668.php
│  │     ├─ acd9ffe966e867d9e3ca3406b2e56f2c.php
│  │     ├─ b04283ac4fc277ef2dfe08ce0b35e4e8.php
│  │     ├─ b6f79ebfb7be439864b9ebf0f960acd1.php
│  │     ├─ b9b9831d196328a901c0d8c5ac520a05.php
│  │     ├─ c25c557c3a665527cbdc53be180534db.php
│  │     ├─ c7e4f2b254ab872704777eda5d02d164.php
│  │     ├─ d0e1c679fb24d2df5ea2ffd6d5122916.php
│  │     ├─ d99562e25e4462ffb8f9cff4b32d7ad2.php
│  │     ├─ e0ae7d9656af69ddcb8f1c9bbf8bcada.php
│  │     ├─ e2f1b938263c0a132c48492dd075d9f4.php
│  │     ├─ e6f5447cf6a8507342c976ef906973f3.php
│  │     ├─ ee9f3ed70eb86adb426d421ab420ec6c.php
│  │     ├─ f9be9d3bd82f9a689fb95ea724f351c4.php
│  │     └─ fb8d3e65bf102f526270bffc35e32abe.php
│  ├─ inertia-devtools
│  │  ├─ 01M1HZHQSSBT6E8D6M7PKG7F3G.json
│  │  ├─ 01M1J02W1KR66JA3AV8M2GHDW3.json
│  │  ├─ 01M1J043EN090R92QSS32RF9TS.json
│  │  ├─ 01M1J04N8Z837SFM83XF22P19W.json
│  │  ├─ 01M1J04ZV5A880GDXS7ZFVFQQN.json
│  │  ├─ 01M1J059DSD4NVAMPEHZMZB7RK.json
│  │  ├─ 01M1J05KSH6J47EC8DBDN3MGJA.json
│  │  ├─ _last_prune
│  │  └─ _meta.json
│  └─ logs
│     ├─ browser.log
│     └─ laravel.log
├─ tests
│  ├─ Feature
│  │  ├─ Auth
│  │  │  ├─ AuthenticationTest.php
│  │  │  ├─ EmailVerificationTest.php
│  │  │  ├─ PasswordConfirmationTest.php
│  │  │  ├─ PasswordResetTest.php
│  │  │  ├─ RegistrationTest.php
│  │  │  └─ VerificationNotificationTest.php
│  │  ├─ DashboardTest.php
│  │  ├─ ExampleTest.php
│  │  ├─ Settings
│  │  │  ├─ ProfileUpdateTest.php
│  │  │  └─ SecurityTest.php
│  │  └─ Teams
│  │     ├─ PruneExpiredTeamInvitationsTest.php
│  │     ├─ TeamInvitationTest.php
│  │     ├─ TeamMemberTest.php
│  │     └─ TeamTest.php
│  ├─ Pest.php
│  ├─ TestCase.php
│  └─ Unit
│     └─ ExampleTest.php
├─ tsconfig.json
└─ vite.config.ts

```
```
camara-esp
├─ .claude
│  └─ skills
│     ├─ fortify-development
│     │  └─ SKILL.md
│     ├─ inertia-react-development
│     │  └─ SKILL.md
│     ├─ infer-conventions
│     │  ├─ references
│     │  │  └─ checklist.md
│     │  └─ SKILL.md
│     ├─ laravel-best-practices
│     │  ├─ rules
│     │  │  ├─ advanced-queries.md
│     │  │  ├─ architecture.md
│     │  │  ├─ blade-views.md
│     │  │  ├─ caching.md
│     │  │  ├─ collections.md
│     │  │  ├─ config.md
│     │  │  ├─ db-performance.md
│     │  │  ├─ eloquent.md
│     │  │  ├─ error-handling.md
│     │  │  ├─ events-notifications.md
│     │  │  ├─ http-client.md
│     │  │  ├─ mail.md
│     │  │  ├─ migrations.md
│     │  │  ├─ queue-jobs.md
│     │  │  ├─ routing.md
│     │  │  ├─ scheduling.md
│     │  │  ├─ security.md
│     │  │  ├─ style.md
│     │  │  ├─ testing.md
│     │  │  └─ validation.md
│     │  └─ SKILL.md
│     ├─ pest-testing
│     │  └─ SKILL.md
│     ├─ tailwindcss-development
│     │  └─ SKILL.md
│     └─ wayfinder-development
│        └─ SKILL.md
├─ .editorconfig
├─ .mcp.json
├─ .npmrc
├─ .prettierignore
├─ .prettierrc
├─ app
│  ├─ Actions
│  │  ├─ Fortify
│  │  │  ├─ CreateNewUser.php
│  │  │  └─ ResetUserPassword.php
│  │  └─ Teams
│  │     └─ CreateTeam.php
│  ├─ Concerns
│  │  ├─ GeneratesUniqueTeamSlugs.php
│  │  ├─ HasTeams.php
│  │  ├─ PasswordValidationRules.php
│  │  └─ ProfileValidationRules.php
│  ├─ Console
│  │  └─ Commands
│  ├─ Data
│  │  ├─ TeamPermissions.php
│  │  └─ UserTeam.php
│  ├─ Enums
│  │  ├─ TeamPermission.php
│  │  └─ TeamRole.php
│  ├─ Http
│  │  ├─ Controllers
│  │  │  ├─ Api
│  │  │  │  ├─ ActividadController.php
│  │  │  │  ├─ CamaraController.php
│  │  │  │  ├─ FichaPaisController.php
│  │  │  │  ├─ ServicioController.php
│  │  │  │  └─ SocioController.php
│  │  │  ├─ Controller.php
│  │  │  ├─ DashboardController.php
│  │  │  ├─ Settings
│  │  │  │  ├─ ProfileController.php
│  │  │  │  └─ SecurityController.php
│  │  │  └─ Teams
│  │  │     ├─ TeamController.php
│  │  │     ├─ TeamInvitationController.php
│  │  │     └─ TeamMemberController.php
│  │  ├─ Middleware
│  │  │  ├─ EnsureTeamMembership.php
│  │  │  ├─ HandleAppearance.php
│  │  │  ├─ HandleInertiaRequests.php
│  │  │  └─ SetTeamUrlDefaults.php
│  │  ├─ Requests
│  │  │  ├─ Settings
│  │  │  │  ├─ PasswordUpdateRequest.php
│  │  │  │  ├─ ProfileDeleteRequest.php
│  │  │  │  ├─ ProfileUpdateRequest.php
│  │  │  │  └─ TwoFactorAuthenticationRequest.php
│  │  │  └─ Teams
│  │  │     ├─ CreateTeamInvitationRequest.php
│  │  │     ├─ DeleteTeamRequest.php
│  │  │     ├─ RespondToTeamInvitationRequest.php
│  │  │     ├─ SaveTeamRequest.php
│  │  │     └─ UpdateTeamMemberRequest.php
│  │  └─ Responses
│  │     ├─ Concerns
│  │     │  └─ RedirectsToCurrentTeam.php
│  │     ├─ LoginResponse.php
│  │     ├─ RegisterResponse.php
│  │     ├─ TwoFactorLoginResponse.php
│  │     └─ VerifyEmailResponse.php
│  ├─ Models
│  │  ├─ Actividad.php
│  │  ├─ ActividadArchivo.php
│  │  ├─ ActividadSeccion.php
│  │  ├─ categoria.php
│  │  ├─ CategoriaAfiliado.php
│  │  ├─ CategoriaPatrocinador.php
│  │  ├─ ContactoAfiliado.php
│  │  ├─ ContenidoInstitucional.php
│  │  ├─ Directivo.php
│  │  ├─ EstadoComercial.php
│  │  ├─ EstadoPublicacion.php
│  │  ├─ FichaPais.php
│  │  ├─ Membership.php
│  │  ├─ Patrocinador.php
│  │  ├─ Servicio.php
│  │  ├─ Team.php
│  │  ├─ TeamInvitation.php
│  │  ├─ User.php
│  │  └─ visibilidad.php
│  ├─ Notifications
│  │  └─ Teams
│  │     └─ TeamInvitation.php
│  ├─ Policies
│  │  └─ TeamPolicy.php
│  ├─ Providers
│  │  ├─ AppServiceProvider.php
│  │  └─ FortifyServiceProvider.php
│  └─ Rules
│     ├─ TeamName.php
│     ├─ UniqueTeamInvitation.php
│     └─ ValidTeamInvitation.php
├─ artisan
├─ boost.json
├─ bootstrap
│  ├─ app.php
│  ├─ cache
│  │  ├─ packages.php
│  │  └─ services.php
│  └─ providers.php
├─ CLAUDE.md
├─ components.json
├─ composer.json
├─ composer.lock
├─ config
│  ├─ app.php
│  ├─ auth.php
│  ├─ cache.php
│  ├─ database.php
│  ├─ filesystems.php
│  ├─ fortify.php
│  ├─ inertia.php
│  ├─ logging.php
│  ├─ mail.php
│  ├─ queue.php
│  ├─ services.php
│  └─ session.php
├─ database
│  ├─ database.sqlite
│  ├─ factories
│  │  ├─ TeamFactory.php
│  │  ├─ TeamInvitationFactory.php
│  │  └─ UserFactory.php
│  ├─ migrations
│  │  ├─ 0001_01_01_000000_create_users_table.php
│  │  ├─ 0001_01_01_000001_create_cache_table.php
│  │  ├─ 0001_01_01_000002_create_jobs_table.php
│  │  ├─ 2026_01_27_000001_create_teams_table.php
│  │  ├─ 2026_01_27_000002_add_current_team_id_to_users_table.php
│  │  ├─ 2026_08_27_154956_create_roles_table.php
│  │  ├─ 2026_08_27_154958_create_permisos_table.php
│  │  ├─ 2026_08_27_154959_create_roles_permisos_table.php
│  │  ├─ 2026_08_27_155000_add_camara_columns_to_users_table.php
│  │  ├─ 2026_08_27_155001_create_estados_publicacion_table.php
│  │  ├─ 2026_08_27_155002_create_estados_comercial_table.php
│  │  ├─ 2026_08_27_155003_create_estados_tramite_table.php
│  │  ├─ 2026_08_27_155004_create_estadosuscriptor_table.php
│  │  ├─ 2026_08_27_155005_create_visibilidad_table.php
│  │  ├─ 2026_08_27_155006_create_categorias_table.php
│  │  ├─ 2026_08_27_155007_create_categorias_afiliados_table.php
│  │  ├─ 2026_08_27_155008_create_categoriaspatrocinadores_table.php
│  │  ├─ 2026_08_27_155009_create_listasuscriptores_table.php
│  │  ├─ 2026_08_27_155010_create_tipos_tramite_table.php
│  │  ├─ 2026_08_27_155011_add_camara_columns_to_teams_table.php
│  │  ├─ 2026_08_27_155012_create_patrocinadores_table.php
│  │  ├─ 2026_08_27_155013_create_actividades_table.php
│  │  ├─ 2026_08_27_155014_create_noticias_table.php
│  │  ├─ 2026_08_27_155015_create_boletines_table.php
│  │  ├─ 2026_08_27_155016_create_suscriptores_table.php
│  │  ├─ 2026_08_27_155017_create_tramites_table.php
│  │  ├─ 2026_08_27_155018_create_auditoria_table.php
│  │  ├─ 2026_08_27_155019_create_actividades_patrocinadores_table.php
│  │  ├─ 2026_08_27_155020_create_boletin_noticias_table.php
│  │  ├─ 2026_08_27_155021_create_boletin_actividades_table.php
│  │  ├─ 2026_08_27_155022_create_boletin_envios_table.php
│  │  ├─ 2026_08_27_155023_create_auditoria_trigger.php
│  │  ├─ 2026_08_27_155024_create_camara_views.php
│  │  ├─ 2026_08_27_155025_create_solicitudes_afiliacion_table.php
│  │  ├─ 2026_08_27_155026_create_fichas_pais_table.php
│  │  ├─ 2026_08_27_155027_create_redes_camaras_table.php
│  │  ├─ 2026_08_27_155028_create_oficinas_table.php
│  │  ├─ 2026_08_27_155029_create_mensajes_contacto_table.php
│  │  ├─ 2026_08_27_155030_create_noticia_categoria_table.php
│  │  ├─ 2026_08_27_155031_create_contenido_institucional_table.php
│  │  ├─ 2026_08_27_155032_create_actividad_secciones_table.php
│  │  ├─ 2026_08_27_155033_create_actividad_archivos_table.php
│  │  ├─ 2026_08_27_155034_create_servicios_table.php
│  │  ├─ 2026_08_27_155035_create_actividad_categoria_table.php
│  │  ├─ 2026_08_28_204439_create_directivos_table.php
│  │  └─ 2026_08_30_225802_create_contactos_afiliados_table.php
│  └─ seeders
│     └─ DatabaseSeeder.php
├─ eslint.config.js
├─ package-lock.json
├─ package.json
├─ phpstan.neon
├─ phpunit.xml
├─ pint.json
├─ pnpm-workspace.yaml
├─ public
│  ├─ .htaccess
│  ├─ apple-touch-icon.png
│  ├─ favicon.ico
│  ├─ favicon.svg
│  ├─ index.php
│  └─ robots.txt
├─ README.md
├─ resources
│  ├─ css
│  │  └─ app.css
│  ├─ js
│  │  ├─ app.tsx
│  │  ├─ components
│  │  │  ├─ alert-error.tsx
│  │  │  ├─ app-content.tsx
│  │  │  ├─ app-header.tsx
│  │  │  ├─ app-logo-icon.tsx
│  │  │  ├─ app-logo.tsx
│  │  │  ├─ app-shell.tsx
│  │  │  ├─ app-sidebar-header.tsx
│  │  │  ├─ app-sidebar.tsx
│  │  │  ├─ appearance-tabs.tsx
│  │  │  ├─ breadcrumbs.tsx
│  │  │  ├─ cancel-invitation-modal.tsx
│  │  │  ├─ create-team-modal.tsx
│  │  │  ├─ delete-team-modal.tsx
│  │  │  ├─ delete-user.tsx
│  │  │  ├─ heading.tsx
│  │  │  ├─ input-error.tsx
│  │  │  ├─ invite-member-modal.tsx
│  │  │  ├─ leave-team-modal.tsx
│  │  │  ├─ nav-footer.tsx
│  │  │  ├─ nav-main.tsx
│  │  │  ├─ nav-user.tsx
│  │  │  ├─ password-input.tsx
│  │  │  ├─ pending-invitations-modal.tsx
│  │  │  ├─ public
│  │  │  │  ├─ Footer.tsx
│  │  │  │  └─ Navbar.tsx
│  │  │  ├─ remove-member-modal.tsx
│  │  │  ├─ team-invitation-alert.tsx
│  │  │  ├─ team-switcher.tsx
│  │  │  ├─ text-link.tsx
│  │  │  ├─ ui
│  │  │  │  ├─ alert.tsx
│  │  │  │  ├─ avatar.tsx
│  │  │  │  ├─ badge.tsx
│  │  │  │  ├─ breadcrumb.tsx
│  │  │  │  ├─ button.tsx
│  │  │  │  ├─ card.tsx
│  │  │  │  ├─ checkbox.tsx
│  │  │  │  ├─ collapsible.tsx
│  │  │  │  ├─ dialog.tsx
│  │  │  │  ├─ dropdown-menu.tsx
│  │  │  │  ├─ icon.tsx
│  │  │  │  ├─ input.tsx
│  │  │  │  ├─ label.tsx
│  │  │  │  ├─ navigation-menu.tsx
│  │  │  │  ├─ placeholder-pattern.tsx
│  │  │  │  ├─ select.tsx
│  │  │  │  ├─ separator.tsx
│  │  │  │  ├─ sheet.tsx
│  │  │  │  ├─ sidebar.tsx
│  │  │  │  ├─ skeleton.tsx
│  │  │  │  ├─ sonner.tsx
│  │  │  │  ├─ spinner.tsx
│  │  │  │  ├─ toggle-group.tsx
│  │  │  │  ├─ toggle.tsx
│  │  │  │  └─ tooltip.tsx
│  │  │  ├─ user-info.tsx
│  │  │  └─ user-menu-content.tsx
│  │  ├─ config
│  │  │  └─ navitagion.ts
│  │  ├─ hooks
│  │  │  ├─ use-appearance.tsx
│  │  │  ├─ use-clipboard.ts
│  │  │  ├─ use-current-url.ts
│  │  │  ├─ use-flash-toast.ts
│  │  │  ├─ use-initials.tsx
│  │  │  ├─ use-mobile-navigation.ts
│  │  │  └─ use-mobile.tsx
│  │  ├─ layouts
│  │  │  ├─ app
│  │  │  │  ├─ app-header-layout.tsx
│  │  │  │  └─ app-sidebar-layout.tsx
│  │  │  ├─ app-layout.tsx
│  │  │  ├─ auth
│  │  │  │  ├─ auth-card-layout.tsx
│  │  │  │  ├─ auth-simple-layout.tsx
│  │  │  │  └─ auth-split-layout.tsx
│  │  │  ├─ auth-layout.tsx
│  │  │  ├─ PublicLayout.tsx
│  │  │  └─ settings
│  │  │     └─ layout.tsx
│  │  ├─ lib
│  │  │  └─ utils.ts
│  │  ├─ pages
│  │  │  ├─ auth
│  │  │  │  ├─ confirm-password.tsx
│  │  │  │  ├─ forgot-password.tsx
│  │  │  │  ├─ login.tsx
│  │  │  │  ├─ register.tsx
│  │  │  │  ├─ reset-password.tsx
│  │  │  │  └─ verify-email.tsx
│  │  │  ├─ dashboard.tsx
│  │  │  ├─ public
│  │  │  │  ├─ camara
│  │  │  │  │  └─ index.tsx
│  │  │  │  └─ home
│  │  │  │     └─ index.tsx
│  │  │  ├─ settings
│  │  │  │  ├─ appearance.tsx
│  │  │  │  ├─ profile.tsx
│  │  │  │  └─ security.tsx
│  │  │  ├─ teams
│  │  │  │  ├─ edit.tsx
│  │  │  │  └─ index.tsx
│  │  │  └─ welcome.tsx
│  │  └─ types
│  │     ├─ auth.ts
│  │     ├─ global.d.ts
│  │     ├─ index.ts
│  │     ├─ navigation.ts
│  │     ├─ teams.ts
│  │     ├─ ui.ts
│  │     └─ vite-env.d.ts
│  └─ views
│     └─ app.blade.php
├─ routes
│  ├─ console.php
│  ├─ settings.php
│  └─ web.php
├─ storage
│  ├─ app
│  │  ├─ private
│  │  └─ public
│  │     └─ prueba.png
│  ├─ framework
│  │  ├─ cache
│  │  │  └─ data
│  │  ├─ sessions
│  │  ├─ testing
│  │  │  └─ _pest.php
│  │  └─ views
│  │     ├─ 035087e73b9b34962f7a8ce790a17d99.php
│  │     ├─ 05fe3f6e914de49f1e45413690d31263.php
│  │     ├─ 1871535e90de3f8cd379d8573893d06f.php
│  │     ├─ 1b8ff3eafa966059b7feb26b4d2168a5.php
│  │     ├─ 1ba6a0ebf0998d9fbc839ea959eca1c5.php
│  │     ├─ 24b41b3c75760a5045df0b7b468a74bc.php
│  │     ├─ 26a93c71ea4f36a8a88312d0eb1ac5f7.php
│  │     ├─ 2a74a195f10d320b4037f7b44dfc7f76.php
│  │     ├─ 2c6c3f5d51d39745f480e9b6619773b8.php
│  │     ├─ 335a93da76ff383e6c2e9c90eb182ea1.php
│  │     ├─ 33604bb89188a0d0b3065e801b9c2df1.php
│  │     ├─ 378256aa563ba9e33bb35307914f6eac.php
│  │     ├─ 405f86c2300355791089f1b861f15e84.php
│  │     ├─ 407458cf2bb7a3d2da5e10511548b184.php
│  │     ├─ 49582ac84a687a81f1442aafa3d718e4.php
│  │     ├─ 58f6b5ecbad88fc4da15879dbc7f6e69.blade.php
│  │     ├─ 5b6e274bd983ff386ba885d32715ba7f.php
│  │     ├─ 61a510b245ac78be4608d7ded9290464.php
│  │     ├─ 61ec2d186f402e9978f85333bdae5e74.php
│  │     ├─ 630c81dcdcceff903b00b796abb59efc.php
│  │     ├─ 69e884941499b122ee55688d2584a787.php
│  │     ├─ 73e9fd388e98424ee91590d63340710a.php
│  │     ├─ 74ed580a4849d00e066541de1a42da2e.php
│  │     ├─ 75c3f96869da043b592bcf626e552105.php
│  │     ├─ 799ce228e12d6c82bc25d8c280d9e375.php
│  │     ├─ 7bd05c548073fe951b8e2626c06da387.php
│  │     ├─ 8abcd059c22efe634db50dc4ee044612.php
│  │     ├─ 8b12d200d5661011dcb432f31d2bde7d.php
│  │     ├─ 8c06887e161e7074919dbe3c08cd8bca.php
│  │     ├─ 92cadf71763b232ba0b2db3464d9bd63.php
│  │     ├─ 955197d51c6418ceb2396427f7bc2179.php
│  │     ├─ 975fc0d6419f1090618639c94f0d3943.php
│  │     ├─ 9f5afa3ab236cc29575483f567643fdc.php
│  │     ├─ a45a268835cce2fa5c2c19ae349846e7.php
│  │     ├─ a5298f05c803e5fbf61e5e79180372d6.php
│  │     ├─ a7aacd200b8dc1a6e61fb78f3fc14668.php
│  │     ├─ acd9ffe966e867d9e3ca3406b2e56f2c.php
│  │     ├─ b04283ac4fc277ef2dfe08ce0b35e4e8.php
│  │     ├─ b6f79ebfb7be439864b9ebf0f960acd1.php
│  │     ├─ b9b9831d196328a901c0d8c5ac520a05.php
│  │     ├─ c25c557c3a665527cbdc53be180534db.php
│  │     ├─ c7e4f2b254ab872704777eda5d02d164.php
│  │     ├─ d0e1c679fb24d2df5ea2ffd6d5122916.php
│  │     ├─ d99562e25e4462ffb8f9cff4b32d7ad2.php
│  │     ├─ dca1a29b69452d307c2c30a7b9cc0a6e.blade.php
│  │     ├─ e0ae7d9656af69ddcb8f1c9bbf8bcada.php
│  │     ├─ e2f1b938263c0a132c48492dd075d9f4.php
│  │     ├─ e6f5447cf6a8507342c976ef906973f3.php
│  │     ├─ ee9f3ed70eb86adb426d421ab420ec6c.php
│  │     ├─ f9be9d3bd82f9a689fb95ea724f351c4.php
│  │     └─ fb8d3e65bf102f526270bffc35e32abe.php
│  ├─ inertia-devtools
│  │  ├─ 01M1PEPJXVWKYWJEEXQ4T6D1XZ.json
│  │  ├─ 01M1PEQ68ECHVJ1REXVHMDQTBF.json
│  │  ├─ 01M1PF0W9XVD5EAZW7Y83TQKPT.json
│  │  ├─ 01M1PF11A1979TPKYQ1DS1AKV1.json
│  │  ├─ 01M1PF2QK2NTNKGDNA8XBDKESD.json
│  │  ├─ 01M1PF4GBDGH2MXRCBZ0PAHT85.json
│  │  ├─ 01M1PF4Q6YC9TA2ZVH5YDMAPA0.json
│  │  ├─ 01M1PF4TF1FG9MKA6PAR7AW2S6.json
│  │  ├─ 01M1PF4ZT919PXDXK4PN0X5QRB.json
│  │  ├─ 01M1PF5GTXQ07VHKC6ZWS12Z5H.json
│  │  ├─ 01M1PF67TXZ9JVGGH7CC75J5B0.json
│  │  ├─ 01M1PF7Q4NMQJ70XETQPSC2ZHY.json
│  │  ├─ 01M1PF7V0TAV8W0490XG9MC7HA.json
│  │  ├─ _last_prune
│  │  └─ _meta.json
│  └─ logs
│     ├─ browser.log
│     └─ laravel.log
├─ tests
│  ├─ Feature
│  │  ├─ Auth
│  │  │  ├─ AuthenticationTest.php
│  │  │  ├─ EmailVerificationTest.php
│  │  │  ├─ PasswordConfirmationTest.php
│  │  │  ├─ PasswordResetTest.php
│  │  │  ├─ RegistrationTest.php
│  │  │  └─ VerificationNotificationTest.php
│  │  ├─ DashboardTest.php
│  │  ├─ ExampleTest.php
│  │  ├─ Settings
│  │  │  ├─ ProfileUpdateTest.php
│  │  │  └─ SecurityTest.php
│  │  └─ Teams
│  │     ├─ PruneExpiredTeamInvitationsTest.php
│  │     ├─ TeamInvitationTest.php
│  │     ├─ TeamMemberTest.php
│  │     └─ TeamTest.php
│  ├─ Pest.php
│  ├─ TestCase.php
│  └─ Unit
│     └─ ExampleTest.php
├─ tsconfig.json
└─ vite.config.ts

```
```
camara-esp
├─ .claude
│  └─ skills
│     ├─ fortify-development
│     │  └─ SKILL.md
│     ├─ inertia-react-development
│     │  └─ SKILL.md
│     ├─ infer-conventions
│     │  ├─ references
│     │  │  └─ checklist.md
│     │  └─ SKILL.md
│     ├─ laravel-best-practices
│     │  ├─ rules
│     │  │  ├─ advanced-queries.md
│     │  │  ├─ architecture.md
│     │  │  ├─ blade-views.md
│     │  │  ├─ caching.md
│     │  │  ├─ collections.md
│     │  │  ├─ config.md
│     │  │  ├─ db-performance.md
│     │  │  ├─ eloquent.md
│     │  │  ├─ error-handling.md
│     │  │  ├─ events-notifications.md
│     │  │  ├─ http-client.md
│     │  │  ├─ mail.md
│     │  │  ├─ migrations.md
│     │  │  ├─ queue-jobs.md
│     │  │  ├─ routing.md
│     │  │  ├─ scheduling.md
│     │  │  ├─ security.md
│     │  │  ├─ style.md
│     │  │  ├─ testing.md
│     │  │  └─ validation.md
│     │  └─ SKILL.md
│     ├─ pest-testing
│     │  └─ SKILL.md
│     ├─ tailwindcss-development
│     │  └─ SKILL.md
│     └─ wayfinder-development
│        └─ SKILL.md
├─ .editorconfig
├─ .mcp.json
├─ .npmrc
├─ .prettierignore
├─ .prettierrc
├─ app
│  ├─ Actions
│  │  ├─ Fortify
│  │  │  ├─ CreateNewUser.php
│  │  │  └─ ResetUserPassword.php
│  │  └─ Teams
│  │     └─ CreateTeam.php
│  ├─ Concerns
│  │  ├─ GeneratesUniqueTeamSlugs.php
│  │  ├─ HasTeams.php
│  │  ├─ PasswordValidationRules.php
│  │  └─ ProfileValidationRules.php
│  ├─ Console
│  │  └─ Commands
│  ├─ Data
│  │  ├─ TeamPermissions.php
│  │  └─ UserTeam.php
│  ├─ Enums
│  │  ├─ TeamPermission.php
│  │  └─ TeamRole.php
│  ├─ Http
│  │  ├─ Controllers
│  │  │  ├─ Api
│  │  │  │  ├─ ActividadController.php
│  │  │  │  ├─ CamaraController.php
│  │  │  │  ├─ FichaPaisController.php
│  │  │  │  ├─ ServicioController.php
│  │  │  │  └─ SocioController.php
│  │  │  ├─ Controller.php
│  │  │  ├─ DashboardController.php
│  │  │  ├─ Settings
│  │  │  │  ├─ ProfileController.php
│  │  │  │  └─ SecurityController.php
│  │  │  └─ Teams
│  │  │     ├─ TeamController.php
│  │  │     ├─ TeamInvitationController.php
│  │  │     └─ TeamMemberController.php
│  │  ├─ Middleware
│  │  │  ├─ EnsureTeamMembership.php
│  │  │  ├─ HandleAppearance.php
│  │  │  ├─ HandleInertiaRequests.php
│  │  │  └─ SetTeamUrlDefaults.php
│  │  ├─ Requests
│  │  │  ├─ Settings
│  │  │  │  ├─ PasswordUpdateRequest.php
│  │  │  │  ├─ ProfileDeleteRequest.php
│  │  │  │  ├─ ProfileUpdateRequest.php
│  │  │  │  └─ TwoFactorAuthenticationRequest.php
│  │  │  └─ Teams
│  │  │     ├─ CreateTeamInvitationRequest.php
│  │  │     ├─ DeleteTeamRequest.php
│  │  │     ├─ RespondToTeamInvitationRequest.php
│  │  │     ├─ SaveTeamRequest.php
│  │  │     └─ UpdateTeamMemberRequest.php
│  │  └─ Responses
│  │     ├─ Concerns
│  │     │  └─ RedirectsToCurrentTeam.php
│  │     ├─ LoginResponse.php
│  │     ├─ RegisterResponse.php
│  │     ├─ TwoFactorLoginResponse.php
│  │     └─ VerifyEmailResponse.php
│  ├─ Models
│  │  ├─ Actividad.php
│  │  ├─ ActividadArchivo.php
│  │  ├─ ActividadSeccion.php
│  │  ├─ categoria.php
│  │  ├─ CategoriaAfiliado.php
│  │  ├─ CategoriaPatrocinador.php
│  │  ├─ ContactoAfiliado.php
│  │  ├─ ContenidoInstitucional.php
│  │  ├─ Directivo.php
│  │  ├─ EstadoComercial.php
│  │  ├─ EstadoPublicacion.php
│  │  ├─ FichaPais.php
│  │  ├─ Membership.php
│  │  ├─ Patrocinador.php
│  │  ├─ Servicio.php
│  │  ├─ Team.php
│  │  ├─ TeamInvitation.php
│  │  ├─ User.php
│  │  └─ visibilidad.php
│  ├─ Notifications
│  │  └─ Teams
│  │     └─ TeamInvitation.php
│  ├─ Policies
│  │  └─ TeamPolicy.php
│  ├─ Providers
│  │  ├─ AppServiceProvider.php
│  │  └─ FortifyServiceProvider.php
│  └─ Rules
│     ├─ TeamName.php
│     ├─ UniqueTeamInvitation.php
│     └─ ValidTeamInvitation.php
├─ artisan
├─ boost.json
├─ bootstrap
│  ├─ app.php
│  ├─ cache
│  │  ├─ packages.php
│  │  └─ services.php
│  └─ providers.php
├─ CLAUDE.md
├─ components.json
├─ composer.json
├─ composer.lock
├─ config
│  ├─ app.php
│  ├─ auth.php
│  ├─ cache.php
│  ├─ database.php
│  ├─ filesystems.php
│  ├─ fortify.php
│  ├─ inertia.php
│  ├─ logging.php
│  ├─ mail.php
│  ├─ queue.php
│  ├─ services.php
│  └─ session.php
├─ database
│  ├─ database.sqlite
│  ├─ factories
│  │  ├─ TeamFactory.php
│  │  ├─ TeamInvitationFactory.php
│  │  └─ UserFactory.php
│  ├─ migrations
│  │  ├─ 0001_01_01_000000_create_users_table.php
│  │  ├─ 0001_01_01_000001_create_cache_table.php
│  │  ├─ 0001_01_01_000002_create_jobs_table.php
│  │  ├─ 2026_01_27_000001_create_teams_table.php
│  │  ├─ 2026_01_27_000002_add_current_team_id_to_users_table.php
│  │  ├─ 2026_08_27_154956_create_roles_table.php
│  │  ├─ 2026_08_27_154958_create_permisos_table.php
│  │  ├─ 2026_08_27_154959_create_roles_permisos_table.php
│  │  ├─ 2026_08_27_155000_add_camara_columns_to_users_table.php
│  │  ├─ 2026_08_27_155001_create_estados_publicacion_table.php
│  │  ├─ 2026_08_27_155002_create_estados_comercial_table.php
│  │  ├─ 2026_08_27_155003_create_estados_tramite_table.php
│  │  ├─ 2026_08_27_155004_create_estadosuscriptor_table.php
│  │  ├─ 2026_08_27_155005_create_visibilidad_table.php
│  │  ├─ 2026_08_27_155006_create_categorias_table.php
│  │  ├─ 2026_08_27_155007_create_categorias_afiliados_table.php
│  │  ├─ 2026_08_27_155008_create_categoriaspatrocinadores_table.php
│  │  ├─ 2026_08_27_155009_create_listasuscriptores_table.php
│  │  ├─ 2026_08_27_155010_create_tipos_tramite_table.php
│  │  ├─ 2026_08_27_155011_add_camara_columns_to_teams_table.php
│  │  ├─ 2026_08_27_155012_create_patrocinadores_table.php
│  │  ├─ 2026_08_27_155013_create_actividades_table.php
│  │  ├─ 2026_08_27_155014_create_noticias_table.php
│  │  ├─ 2026_08_27_155015_create_boletines_table.php
│  │  ├─ 2026_08_27_155016_create_suscriptores_table.php
│  │  ├─ 2026_08_27_155017_create_tramites_table.php
│  │  ├─ 2026_08_27_155018_create_auditoria_table.php
│  │  ├─ 2026_08_27_155019_create_actividades_patrocinadores_table.php
│  │  ├─ 2026_08_27_155020_create_boletin_noticias_table.php
│  │  ├─ 2026_08_27_155021_create_boletin_actividades_table.php
│  │  ├─ 2026_08_27_155022_create_boletin_envios_table.php
│  │  ├─ 2026_08_27_155023_create_auditoria_trigger.php
│  │  ├─ 2026_08_27_155024_create_camara_views.php
│  │  ├─ 2026_08_27_155025_create_solicitudes_afiliacion_table.php
│  │  ├─ 2026_08_27_155026_create_fichas_pais_table.php
│  │  ├─ 2026_08_27_155027_create_redes_camaras_table.php
│  │  ├─ 2026_08_27_155028_create_oficinas_table.php
│  │  ├─ 2026_08_27_155029_create_mensajes_contacto_table.php
│  │  ├─ 2026_08_27_155030_create_noticia_categoria_table.php
│  │  ├─ 2026_08_27_155031_create_contenido_institucional_table.php
│  │  ├─ 2026_08_27_155032_create_actividad_secciones_table.php
│  │  ├─ 2026_08_27_155033_create_actividad_archivos_table.php
│  │  ├─ 2026_08_27_155034_create_servicios_table.php
│  │  ├─ 2026_08_27_155035_create_actividad_categoria_table.php
│  │  ├─ 2026_08_28_204439_create_directivos_table.php
│  │  └─ 2026_08_30_225802_create_contactos_afiliados_table.php
│  └─ seeders
│     └─ DatabaseSeeder.php
├─ eslint.config.js
├─ package-lock.json
├─ package.json
├─ phpstan.neon
├─ phpunit.xml
├─ pint.json
├─ pnpm-workspace.yaml
├─ public
│  ├─ .htaccess
│  ├─ apple-touch-icon.png
│  ├─ favicon.ico
│  ├─ favicon.svg
│  ├─ index.php
│  └─ robots.txt
├─ README.md
├─ resources
│  ├─ css
│  │  └─ app.css
│  ├─ js
│  │  ├─ app.tsx
│  │  ├─ components
│  │  │  ├─ alert-error.tsx
│  │  │  ├─ app-content.tsx
│  │  │  ├─ app-header.tsx
│  │  │  ├─ app-logo-icon.tsx
│  │  │  ├─ app-logo.tsx
│  │  │  ├─ app-shell.tsx
│  │  │  ├─ app-sidebar-header.tsx
│  │  │  ├─ app-sidebar.tsx
│  │  │  ├─ appearance-tabs.tsx
│  │  │  ├─ breadcrumbs.tsx
│  │  │  ├─ cancel-invitation-modal.tsx
│  │  │  ├─ create-team-modal.tsx
│  │  │  ├─ delete-team-modal.tsx
│  │  │  ├─ delete-user.tsx
│  │  │  ├─ heading.tsx
│  │  │  ├─ input-error.tsx
│  │  │  ├─ invite-member-modal.tsx
│  │  │  ├─ leave-team-modal.tsx
│  │  │  ├─ nav-footer.tsx
│  │  │  ├─ nav-main.tsx
│  │  │  ├─ nav-user.tsx
│  │  │  ├─ password-input.tsx
│  │  │  ├─ pending-invitations-modal.tsx
│  │  │  ├─ public
│  │  │  │  ├─ Footer.tsx
│  │  │  │  └─ Navbar.tsx
│  │  │  ├─ remove-member-modal.tsx
│  │  │  ├─ team-invitation-alert.tsx
│  │  │  ├─ team-switcher.tsx
│  │  │  ├─ text-link.tsx
│  │  │  ├─ ui
│  │  │  │  ├─ alert.tsx
│  │  │  │  ├─ avatar.tsx
│  │  │  │  ├─ badge.tsx
│  │  │  │  ├─ breadcrumb.tsx
│  │  │  │  ├─ button.tsx
│  │  │  │  ├─ card.tsx
│  │  │  │  ├─ checkbox.tsx
│  │  │  │  ├─ collapsible.tsx
│  │  │  │  ├─ dialog.tsx
│  │  │  │  ├─ dropdown-menu.tsx
│  │  │  │  ├─ icon.tsx
│  │  │  │  ├─ input.tsx
│  │  │  │  ├─ label.tsx
│  │  │  │  ├─ navigation-menu.tsx
│  │  │  │  ├─ placeholder-pattern.tsx
│  │  │  │  ├─ select.tsx
│  │  │  │  ├─ separator.tsx
│  │  │  │  ├─ sheet.tsx
│  │  │  │  ├─ sidebar.tsx
│  │  │  │  ├─ skeleton.tsx
│  │  │  │  ├─ sonner.tsx
│  │  │  │  ├─ spinner.tsx
│  │  │  │  ├─ toggle-group.tsx
│  │  │  │  ├─ toggle.tsx
│  │  │  │  └─ tooltip.tsx
│  │  │  ├─ user-info.tsx
│  │  │  └─ user-menu-content.tsx
│  │  ├─ config
│  │  │  └─ navigation.ts
│  │  ├─ hooks
│  │  │  ├─ use-appearance.tsx
│  │  │  ├─ use-clipboard.ts
│  │  │  ├─ use-current-url.ts
│  │  │  ├─ use-flash-toast.ts
│  │  │  ├─ use-initials.tsx
│  │  │  ├─ use-mobile-navigation.ts
│  │  │  └─ use-mobile.tsx
│  │  ├─ layouts
│  │  │  ├─ app
│  │  │  │  ├─ app-header-layout.tsx
│  │  │  │  └─ app-sidebar-layout.tsx
│  │  │  ├─ app-layout.tsx
│  │  │  ├─ auth
│  │  │  │  ├─ auth-card-layout.tsx
│  │  │  │  ├─ auth-simple-layout.tsx
│  │  │  │  └─ auth-split-layout.tsx
│  │  │  ├─ auth-layout.tsx
│  │  │  ├─ PublicLayout.tsx
│  │  │  └─ settings
│  │  │     └─ layout.tsx
│  │  ├─ lib
│  │  │  └─ utils.ts
│  │  ├─ pages
│  │  │  ├─ auth
│  │  │  │  ├─ confirm-password.tsx
│  │  │  │  ├─ forgot-password.tsx
│  │  │  │  ├─ login.tsx
│  │  │  │  ├─ register.tsx
│  │  │  │  ├─ reset-password.tsx
│  │  │  │  └─ verify-email.tsx
│  │  │  ├─ dashboard.tsx
│  │  │  ├─ Public
│  │  │  │  ├─ Camara
│  │  │  │  │  └─ index.tsx
│  │  │  │  └─ Home.tsx
│  │  │  ├─ settings
│  │  │  │  ├─ appearance.tsx
│  │  │  │  ├─ profile.tsx
│  │  │  │  └─ security.tsx
│  │  │  ├─ teams
│  │  │  │  ├─ edit.tsx
│  │  │  │  └─ index.tsx
│  │  │  └─ welcome.tsx
│  │  └─ types
│  │     ├─ auth.ts
│  │     ├─ global.d.ts
│  │     ├─ index.ts
│  │     ├─ navigation.ts
│  │     ├─ teams.ts
│  │     ├─ ui.ts
│  │     └─ vite-env.d.ts
│  └─ views
│     └─ app.blade.php
├─ routes
│  ├─ console.php
│  ├─ settings.php
│  └─ web.php
├─ storage
│  ├─ app
│  │  ├─ private
│  │  └─ public
│  │     └─ prueba.png
│  ├─ framework
│  │  ├─ cache
│  │  │  └─ data
│  │  ├─ sessions
│  │  ├─ testing
│  │  │  └─ _pest.php
│  │  └─ views
│  │     ├─ 035087e73b9b34962f7a8ce790a17d99.php
│  │     ├─ 05fe3f6e914de49f1e45413690d31263.php
│  │     ├─ 1871535e90de3f8cd379d8573893d06f.php
│  │     ├─ 1b8ff3eafa966059b7feb26b4d2168a5.php
│  │     ├─ 1ba6a0ebf0998d9fbc839ea959eca1c5.php
│  │     ├─ 24b41b3c75760a5045df0b7b468a74bc.php
│  │     ├─ 26a93c71ea4f36a8a88312d0eb1ac5f7.php
│  │     ├─ 2a74a195f10d320b4037f7b44dfc7f76.php
│  │     ├─ 2c6c3f5d51d39745f480e9b6619773b8.php
│  │     ├─ 335a93da76ff383e6c2e9c90eb182ea1.php
│  │     ├─ 33604bb89188a0d0b3065e801b9c2df1.php
│  │     ├─ 378256aa563ba9e33bb35307914f6eac.php
│  │     ├─ 405f86c2300355791089f1b861f15e84.php
│  │     ├─ 407458cf2bb7a3d2da5e10511548b184.php
│  │     ├─ 49582ac84a687a81f1442aafa3d718e4.php
│  │     ├─ 58f6b5ecbad88fc4da15879dbc7f6e69.blade.php
│  │     ├─ 5b6e274bd983ff386ba885d32715ba7f.php
│  │     ├─ 61a510b245ac78be4608d7ded9290464.php
│  │     ├─ 61ec2d186f402e9978f85333bdae5e74.php
│  │     ├─ 630c81dcdcceff903b00b796abb59efc.php
│  │     ├─ 69e884941499b122ee55688d2584a787.php
│  │     ├─ 73e9fd388e98424ee91590d63340710a.php
│  │     ├─ 74ed580a4849d00e066541de1a42da2e.php
│  │     ├─ 75c3f96869da043b592bcf626e552105.php
│  │     ├─ 799ce228e12d6c82bc25d8c280d9e375.php
│  │     ├─ 7bd05c548073fe951b8e2626c06da387.php
│  │     ├─ 8abcd059c22efe634db50dc4ee044612.php
│  │     ├─ 8b12d200d5661011dcb432f31d2bde7d.php
│  │     ├─ 8c06887e161e7074919dbe3c08cd8bca.php
│  │     ├─ 92cadf71763b232ba0b2db3464d9bd63.php
│  │     ├─ 955197d51c6418ceb2396427f7bc2179.php
│  │     ├─ 975fc0d6419f1090618639c94f0d3943.php
│  │     ├─ 9f5afa3ab236cc29575483f567643fdc.php
│  │     ├─ a45a268835cce2fa5c2c19ae349846e7.php
│  │     ├─ a5298f05c803e5fbf61e5e79180372d6.php
│  │     ├─ a584c729fe15cce3951ac1578bef4dab.php
│  │     ├─ a7aacd200b8dc1a6e61fb78f3fc14668.php
│  │     ├─ acd9ffe966e867d9e3ca3406b2e56f2c.php
│  │     ├─ b04283ac4fc277ef2dfe08ce0b35e4e8.php
│  │     ├─ b6f79ebfb7be439864b9ebf0f960acd1.php
│  │     ├─ b9b9831d196328a901c0d8c5ac520a05.php
│  │     ├─ c25c557c3a665527cbdc53be180534db.php
│  │     ├─ c7e4f2b254ab872704777eda5d02d164.php
│  │     ├─ d0e1c679fb24d2df5ea2ffd6d5122916.php
│  │     ├─ d99562e25e4462ffb8f9cff4b32d7ad2.php
│  │     ├─ dca1a29b69452d307c2c30a7b9cc0a6e.blade.php
│  │     ├─ e0ae7d9656af69ddcb8f1c9bbf8bcada.php
│  │     ├─ e2f1b938263c0a132c48492dd075d9f4.php
│  │     ├─ e6f5447cf6a8507342c976ef906973f3.php
│  │     ├─ ee9f3ed70eb86adb426d421ab420ec6c.php
│  │     ├─ f9be9d3bd82f9a689fb95ea724f351c4.php
│  │     └─ fb8d3e65bf102f526270bffc35e32abe.php
│  ├─ inertia-devtools
│  │  ├─ 01M1PEPJXVWKYWJEEXQ4T6D1XZ.json
│  │  ├─ 01M1PEQ68ECHVJ1REXVHMDQTBF.json
│  │  ├─ 01M1PF0W9XVD5EAZW7Y83TQKPT.json
│  │  ├─ 01M1PF11A1979TPKYQ1DS1AKV1.json
│  │  ├─ 01M1PF2QK2NTNKGDNA8XBDKESD.json
│  │  ├─ 01M1PF4GBDGH2MXRCBZ0PAHT85.json
│  │  ├─ 01M1PF4Q6YC9TA2ZVH5YDMAPA0.json
│  │  ├─ 01M1PF4TF1FG9MKA6PAR7AW2S6.json
│  │  ├─ 01M1PF4ZT919PXDXK4PN0X5QRB.json
│  │  ├─ 01M1PF5GTXQ07VHKC6ZWS12Z5H.json
│  │  ├─ 01M1PF67TXZ9JVGGH7CC75J5B0.json
│  │  ├─ 01M1PF7Q4NMQJ70XETQPSC2ZHY.json
│  │  ├─ 01M1PF7V0TAV8W0490XG9MC7HA.json
│  │  ├─ 01M1PF98JV78RQ21PR9ZTVE49Q.json
│  │  ├─ 01M1PFB0B03Y1VNBHR1YF8C8Y1.json
│  │  ├─ 01M1PFCDHHMCQGA95S23ATR954.json
│  │  ├─ 01M1PFFFFKE3JCZBGST2TS197Q.json
│  │  ├─ 01M1PFG9BTWTKQBCVP836Q58BB.json
│  │  ├─ 01M1PFGV7ZPBG82C1DY465XBJ2.json
│  │  ├─ 01M1PFHB59D7ZBHACV0F8PD947.json
│  │  ├─ 01M1PFJYAP05QXJQ8E4NZG7FYE.json
│  │  ├─ 01M1PFKRN5EA8T6524RAZXBRT0.json
│  │  ├─ 01M1PFM4D6KRYPFQ7M4T74CHVY.json
│  │  ├─ 01M1PFM6GKT8VNREPQ0P2XZS37.json
│  │  ├─ 01M1PFMHKTRX3CRQD3VXB4NBAX.json
│  │  ├─ 01M1PFPPS1RG2219SPRRYPHG9V.json
│  │  ├─ 01M1PFQHXJGAZ7WSA2NKCKSYRQ.json
│  │  ├─ 01M1PFQRQMMBYAB9HM4PWTPAV7.json
│  │  ├─ 01M1PFQTVS597F17RN2CM64Z76.json
│  │  ├─ 01M1PFS7H9H4C1050F7AS3A8SD.json
│  │  ├─ 01M1PFSABEYE69XNTX37X4JWJK.json
│  │  ├─ 01M1PFWSXAZTZ5PC8DA8WW2PKP.json
│  │  ├─ 01M1PFWYKMBSKC63ACR827B4FJ.json
│  │  ├─ 01M1PFZHNSGPTR25AWFHJ8ZRB5.json
│  │  ├─ 01M1PG452DPENG1EWXG0PYBX6J.json
│  │  ├─ 01M1PG4G01X1P2BNRQFVCFY3QQ.json
│  │  ├─ 01M1PG4JRFPZ9GJVY2QHZXAYK0.json
│  │  ├─ 01M1PG8PE42JZYYV9F04Q1V5Y0.json
│  │  ├─ 01M1PGA7NZJCVEGACKG52Y8WCJ.json
│  │  ├─ 01M1PGC8HYZ4P73TZTTPHWF5FE.json
│  │  ├─ 01M1PGDT1DJWSD20RGGVJSMAY1.json
│  │  ├─ 01M1PGE7PHJC38NNY3QZFSECEE.json
│  │  ├─ 01M1PGKH5TX6MM087DT1D7RF6R.json
│  │  ├─ 01M1PGKW3ZZNXYB4WBFECXCB3X.json
│  │  ├─ 01M1PGM4G9J0HW7BVVPPBYXBWF.json
│  │  ├─ 01M1PGNP1FWQTF0RPKFY1TSK9K.json
│  │  ├─ 01M1PGW74ZVPJV9TJB4PKZKQHC.json
│  │  ├─ _last_prune
│  │  └─ _meta.json
│  └─ logs
│     ├─ browser.log
│     └─ laravel.log
├─ tests
│  ├─ Feature
│  │  ├─ Auth
│  │  │  ├─ AuthenticationTest.php
│  │  │  ├─ EmailVerificationTest.php
│  │  │  ├─ PasswordConfirmationTest.php
│  │  │  ├─ PasswordResetTest.php
│  │  │  ├─ RegistrationTest.php
│  │  │  └─ VerificationNotificationTest.php
│  │  ├─ DashboardTest.php
│  │  ├─ ExampleTest.php
│  │  ├─ Settings
│  │  │  ├─ ProfileUpdateTest.php
│  │  │  └─ SecurityTest.php
│  │  └─ Teams
│  │     ├─ PruneExpiredTeamInvitationsTest.php
│  │     ├─ TeamInvitationTest.php
│  │     ├─ TeamMemberTest.php
│  │     └─ TeamTest.php
│  ├─ Pest.php
│  ├─ TestCase.php
│  └─ Unit
│     └─ ExampleTest.php
├─ tsconfig.json
└─ vite.config.ts

```