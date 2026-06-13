# Breteame

Plataforma web que centraliza el acceso a **profesionales de oficios verificados**
en Costa Rica (fontaneros, electricistas, cerrajeros, jardineros y escombreros).
Los clientes buscan, filtran y contactan directo por WhatsApp o llamada; cada
contacto queda registrado como un lead.

> MVP de hackathon. Sin pasarela de pagos real: el premium y la verificación se
> simulan para el demo.

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind v4 + shadcn/ui
- **Supabase** (PostgreSQL + Auth + RLS)
- Hosting: Vercel

## Puesta en marcha

### 1. Dependencias

```bash
pnpm install
```

### 2. Proyecto Supabase

1. Creá un proyecto en [supabase.com](https://supabase.com).
2. En el **SQL Editor**, corré en orden:
   - `supabase/migrations/0001_init.sql` (tablas, vistas, RLS, triggers)
   - `supabase/seed.sql` (5 profesionales de prueba + ferreterías)
3. (Opcional) Auth → Providers → activá **Google** si querés login con Google.
   El login por **email/contraseña** funciona sin configuración extra.
4. Para que las cuentas demo entren al toque, en Auth → Providers → Email,
   **desactivá "Confirm email"** (solo para el demo).

### 3. Variables de entorno

```bash
cp .env.example .env.local
```

Completá con los valores de **Settings → API** de tu proyecto:

| Variable                        | Dónde está (Settings → API)                              |
| ------------------------------- | -------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | **Project URL**                                          |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **anon / public** (en proyectos nuevos: *Publishable key*) |
| `SUPABASE_SERVICE_ROLE_KEY`     | **service_role** (en proyectos nuevos: *Secret key*)     |

> ⚠️ La `service_role` / *Secret key* es de administrador: va **solo** en
> `.env.local` (ya está en `.gitignore`) y se usa únicamente en
> `scripts/seed-users.mjs`. Nunca la pongas en código del cliente ni la subas.

### 4. Cuentas demo

```bash
node --env-file=.env.local scripts/seed-users.mjs
```

Crea tres usuarios (contraseña `demo1234`) y vincula `pro@demo.cr` con un
profesional del seed:

| Rol         | Correo            |
| ----------- | ----------------- |
| Cliente     | `cliente@demo.cr` |
| Profesional | `pro@demo.cr`     |
| Admin       | `admin@demo.cr`   |

### 5. Levantar la app

```bash
pnpm dev
```

## Golden path del demo (~2 min)

1. **Home** — buscador con filtros por categoría, zona y texto.
2. **Perfil** — sin sesión el contacto está oculto tras un CTA; logueado aparecen
   los botones de **WhatsApp / Llamar / Copiar**, y cada click registra un lead.
3. **Panel del profesional** (`/dashboard`, con `pro@demo.cr`) — leads recibidos,
   cambio de estado y toggle de visibilidad Premium (simulado).
4. **Panel de admin** (`/admin`, con `admin@demo.cr`) — verificar profesionales y
   ver el contador de escaneos de QR de las ferreterías.

## Qué está simulado (para el pitch)

- **Pagos:** el toggle `is_premium` reemplaza a Stripe.
- **Verificación:** el admin marca `is_verified` a criterio; no hay validación
  contra fuentes externas.
- **Adquisición vía ferreterías:** los `qr_scans` son datos de demo para el
  storytelling.

## Seguridad (RLS)

- La lectura de profesionales es pública, pero el **teléfono solo se expone a
  usuarios autenticados** (vistas `professionals_public` /
  `professionals_with_contact` + grants a nivel columna).
- Un profesional solo ve y gestiona **sus** leads; un cliente solo ve los suyos.
- Solo un **admin** puede verificar profesionales (forzado por RLS + trigger,
  así un profesional no puede auto-verificarse).

## Agregar profesionales reales

Al final de `supabase/seed.sql` hay una plantilla `INSERT` comentada. Copiala,
completá los valores y borrá los datos de prueba.

## Deploy a Vercel

1. Importá el repo en [vercel.com](https://vercel.com) (framework: Next.js, se
   detecta solo).
2. En **Settings → Environment Variables** agregá las mismas tres variables del
   `.env.local`.
3. Si usás **Google login**, agregá la URL de Vercel a las *Redirect URLs* de
   Supabase (Auth → URL Configuration) y a las del cliente OAuth de Google:
   `https://TU-APP.vercel.app/auth/callback`.

## Estructura

```
src/
├── app/                # rutas: / · /login · /pro/[id] · /dashboard · /admin · /auth/callback
├── components/         # UI (shadcn en ui/) + componentes de dominio
└── lib/
    ├── supabase/       # clientes browser/server/middleware
    ├── categories.ts   # 5 categorías activas + "Próximamente"
    ├── actions.ts      # server actions (leads, status, toggles)
    └── types.ts
supabase/
├── migrations/0001_init.sql
└── seed.sql
scripts/seed-users.mjs
```
