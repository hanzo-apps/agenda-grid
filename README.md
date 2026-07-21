# Sched — Conference Agenda

Your whole conference at a glance. A real, buildable Hanzo app you fork on
[hanzo.app](https://hanzo.app) and deploy live on Hanzo Cloud — a multi-track
conference schedule laid out as a color-coded timetable.

- **UI** — [`@hanzo/gui`](https://www.npmjs.com/package/@hanzo/gui) (the Hanzo
  design system) under Vite + React 19. No Tailwind, no second kit.
- **Auth** — [`@hanzo/iam`](https://www.npmjs.com/package/@hanzo/iam), OAuth2
  **PKCE** against [hanzo.id](https://hanzo.id). No local passwords — IAM owns
  every credential interaction.
- **Data** — [`@hanzo/base`](https://www.npmjs.com/package/@hanzo/base), the
  IAM-native, org-scoped data plane. Tracks, sessions and speakers are real Base
  collections provisioned from [`schema.sql`](./schema.sql).

## What it does

- **Agenda grid** — a scrollable time-axis matrix: hours down a time gutter,
  color-coded track columns across, every session a block sized by its duration.
- **Session detail** — tap a session for its abstract, room, time and the
  speakers tied to it.
- **Manage** — organizers add tracks (name + hue), sessions (title, abstract,
  track, time, room) and speakers. Writes are org-scoped rows in Base; the grid
  updates immediately.

## Stack (pinned)

| Package | Version |
| --- | --- |
| `react` / `react-dom` | `^19.2.4` |
| `@hanzo/gui` + `@hanzogui/config` | `7.3.0` |
| `@hanzo/iam` | `^0.13.1` |
| `@hanzo/base` | `^0.2.1` |
| `vite` | `^6` (`@vitejs/plugin-react`) |
| `react-native-web` | `^0.21.0` |
| `typescript` | `5.9.3` |

## Run it

```sh
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc --noEmit && vite build  ->  dist/
npm run preview    # serve the production build (SPA fallback on)
```

Out of the box it runs against **live** Hanzo (hanzo.id + api.hanzo.ai) — no
config needed to see the sign-in flow. Copy `.env.example` to `.env` to point at
a different environment.

## Environment contract

Only `VITE_`-prefixed vars reach the browser (this is a static SPA — there is no
server). Defaults in parentheses.

| Var | Purpose |
| --- | --- |
| `VITE_HANZO_IAM_URL` (`https://hanzo.id`) | OIDC issuer. |
| `VITE_IAM_CLIENT_ID` (`hanzo-app`) | IAM application (`<org>-<app>`). Per-app clients are provisioned at deploy; its redirect-URI list must allow this origin's `/auth/callback`. |
| `VITE_HANZO_REDIRECT_URI` (`${origin}/auth/callback`) | PKCE redirect. |
| `VITE_HANZO_BASE_URL` (`https://api.hanzo.ai`) | Browser-reachable Hanzo Base data plane. Deploy injects the provisioned URL. |

## How auth works — ambient IAM

`login()` starts an OAuth2 **PKCE S256** redirect to hanzo.id; hanzo.id returns
to `/auth/callback`, where `handleCallback()` exchanges the code for tokens
(stored in `localStorage`, refresh-aware via `offline_access`). Every deployed
app is a static site at `<slug>.hanzo.app`; there is **no server token** — the
SPA authenticates the user in the browser and carries the resulting IAM JWT to
Base.

The one deploy requirement: the IAM client (`VITE_IAM_CLIENT_ID`) must list this
origin's `/auth/callback` as an allowed redirect URI. The deploy provisions a
per-app `hanzo-<app>` client; for local dev the shared `hanzo-app` client is the
fallback.

## How data works — Base from `schema.sql`

[`schema.sql`](./schema.sql) is the app's `databaseSchema` (SQL DDL). On publish,
Hanzo Cloud translates each `CREATE TABLE` (`tracks`, `sessions`, `speakers`)
into a Hanzo Base collection (`provisionBaseFromDDL`, additive + idempotent).
Base manages `id`/`created`/`updated`/`owner`/`org`, stamps `owner`+`org` from
the verified IAM principal, and scopes every row to the caller's org
(`@request.auth.org_id = org`). At runtime the views read/write through
`@hanzo/base/react` (`useQuery`/`useMutation`) carrying the IAM token. Keep
`schema.sql` in lockstep with `src/lib/schedule.ts` and the views.

## Deploy — Hanzo Cloud

[`hanzo.yml`](./hanzo.yml) declares a static build (`npm run build` → `dist/`,
served at `<slug>.hanzo.app`) plus the Base schema to provision and the env to
inject. Do **not** build a container image locally — Hanzo Cloud owns builds and
deploys. CI here only proves the template compiles green.

## Layout

```
src/
  main.tsx          entry
  providers.tsx     GuiProvider -> IamProvider -> BaseProvider(client=IAM-token)
  app.tsx           route (/auth/callback) + auth gate
  gui.config.ts     createGui(defaultConfig from @hanzogui/config/v5)
  iam.config.ts     IAM PKCE config
  env.ts            the VITE_ env contract, one place
  lib/base.ts       BaseClient carrying the IAM bearer token
  lib/schedule.ts   types · palette · time math · track-color helper
  auth/callback.tsx PKCE return leg
  views/
    signed-out.tsx  the landing (honest public view, with a preview timetable)
    home.tsx        signed-in shell: Agenda / Manage tabs + session-detail leg
    agenda.tsx      the time × track grid
    detail.tsx      session detail (abstract + speakers)
    manage.tsx      add track / session / speaker (Base writes)
    brand.tsx       the Sched mark
schema.sql          databaseSchema -> Base collections on publish
hanzo.yml           Hanzo Cloud build/deploy manifest
```
