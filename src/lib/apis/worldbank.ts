// World Bank: country price level vs the US, no key.
// The roadmap series PA.NUS.PPPC.RF is archived in the v2 API, so we compute the
// same ratio from two live series: PPP factor (PA.NUS.PPP) / exchange rate (PA.NUS.FCRF).
import { CITIES } from '../../data/catalog'
import { ISO } from './countries'
import { getJson } from './http'

export interface PriceLevel {
  level: number // 1 = US prices
  year: string | null
  live: boolean
}

// Snapshot from 2026-11-24 (World Bank 2024 and 2025 data).
const FALLBACK_LEVEL: Record<string, number> = { ITA: 0.69, FRA: 0.77, ESP: 0.65, GEO: 0.33, JPN: 0.65, ARE: 0.63 }

interface WbRow { countryiso3code: string; date: string; value: number | null }
type WbBody = [unknown, WbRow[] | null]

async function latest(iso3: string, indicator: string) {
  const url = `https://api.worldbank.org/v2/country/${iso3}/indicator/${indicator}?format=json&mrnev=1`
  const body = await getJson<WbBody>(url, { timeoutMs: 6000, retries: 1 })
  const row = body?.[1]?.find((r) => r.value != null)
  if (!row) throw new Error('No data')
  return { value: row.value as number, year: row.date }
}

export async function getPriceLevel(countryId: string): Promise<PriceLevel> {
  const iso3 = ISO[countryId]?.iso3
  const fallback: PriceLevel = { level: FALLBACK_LEVEL[iso3 ?? ''] ?? 1, year: null, live: false }
  if (!iso3) return fallback
  try {
    const [ppp, fx] = await Promise.all([latest(iso3, 'PA.NUS.PPP'), latest(iso3, 'PA.NUS.FCRF')])
    const level = ppp.value / fx.value
    if (!(level > 0.05 && level < 5)) return fallback
    return { level, year: ppp.year, live: true }
  } catch {
    return fallback
  }
}

// US-equivalent Balanced prices the mock catalog implies, in USD.
const REF_STAY = 225 // per room per night
const REF_FOOD = 88 // per person per day

/** Price level the mock catalog implies for a country, on the same scale as World Bank. */
export function mockLevel(countryId: string) {
  const cs = CITIES.filter((c) => c.country === countryId)
  if (!cs.length) return 1
  const stay = cs.reduce((a, c) => a + c.stay[1], 0) / cs.length
  const food = cs.reduce((a, c) => a + c.food[1], 0) / cs.length
  return (stay / REF_STAY + food / REF_FOOD) / 2
}

/** Multiplier for mock stay and food costs: live level over mock level, kept within 0.8 to 1.25. */
export function costFactor(countryId: string, p: PriceLevel) {
  if (!p.live) return 1
  const f = p.level / mockLevel(countryId)
  return Math.round(Math.min(1.25, Math.max(0.8, f)) * 100) / 100
}
