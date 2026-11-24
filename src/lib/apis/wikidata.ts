// Wikidata: extra sights near a city, no key. Data is CC0.
// One SPARQL query per city, run one at a time, because the query service rate-limits bursts.
import { CLIENT_NAME, getJson, serialQueue } from './http'

export interface Sight { name: string; url: string; links: number }

// Item types that make good sights: museums, churches, temples, castles, palaces, parks,
// squares, monuments, bridges, towers, skyscrapers, mosques, archaeological sites and similar.
const TYPES = [
  'Q33506', 'Q207694', 'Q16970', 'Q2977', 'Q163687', 'Q23413', 'Q16560', 'Q22698', 'Q174782', 'Q4989906',
  'Q839954', 'Q570116', 'Q44539', 'Q483453', 'Q12280', 'Q12518', 'Q1107656', 'Q44613', 'Q1081138', 'Q35509',
  'Q12570', 'Q811979', 'Q1060829', 'Q57821', 'Q24398318', 'Q1370598', 'Q842402', 'Q53060', 'Q5393308',
  'Q845945', 'Q697295', 'Q1030034', 'Q860861', 'Q11303', 'Q32815',
].map((q) => 'wd:' + q).join(' ')

const query = (lat: number, lon: number, km: number) => `
SELECT ?item ?itemLabel ?links WHERE {
  SERVICE wikibase:around { ?item wdt:P625 ?loc . bd:serviceParam wikibase:center "Point(${lon} ${lat})"^^geo:wktLiteral ; wikibase:radius "${km}" . }
  ?item wikibase:sitelinks ?links . FILTER(?links >= 15)
  ?item wdt:P31 ?type . VALUES ?type { ${TYPES} }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} ORDER BY DESC(?links) LIMIT 12`

interface SparqlBody { results: { bindings: { item: { value: string }; itemLabel?: { value: string }; links: { value: string } }[] } }

const queue = serialQueue()

/** Up to `max` well-known sights within `km` of a point, skipping names in `skip`. */
export async function getSights(lat: number, lon: number, opts: { km?: number; max?: number; skip?: string[] } = {}): Promise<Sight[]> {
  const { km = 4, max = 4, skip = [] } = opts
  const url = 'https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(query(+lat.toFixed(4), +lon.toFixed(4), km))
  try {
    const body = await queue(() => getJson<SparqlBody>(url, { timeoutMs: 8000, retries: 1, headers: { 'Api-User-Agent': CLIENT_NAME, Accept: 'application/sparql-results+json' } }))
    const low = skip.map((s) => s.toLowerCase())
    const seen = new Set<string>()
    const out: Sight[] = []
    for (const b of body?.results.bindings ?? []) {
      const name = b.itemLabel?.value ?? ''
      const key = name.toLowerCase()
      if (!name || /^Q\d+$/.test(name) || seen.has(key)) continue
      if (low.some((s) => s.includes(key) || key.includes(s))) continue
      seen.add(key)
      out.push({ name, url: b.item.value.replace('http://', 'https://'), links: Number(b.links.value) })
      if (out.length >= max) break
    }
    return out
  } catch {
    return []
  }
}
