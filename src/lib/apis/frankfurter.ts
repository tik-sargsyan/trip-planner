// Frankfurter: currency rates, no key. https://frankfurter.dev
// v2 is used because v1 (ECB only) has no AMD.
import { getJson } from './http'

export const CURRENCIES = ['USD', 'EUR', 'AMD'] as const
export type Currency = (typeof CURRENCIES)[number]

export interface Rates {
  rates: Record<Currency, number> // units per 1 USD
  date: string | null
  live: boolean
}

// Snapshot from 2026-11-24, used when the API is down.
export const FALLBACK_RATES: Rates = { rates: { USD: 1, EUR: 0.91, AMD: 360 }, date: null, live: false }

interface V2Row { date: string; base: string; quote: string; rate: number }

export async function getRates(): Promise<Rates> {
  try {
    const rows = await getJson<V2Row[]>('https://api.frankfurter.dev/v2/rates?base=USD&quotes=EUR,AMD', { timeoutMs: 5000 })
    const rates = { ...FALLBACK_RATES.rates }
    let date: string | null = null
    let found = 0
    for (const r of rows ?? []) {
      if ((r.quote === 'EUR' || r.quote === 'AMD') && r.rate > 0) { rates[r.quote] = r.rate; date = r.date; found++ }
    }
    return found ? { rates, date, live: true } : FALLBACK_RATES
  } catch {
    return FALLBACK_RATES
  }
}

/** Format a USD amount in the chosen currency, whole units. */
export function formatMoney(usd: number, cur: Currency, rates: Rates) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: cur, maximumFractionDigits: 0, minimumFractionDigits: 0 })
    .format(Math.round(usd * rates.rates[cur]))
}
