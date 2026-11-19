import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'
import type { TripInput } from './plan'
import type { Tier } from '../data/catalog'

interface Packed { v: 1; i: TripInput; t: Tier }

export function encodePlan(input: TripInput, tier: Tier) {
  return compressToEncodedURIComponent(JSON.stringify({ v: 1, i: input, t: tier } satisfies Packed))
}

export function decodePlan(q: string): { input: TripInput; tier: Tier } | null {
  try {
    const p = JSON.parse(decompressFromEncodedURIComponent(q) ?? '') as Packed
    if (p?.v !== 1 || !p.i?.origin) return null
    return { input: p.i, tier: p.t }
  } catch {
    return null
  }
}

export function shareUrl(input: TripInput, tier: Tier) {
  const base = window.location.href.split('#')[0]
  return `${base}#/plan?q=${encodePlan(input, tier)}`
}
