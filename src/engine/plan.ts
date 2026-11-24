import {
  CITIES, TIER_NAMES, cityById, countryById, originById,
  type Activity, type City, type Site, type Tier,
} from '../data/catalog'
import { flight, ground, hash, km, transfer, type Leg } from '../data/transport'

export interface TripInput {
  origin: string
  country: string
  start: string // YYYY-MM-DD
  end: string
  budget: number // USD, whole group
  people: number
  activities: Activity[]
}

export interface DayItem { kind: 'leg'; leg: Leg; cost: number }
export interface DaySite { kind: 'site'; site: Site; cost: number; match: boolean }
export interface Day {
  n: number
  date: string
  city: string
  title: string
  items: (DayItem | DaySite)[]
  freeHours: number
}

export interface CityStop { city: City; nights: number; score: number; reasons: string[] }

export interface TierPlan {
  tier: Tier
  name: string
  stops: CityStop[]
  legs: { leg: Leg; cost: number }[]
  days: Day[]
  cost: { transport: number; stay: number; food: number; activities: number; total: number }
  perPerson: number
  fits: boolean
  delta: number // budget minus total
}

export interface PlanResult {
  input: TripInput
  nights: number
  month: number
  tiers: TierPlan[]
  recommended: Tier
}

const DAY_HOURS = 7

function legCost(leg: Leg, people: number, tier: Tier) {
  if (leg.mode === 'car') return leg.pricePerPerson * Math.ceil(people / 3)
  if (leg.mode === 'transfer' && tier > 0) return leg.pricePerPerson * Math.ceil(people / 4)
  return leg.pricePerPerson * people
}

export function scoreCity(c: City, acts: Activity[], month: number) {
  const reasons: string[] = []
  const tagHits = new Map<Activity, number>()
  for (const site of c.sites) for (const t of site.tags) if (acts.includes(t)) tagHits.set(t, (tagHits.get(t) ?? 0) + 1)
  const match = [...tagHits.values()].reduce((a, b) => a + Math.min(b, 3), 0)
  if (tagHits.size) reasons.push(`Good for ${[...tagHits.keys()].join(', ')}`)
  const inSeason = c.bestMonths.includes(month)
  if (inSeason) reasons.push('In season')
  else reasons.push('Off season: fewer crowds, mixed weather')
  const score = match * 2 + (inSeason ? 3 : 0) + (acts.length ? 0 : c.sites.length * 0.5)
  return { score, reasons }
}

export interface PlanOptions {
  /** Multiplier for stay and food costs, from the live country price level. 1 = mock prices. */
  costFactor?: number
}

export function buildPlan(input: TripInput, opts: PlanOptions = {}): PlanResult {
  const costFactor = opts.costFactor && opts.costFactor > 0 ? opts.costFactor : 1
  const origin = originById(input.origin)
  const country = countryById(input.country)
  const start = new Date(input.start + 'T00:00:00')
  const end = new Date(input.end + 'T00:00:00')
  const nights = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000))
  const month = start.getMonth() + 1
  const people = Math.max(1, input.people)
  const seed = JSON.stringify(input)

  // 1. Score and pick cities.
  const pool = CITIES.filter((c) => c.country === country.id)
    .map((c) => ({ city: c, ...scoreCity(c, input.activities, month) }))
    .sort((a, b) => b.score - a.score || a.city.stay[0] - b.city.stay[0])
  const nCities = Math.min(pool.length, 4, Math.max(1, Math.round(nights / 3)))
  const picked = pool.slice(0, nCities)

  // 2. Entry city: picked city with an airport and the cheapest flight; else the country hub.
  const sameCountry = origin.country === country.id
  const withAirport = picked.filter((p) => p.city.airport)
  const entry = withAirport.length
    ? withAirport.sort((a, b) => km(origin, a.city) - km(origin, b.city))[0].city
    : cityById(country.hub)

  // 3. Order by nearest neighbour from the entry city.
  const ordered: typeof picked = []
  const left = [...picked]
  let cur: City = entry
  const first = left.findIndex((p) => p.city.id === entry.id)
  if (first >= 0) { ordered.push(left[first]); left.splice(first, 1) }
  while (left.length) {
    left.sort((a, b) => km(cur, a.city) - km(cur, b.city))
    const nxt = left.shift()!
    ordered.push(nxt)
    cur = nxt.city
  }

  // 4. Split nights, extra nights to higher scores.
  const base = Math.floor(nights / ordered.length)
  let extra = nights - base * ordered.length
  const byScore = [...ordered].sort((a, b) => b.score - a.score)
  const nightsFor = new Map(ordered.map((o) => [o.city.id, base]))
  for (const o of byScore) { if (extra-- <= 0) break; nightsFor.set(o.city.id, nightsFor.get(o.city.id)! + 1) }

  const stops: CityStop[] = ordered.map((o) => ({ city: o.city, nights: nightsFor.get(o.city.id)!, score: o.score, reasons: o.reasons }))

  // Exit city for the flight home: the last stop if it has an airport, else nearest airport city we visited, else hub.
  const last = stops[stops.length - 1].city
  const exit = last.airport ? last : (stops.map((s) => s.city).filter((c) => c.airport).sort((a, b) => km(last, a) - km(last, b))[0] ?? cityById(country.hub))

  const tiers = ([0, 1, 2] as Tier[]).map((tier) =>
    buildTier({ tier, stops, origin, country, entry, exit, start, nights, month, people, input, seed, sameCountry, costFactor }))

  const fitting = tiers.filter((t) => t.fits)
  const recommended: Tier = fitting.length ? fitting[fitting.length - 1].tier : 0
  return { input, nights, month, tiers, recommended }
}

function buildTier(ctx: {
  tier: Tier; stops: CityStop[]; origin: ReturnType<typeof originById>; country: ReturnType<typeof countryById>
  entry: City; exit: City; start: Date; nights: number; month: number; people: number; input: TripInput; seed: string; sameCountry: boolean; costFactor: number
}): TierPlan {
  const { tier, stops, origin, country, entry, exit, start, month, people, input, seed } = ctx
  const legs: { leg: Leg; cost: number }[] = []
  const add = (leg: Leg) => { const c = legCost(leg, people, tier); legs.push({ leg, cost: c }); return { kind: 'leg' as const, leg, cost: c } }

  const days: Day[] = []
  const dateOf = (i: number) => { const d = new Date(start); d.setDate(d.getDate() + i); return d.toISOString().slice(0, 10) }
  const actMult = [1, 1.15, 1.6][tier]
  const used = new Set<string>()
  let dayIdx = 0

  const fillSites = (city: City, hours: number): { items: DaySite[]; free: number } => {
    const items: DaySite[] = []
    let left = hours
    const ranked = city.sites
      .filter((s) => !used.has(city.id + s.name))
      .map((s) => ({ s, m: s.tags.filter((t) => input.activities.includes(t)).length }))
      .sort((a, b) => b.m - a.m || a.s.hours - b.s.hours)
    for (const { s, m } of ranked) {
      if (s.hours > left) continue
      if (m === 0 && input.activities.length && ranked.some((r) => r.m > 0 && !used.has(city.id + r.s.name) && r.s.hours <= left)) continue
      used.add(city.id + s.name)
      items.push({ kind: 'site', site: s, cost: Math.round(s.cost * people * actMult), match: m > 0 })
      left -= s.hours
    }
    return { items, free: Math.max(0, Math.round(left * 10) / 10) }
  }

  stops.forEach((stop, i) => {
    for (let k = 0; k < stop.nights; k++) {
      const items: Day['items'] = []
      let hours = DAY_HOURS
      let title = `Explore ${stop.city.name}`
      if (k === 0 && i === 0) {
        title = `Arrive in ${stop.city.name}`
        if (ctx.sameCountry) {
          const home = { ...entry, id: origin.id, name: origin.name, lat: origin.lat, lon: origin.lon, airport: origin.airport, island: false } as City
          if (km(home, stop.city) > 40) items.push(add(ground(home, stop.city, country, tier, seed)))
        } else {
          const f = flight(origin, { ...entry, airport: entry.airport! }, month, tier, seed)
          items.push(add(f))
          items.push(add(transfer(entry.name, entry.airport!, false, tier)))
          if (entry.id !== stop.city.id) items.push(add(ground(entry, stop.city, country, tier, seed)))
        }
        hours = 3
      } else if (k === 0) {
        const prev = stops[i - 1].city
        title = `${prev.name} → ${stop.city.name}`
        const g = add(ground(prev, stop.city, country, tier, seed))
        items.push(g)
        hours = Math.max(1, DAY_HOURS - g.leg.hours - 1)
      }
      const { items: siteItems, free } = fillSites(stop.city, hours)
      items.push(...siteItems)
      days.push({ n: dayIdx + 1, date: dateOf(dayIdx), city: stop.city.name, title, items, freeHours: free })
      dayIdx++
    }
  })

  // Departure day.
  const lastCity = stops[stops.length - 1].city
  const depItems: Day['items'] = []
  if (ctx.sameCountry) {
    const home = { ...lastCity, id: origin.id, name: origin.name, lat: origin.lat, lon: origin.lon, airport: origin.airport, island: false } as City
    if (km(lastCity, home) > 40) depItems.push(add(ground(lastCity, home, country, tier, seed + 'home')))
  } else {
    if (exit.id !== lastCity.id) depItems.push(add(ground(lastCity, exit, country, tier, seed + 'exit')))
    depItems.push(add(transfer(exit.name, exit.airport!, true, tier)))
    const f = flight({ ...exit, airport: exit.airport! }, origin, month, tier, seed + 'return')
    f.depart = f.depart < '12:00' ? '14:30' : f.depart
    depItems.push(add(f))
  }
  const morning = fillSites(lastCity, 2)
  days.push({ n: dayIdx + 1, date: dateOf(dayIdx), city: lastCity.name, title: `Fly home to ${origin.name}`, items: [...morning.items, ...depItems], freeHours: 0 })

  const rooms = Math.ceil(people / 2)
  const transport = legs.reduce((a, l) => a + l.cost, 0)
  const k = ctx.costFactor
  const stay = Math.round(stops.reduce((a, st) => a + st.city.stay[tier] * st.nights * rooms, 0) * k)
  const food = Math.round(stops.reduce((a, st) => a + st.city.food[tier] * st.nights * people, 0) * k)
  const activities = days.flatMap((d) => d.items).reduce((a, it) => a + (it.kind === 'site' ? it.cost : 0), 0)
  const total = transport + stay + food + activities
  return {
    tier, name: TIER_NAMES[tier], stops, legs, days,
    cost: { transport, stay, food, activities, total },
    perPerson: Math.round(total / people),
    fits: total <= input.budget,
    delta: input.budget - total,
  }
}

export const _hash = hash
