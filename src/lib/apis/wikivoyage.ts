// Wikivoyage: short city intros, no key. Text is CC BY-SA 4.0, so the page credits it.
// Wikimedia asks browser clients to name themselves with the Api-User-Agent header.
import { CLIENT_NAME, getJson } from './http'

export interface CityGuide {
  title: string
  intro: string
  url: string
  qid: string | null
}

// Catalog names that differ from the Wikivoyage article title.
const TITLE: Record<string, string> = {}

interface MwPage { title: string; missing?: boolean; extract?: string; pageprops?: { wikibase_item?: string } }
interface MwBody {
  query?: {
    normalized?: { from: string; to: string }[]
    redirects?: { from: string; to: string }[]
    pages?: MwPage[]
  }
}

function trimIntro(text: string, max = 320) {
  // Skip stray template fragments (for example a lone "²") before the real first paragraph.
  const first = text.split('\n').map((p) => p.trim()).find((p) => p.length >= 40) ?? ''
  if (first.length <= max) return first.trim()
  const cut = first.slice(0, max)
  const stop = cut.lastIndexOf('. ')
  return (stop > 120 ? cut.slice(0, stop + 1) : cut.replace(/\s+\S*$/, '') + '...').trim()
}

/** Guides keyed by the catalog city name. Missing cities are left out. */
export async function getCityGuides(names: string[]): Promise<Record<string, CityGuide>> {
  const wanted = [...new Set(names)].sort()
  if (!wanted.length) return {}
  const titles = wanted.map((n) => TITLE[n] ?? n)
  const url = 'https://en.wikivoyage.org/w/api.php?' + new URLSearchParams({
    action: 'query', format: 'json', formatversion: '2', origin: '*', redirects: '1',
    prop: 'extracts|pageprops', ppprop: 'wikibase_item', exintro: '1', explaintext: '1', exsentences: '3',
    titles: titles.join('|'),
  })
  try {
    const body = await getJson<MwBody>(url, { timeoutMs: 6000, headers: { 'Api-User-Agent': CLIENT_NAME } })
    const q = body?.query
    if (!q?.pages) return {}
    const follow = (t: string) => {
      let x = t
      for (const m of [...(q.normalized ?? []), ...(q.redirects ?? [])]) if (m.from === x) x = m.to
      return x
    }
    const out: Record<string, CityGuide> = {}
    wanted.forEach((name, i) => {
      const final = follow(titles[i])
      const page = q.pages!.find((p) => p.title === final)
      const intro = page && !page.missing && page.extract ? trimIntro(page.extract) : ''
      if (!page || !intro) return
      out[name] = {
        title: page.title,
        intro,
        url: 'https://en.wikivoyage.org/wiki/' + encodeURIComponent(page.title.replace(/ /g, '_')),
        qid: page.pageprops?.wikibase_item ?? null,
      }
    })
    return out
  } catch {
    return {}
  }
}
