// React hooks over the phase 2a APIs. Each hook starts with mock data and
// swaps in live data when it arrives. API functions never throw.
import { useEffect, useState } from 'react'
import type { City } from '../../data/catalog'
import { FALLBACK_RATES, getRates, type Rates } from './frankfurter'
import { getHolidays, type Holidays } from './nager'
import { getSights, type Sight } from './wikidata'
import { getCityGuides, type CityGuide } from './wikivoyage'
import { costFactor, getPriceLevel, type PriceLevel } from './worldbank'

export type Status = 'loading' | 'live' | 'fallback'

function useAsync<T>(fn: () => Promise<T>, key: string, initial: T, isLive: (v: T) => boolean) {
  const [state, setState] = useState<{ data: T; status: Status; key: string }>({ data: initial, status: 'loading', key })
  useEffect(() => {
    let off = false
    setState((s) => (s.key === key ? s : { data: initial, status: 'loading', key }))
    fn().then((data) => { if (!off) setState({ data, status: isLive(data) ? 'live' : 'fallback', key }) })
    return () => { off = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return state.key === key ? state : { data: initial, status: 'loading' as Status, key }
}

export function useRates() {
  return useAsync<Rates>(getRates, 'rates', FALLBACK_RATES, (r) => r.live)
}

const NO_LEVEL: PriceLevel = { level: 1, year: null, live: false }
export function usePriceLevel(countryId: string) {
  const s = useAsync(() => getPriceLevel(countryId), 'wb:' + countryId, NO_LEVEL, (p) => p.live)
  return { ...s, factor: s.status === 'live' ? costFactor(countryId, s.data) : 1 }
}

const NO_HOLIDAYS: Holidays = { list: [], live: false, covered: true }
export function useHolidays(countryId: string, start: string, end: string) {
  return useAsync(() => getHolidays(countryId, start, end), `nager:${countryId}:${start}:${end}`, NO_HOLIDAYS, (h) => h.live)
}

export function useCityGuides(names: string[]) {
  const key = [...new Set(names)].sort().join('|')
  return useAsync<Record<string, CityGuide>>(() => getCityGuides(names), 'wv:' + key, {}, (g) => Object.keys(g).length > 0)
}

export function useCitySights(cities: City[]) {
  const key = cities.map((c) => c.id).sort().join('|')
  return useAsync<Record<string, Sight[]>>(async () => {
    const out: Record<string, Sight[]> = {}
    for (const c of cities) {
      out[c.id] = await getSights(c.lat, c.lon, { km: c.island ? 10 : 4, skip: c.sites.map((s) => s.name) })
    }
    return out
  }, 'wd:' + key, {}, (r) => Object.values(r).some((l) => l.length > 0))
}
