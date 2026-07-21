import type { BaseRecord } from '@hanzo/base/react'

/**
 * The three org-scoped Base collections behind Sched (see schema.sql). Base adds
 * id/created/updated/owner/org; these are the domain columns the app reads/writes.
 */
export interface Track extends BaseRecord {
  name: string
  color: string
}
export interface Session extends BaseRecord {
  title: string
  abstract: string
  track: string
  starts_at: string
  ends_at: string
  room: string
}
export interface Speaker extends BaseRecord {
  name: string
  bio: string
  session_id: string
}

/** Curated track hues — used when a track has no explicit color of its own. */
export const PALETTE: readonly string[] = [
  '#6366f1', // indigo
  '#10b981', // emerald
  '#f59e0b', // amber
  '#f43f5e', // rose
  '#0ea5e9', // sky
  '#8b5cf6', // violet
  '#14b8a6', // teal
  '#ec4899', // pink
]

/** Layout scale for the timetable grid (session blocks are sized by duration). */
export const PX_PER_MIN = 1.5
export const GUTTER_W = 66
export const COL_W = 216
export const GRID_BODY_H = 560
export const DAY_START_FALLBACK = 8 * 60 // 08:00
export const DAY_END_FALLBACK = 18 * 60 // 18:00

/** Parse "HH:MM" → minutes from midnight, or null when unparseable. */
export function toMin(hhmm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec((hhmm ?? '').trim())
  if (!m) return null
  const h = Number(m[1])
  const min = Number(m[2])
  if (h > 23 || min > 59) return null
  return h * 60 + min
}

/** minutes → "9:05" (leading zero dropped on the hour). */
export function fmtMin(total: number): string {
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${h}:${String(m).padStart(2, '0')}`
}

/** "09:00" → "9:00" for display; passes through anything unparseable. */
export function fmtTime(hhmm: string): string {
  const v = toMin(hhmm)
  return v == null ? hhmm : fmtMin(v)
}

/** "9:00–10:30 · Hall A" style label for a session row. */
export function timeLabel(s: Session): string {
  const range = `${fmtTime(s.starts_at)}–${fmtTime(s.ends_at)}`
  return s.room ? `${range} · ${s.room}` : range
}

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

/** The hue for a track name: its record's color, else a stable palette pick. */
export function colorForTrack(name: string, tracks: Track[]): string {
  const key = (name ?? '').trim().toLowerCase()
  const found = tracks.find((t) => t.name.trim().toLowerCase() === key)
  if (found?.color) return found.color
  return PALETTE[hash(key || 'track') % PALETTE.length]
}

/** A translucent tint of a 6-digit hex color (hex8) for block/chip fills. */
export function tint(hex: string, alpha = '26'): string {
  return /^#[0-9a-fA-F]{6}$/.test(hex) ? `${hex}${alpha}` : hex
}

/** The ordered list of track columns: every track record, then any track name a
 *  session references that has no record yet (so nothing falls off the grid). */
export function trackColumns(tracks: Track[], sessions: Session[]): string[] {
  const seen = new Set<string>()
  const cols: string[] = []
  const add = (name: string) => {
    const key = name.trim().toLowerCase()
    if (!name.trim() || seen.has(key)) return
    seen.add(key)
    cols.push(name.trim())
  }
  tracks.forEach((t) => add(t.name))
  sessions.forEach((s) => add(s.track))
  return cols
}

/** The [start, end] minute window the grid spans, snapped to whole hours. */
export function dayBounds(sessions: Session[]): { start: number; end: number } {
  let lo = Infinity
  let hi = -Infinity
  for (const s of sessions) {
    const a = toMin(s.starts_at)
    const b = toMin(s.ends_at)
    if (a != null) lo = Math.min(lo, a)
    if (b != null) hi = Math.max(hi, b)
    if (a != null && b == null) hi = Math.max(hi, a + 60)
  }
  if (!isFinite(lo) || !isFinite(hi) || hi <= lo) {
    return { start: DAY_START_FALLBACK, end: DAY_END_FALLBACK }
  }
  return { start: Math.floor(lo / 60) * 60, end: Math.ceil(hi / 60) * 60 }
}
