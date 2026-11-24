// Nager.Date: public holidays, no key. https://date.nager.at
// Some countries (for example the UAE) are not covered. Then the list is empty.
import { ISO } from './countries'
import { getJson } from './http'

export interface Holiday { date: string; name: string; localName: string }
export interface Holidays { list: Holiday[]; live: boolean; covered: boolean }

interface NagerRow { date: string; name: string; localName: string; global: boolean; counties: string[] | null }

export async function getHolidays(countryId: string, start: string, end: string): Promise<Holidays> {
  const iso2 = ISO[countryId]?.iso2
  if (!iso2) return { list: [], live: false, covered: false }
  const y0 = Number(start.slice(0, 4))
  const y1 = Number(end.slice(0, 4))
  const years = Array.from({ length: Math.max(1, y1 - y0 + 1) }, (_, i) => y0 + i).slice(0, 2)
  try {
    const bodies = await Promise.all(years.map((y) =>
      getJson<NagerRow[]>(`https://date.nager.at/api/v3/PublicHolidays/${y}/${iso2}`, { timeoutMs: 5000 })))
    if (bodies.every((b) => b == null)) return { list: [], live: true, covered: false }
    const seen = new Set<string>()
    const list = bodies.flatMap((b) => b ?? [])
      .filter((h) => h.date >= start && h.date <= end && h.global !== false)
      .filter((h) => { const k = h.date + h.name; if (seen.has(k)) return false; seen.add(k); return true })
      .map(({ date, name, localName }) => ({ date, name, localName }))
    return { list, live: true, covered: true }
  } catch {
    return { list: [], live: false, covered: true }
  }
}
