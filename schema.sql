-- Hanzo Base schema for Sched — the `databaseSchema` DDL.
--
-- On publish, Hanzo Cloud translates each CREATE TABLE into a Hanzo Base
-- collection via `provisionBaseFromDDL` (additive + idempotent). Base manages
-- id/created/updated/owner/org itself, so they are never re-declared here.
-- Every row is stamped with the verified IAM owner+org and is org-scoped: Base
-- applies the list/view/create/update/delete rule `@request.auth.org_id = org`,
-- so a member of your org reads/writes the row and other orgs cannot see it.
--
-- Keep this in lockstep with what the app reads/writes
-- (src/lib/schedule.ts + src/views/agenda.tsx · detail.tsx · manage.tsx).

-- Conference tracks — one column in the agenda grid, each its own hue.
CREATE TABLE IF NOT EXISTS tracks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name  TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1'
);

-- Sessions — placed on the grid by start/end time within their track column.
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title     TEXT NOT NULL,
  abstract  TEXT NOT NULL DEFAULT '',
  track     TEXT NOT NULL DEFAULT '',
  starts_at TEXT NOT NULL,          -- "HH:MM" (24h)
  ends_at   TEXT NOT NULL,          -- "HH:MM" (24h)
  room      TEXT NOT NULL DEFAULT ''
);

-- Speakers — tied to a session by id; shown on the session detail view.
CREATE TABLE IF NOT EXISTS speakers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  bio        TEXT NOT NULL DEFAULT '',
  session_id TEXT NOT NULL DEFAULT ''
);
