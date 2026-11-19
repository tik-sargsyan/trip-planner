// Mock transport model. Prices and times derive from distance, so every
// origin and city pair has a plausible answer without a huge table.
import type { City, Country, Origin, Tier } from './catalog'

export type Mode = 'flight' | 'train' | 'bus' | 'car' | 'transfer'

export interface Leg {
  mode: Mode
  from: string
  to: string
  label: string
  depart: string // HH:MM
  hours: number
  pricePerPerson: number
  note?: string
}

export function km(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

// Stable pseudo-random from a string, so the same input gives the same plan.
export function hash(str: string) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619)
  return (h >>> 0) / 4294967295
}

function clock(seed: string, from = 6, to = 18) {
  const mins = Math.floor(hash(seed) * (to - from) * 4) * 15 + from * 60
  return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`
}

const PEAK = [7, 8, 12]
const FLIGHT_CLASS = ['Economy', 'Economy plus bag', 'Premium economy']
const FLIGHT_MULT = [1, 1.25, 2.4]

export function flight(
  from: { name: string; airport: string; lat: number; lon: number; major?: boolean },
  to: { name: string; airport: string; lat: number; lon: number; major?: boolean },
  month: number,
  tier: Tier,
  seed: string,
): Leg {
  const d = km(from, to)
  const direct = (from.major || to.major) && d < 6000 || (from.major && to.major && d < 11000)
  let price = Math.max(70, 55 + d * 0.105)
  if (PEAK.includes(month)) price *= 1.3
  if (!direct) price *= 0.9
  price *= FLIGHT_MULT[tier]
  const hours = d / 760 + 0.6 + (direct ? 0 : 2.5)
  return {
    mode: 'flight',
    from: from.name,
    to: to.name,
    label: `Flight ${from.airport} → ${to.airport}`,
    depart: clock(seed + from.airport + to.airport),
    hours: round1(hours),
    pricePerPerson: Math.round(price),
    note: `${FLIGHT_CLASS[tier]} · ${direct ? 'direct' : '1 stop'}`,
  }
}

export function ground(a: City, b: City, country: Country, tier: Tier, seed: string): Leg {
  const road = km(a, b) * 1.25
  const depart = clock(seed + a.id + b.id, 8, 12)
  if (road > 750 || a.island || b.island) {
    if (a.airport && b.airport) {
      return flight({ ...a, airport: a.airport }, { ...b, airport: b.airport }, 0, tier, seed)
    }
  }
  if (country.rail) {
    const fast = country.id === 'japan' ? 'Shinkansen' : 'High-speed train'
    const cls = ['2nd class', '2nd class, reserved', '1st class'][tier]
    return {
      mode: 'train', from: a.name, to: b.name, label: `${fast} ${a.name} → ${b.name}`, depart,
      hours: round1(road / 190 + 0.4),
      pricePerPerson: Math.round((10 + road * 0.15) * [1, 1.3, 1.9][tier]),
      note: cls,
    }
  }
  if (tier === 2) {
    return {
      mode: 'car', from: a.name, to: b.name, label: `Private driver ${a.name} → ${b.name}`, depart,
      hours: round1(road / 75), pricePerPerson: Math.round(40 + road * 0.55), note: 'Private car, price per group of up to 3',
    }
  }
  const label = country.id === 'georgia' ? 'Shared minibus (marshrutka)' : 'Intercity bus'
  return {
    mode: 'bus', from: a.name, to: b.name, label: `${label} ${a.name} → ${b.name}`, depart,
    hours: round1(road / 60 + 0.3), pricePerPerson: Math.round((5 + road * 0.06) * (tier === 1 ? 1.4 : 1)),
    note: tier === 1 ? 'Reserved seat' : 'Standard seat',
  }
}

export function transfer(city: string, airport: string, toAirport: boolean, tier: Tier): Leg {
  const opts = [
    { label: 'Airport train or bus', price: 8, hours: 1 },
    { label: 'Taxi', price: 20, hours: 0.7 },
    { label: 'Private chauffeur', price: 40, hours: 0.6 },
  ][tier]
  return {
    mode: 'transfer',
    from: toAirport ? city : airport,
    to: toAirport ? airport : city,
    label: `${opts.label} ${toAirport ? `to ${airport}` : `from ${airport}`}`,
    depart: '',
    hours: opts.hours,
    pricePerPerson: opts.price,
  }
}

const round1 = (n: number) => Math.round(n * 10) / 10
export type { Origin }
