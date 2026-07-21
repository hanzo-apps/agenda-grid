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
