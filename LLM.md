# Sched (agenda-grid) — agent notes

A multi-track conference agenda, forked from the canonical Hanzo starter.
Vite + React 19 + `@hanzo/gui` (UI) + `@hanzo/iam` (auth) + `@hanzo/base` (data).
Keep it REAL — every surface must build and run, no fabricated UI.

## The app

- **Agenda grid** (`src/views/agenda.tsx`) — a time-axis matrix: hours down a
  time gutter, color-coded track columns across, each session an absolutely
  positioned block sized by its duration. Horizontal scroll for many tracks.
- **Session detail** (`src/views/detail.tsx`) — abstract, room/time, and the
  speakers whose `session_id` points at it.
- **Manage** (`src/views/manage.tsx`) — the only writer: create `tracks`,
  `sessions`, `speakers` via `useMutation`, then `refetchAll()`.
- **Landing** (`src/views/signed-out.tsx`) — the honest public view; an
  illustrative preview timetable (same block styling as the real grid, not live
  data) plus the PKCE sign-in. This is the catalog thumbnail.
- `src/lib/schedule.ts` — types, the track hue `PALETTE`, `toMin`/`fmtMin` time
  math, `colorForTrack`, `trackColumns`, `dayBounds`. One place for grid logic.

## One way, decomplected

- **Providers** (`src/providers.tsx`) mount in the canonical order every Hanzo
  surface ships: `GuiProvider` → `IamProvider` → `BaseProvider`. `BaseProvider`
  gets a `BaseClient` carrying the IAM access token; rebuilt when the token
  changes (`src/lib/base.ts` `baseAs`). That single seam scopes every
  `useQuery`/`useMutation` to the signed-in user's org.
- **Env is one place** (`src/env.ts`), read from `import.meta.env.VITE_*`. The
  IAM client id is `VITE_IAM_CLIENT_ID` (fallback `hanzo-app`).
- **UI is one system** — `@hanzo/gui` primitives only (no second kit, no
  Tailwind).

## Gotchas (do not regress)

- **`@hanzo/gui` under Vite** needs three things in `vite.config.ts` (it is the
  Tamagui line; the in-browser builder runtime can't do this, which is the whole
  reason this ships as a real repo): (1) alias `react-native` →
  `react-native-web`, (2) `define` `process.env.TAMAGUI_TARGET` / `NODE_ENV` /
  `__DEV__`, (3) `dedupe` react/react-dom/react-native-web. No Tamagui compiler,
  no `one`, no Expo.
- **`@hanzo/gui` props are Tamagui LONGHAND** with this v5 config:
  `alignItems`/`justifyContent`/`backgroundColor`/`padding`/`paddingHorizontal`/
  `alignSelf`/`borderRadius`/`borderLeftWidth`/`textAlign` — NOT the
  `items`/`justify`/`bg`/`p`/`px`/`self`/`rounded`/`text` shorthands. Shorthands
  pass at runtime but FAIL `tsc`. `Button`/pressables use `onPress`;
  `Input`/`TextArea` use `value`/`onChangeText`. Per-track hues are raw hex
  strings (`#6366f1`, hex8 tints like `#6366f126`) — Tamagui accepts them.
- **PKCE storage is `localStorage`** (not sessionStorage) so the verifier/state
  survive the round-trip to hanzo.id.
- **`schema.sql` is the data contract.** It is the `databaseSchema` DDL the
  deploy translates into Base collections (`provisionBaseFromDDL`). Keep it in
  lockstep with `src/lib/schedule.ts` + the views.

## Deploy contract (Hanzo Cloud)

- Static SPA: `npm run build` → `dist/`, served at `<slug>.hanzo.app` from
  object storage. No server process.
- On publish, `schema.sql` → `provisionBaseFromDDL` creates the collections
  (org-scoped, IAM-native). Runtime read/write is browser → `VITE_HANZO_BASE_URL`
  with the IAM token.
- **IAM redirect registration** is the one external requirement: the IAM client
  (`VITE_IAM_CLIENT_ID`, default `hanzo-app`) must allow this origin's
  `/auth/callback`. The deploy provisions a per-app `hanzo-<app>` client.

## Proven

`npm run typecheck` (tsc --noEmit) clean · `npm run build` (tsc + vite) →
`dist/` · the landing renders under headless Chrome at 1280×800 with **zero
console errors**, showing the branded hero + color-coded preview timetable.
`login()` performs a real PKCE S256 redirect to hanzo.id.

## Build

CI (`.github/workflows/ci.yml`) runs `npm ci && npm run typecheck && npm run
build` — build-verification only, NEVER a container image (Hanzo Cloud owns
deploys; do not build images locally).

## Working here

Merged from AGENTS.md, which held only this. One rule, one place.

# Agent guide

Canonical instructions for this repo live in [`LLM.md`](./LLM.md) (and its
`CLAUDE.md` symlink). Read it before changing anything.

TL;DR: Sched — a multi-track conference agenda. Vite + React 19 + `@hanzo/gui` +
`@hanzo/iam` + `@hanzo/base`. Three views (agenda grid · session detail ·
manage) over three org-scoped Base collections (`tracks`, `sessions`,
`speakers`) in `schema.sql`. `@hanzo/gui` needs the react-native-web alias +
Tamagui defines in `vite.config.ts` and uses Tamagui LONGHAND props (tsc
enforces this). Prove changes with `npm run build` (tsc + vite). Never build a
container image locally — Hanzo Cloud owns deploys.
