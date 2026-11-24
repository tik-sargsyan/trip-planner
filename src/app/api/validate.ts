import { ACTIVITIES, COUNTRIES, ORIGINS, type Activity, type Tier } from '@/data/catalog'
import type { TripInput } from '@/engine/plan'

const DATE = /^\d{4}-\d{2}-\d{2}$/

/** Checks a client payload so only well-formed trips reach the database. */
export function parseTripBody(b: unknown): { title: string; input: TripInput; tier: Tier } | null {
  if (!b || typeof b !== 'object') return null
  const { title, input, tier } = b as Record<string, unknown>
  if (typeof title !== 'string' || !title.trim() || title.length > 120) return null
  if (tier !== 0 && tier !== 1 && tier !== 2) return null
  if (!input || typeof input !== 'object') return null
  const i = input as Record<string, unknown>
  if (!ORIGINS.some((o) => o.id === i.origin)) return null
  if (!COUNTRIES.some((c) => c.id === i.country)) return null
  if (typeof i.start !== 'string' || !DATE.test(i.start)) return null
  if (typeof i.end !== 'string' || !DATE.test(i.end)) return null
  if (typeof i.budget !== 'number' || i.budget <= 0 || i.budget > 10_000_000) return null
  if (typeof i.people !== 'number' || i.people < 1 || i.people > 50) return null
  if (!Array.isArray(i.activities) || !i.activities.every((a) => (ACTIVITIES as readonly string[]).includes(a))) return null
  return {
    title: title.trim(),
    tier,
    input: {
      origin: i.origin as string, country: i.country as string, start: i.start, end: i.end,
      budget: i.budget, people: i.people, activities: i.activities as Activity[],
    },
  }
}
