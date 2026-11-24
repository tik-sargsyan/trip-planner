import { useMemo, useState } from 'react'
import { ACTIVITY_LABEL, countryById, originById, type Tier } from '../data/catalog'
import { buildPlan, type TripInput } from '../engine/plan'
import { niceDate } from '../format'
import RouteTimeline from './RouteTimeline'
import Itinerary from './Itinerary'
import ShareBar from './ShareBar'
import RouteMap, { type MapPoint } from './RouteMap'
import Sources from './Sources'
import { CURRENCIES, formatMoney, type Currency } from '../lib/apis/frankfurter'
import { type Status, useCityGuides, useCitySights, useHolidays, usePriceLevel, useRates } from '../lib/apis/hooks'

export default function Dashboard({ input, tier, onTier, onEdit }: {
  input: TripInput; tier: Tier; onTier: (t: Tier) => void; onEdit: () => void
}) {
  const rates = useRates()
  const price = usePriceLevel(input.country)
  const holidays = useHolidays(input.country, input.start, input.end)
  const [cur, setCur] = useState<Currency>('USD')
  const [mapStatus, setMapStatus] = useState<Status>('loading')
  const fmt = (n: number) => formatMoney(n, cur, rates.data)
  const plan = useMemo(() => buildPlan(input, { costFactor: price.factor }), [input, price.factor])
  const [sel, setSel] = useState<Tier>(tier >= 0 && tier <= 2 ? tier : plan.recommended)
  const t = plan.tiers[sel]
  const origin = originById(input.origin)
  const country = countryById(input.country)
  const pick = (x: Tier) => { setSel(x); onTier(x) }
  const guides = useCityGuides(t.stops.map((s) => s.city.name))
  const sights = useCitySights(t.stops.map((s) => s.city))
  const notes = useMemo(() => {
    const out: Record<string, string[]> = {}
    for (const h of holidays.data.list) (out[h.date] ??= []).push(`Public holiday: ${h.name}. Some sites and shops may close or change hours.`)
    return out
  }, [holidays.data])
  const sameCountry = origin.country === country.id
  const points: MapPoint[] = [
    { name: origin.name, lat: origin.lat, lon: origin.lon, home: true },
    ...t.stops.map((s) => ({ name: s.city.name, lat: s.city.lat, lon: s.city.lon })),
    { name: origin.name, lat: origin.lat, lon: origin.lon, home: true },
  ]

  return (
    <div className="dash">
      <section className="card hero">
        <div>
          <p className="eyebrow">{country.flag} {country.name} · {plan.nights} nights · {input.people} {input.people === 1 ? 'traveller' : 'travellers'}</p>
          <h1 className="route">
            {[origin.name, ...t.stops.map((s) => s.city.name), origin.name].map((n, i, a) => (
              <span key={i}>{n}{i < a.length - 1 && <span className="arrow">→</span>}</span>
            ))}
          </h1>
          <p className="sub">{niceDate(input.start)} to {niceDate(input.end)} · budget {fmt(input.budget)} · {input.activities.map((a) => ACTIVITY_LABEL[a]).join(', ') || 'any activity'}</p>
        </div>
        <ShareBar input={input} tier={sel} onEdit={onEdit} />
      </section>

      <div className="money-bar">
        <div className="seg" role="group" aria-label="Currency">
          {CURRENCIES.map((c) => (
            <button key={c} className={c === cur ? 'on' : ''} aria-pressed={c === cur} onClick={() => setCur(c)}>{c}</button>
          ))}
        </div>
        <p className="muted small">
          {cur !== 'USD' && <>1 USD = {rates.data.rates[cur].toLocaleString('en-US', { maximumFractionDigits: 2 })} {cur}{rates.data.date ? ` on ${rates.data.date}` : ' (estimate)'}. </>}
          {price.status === 'live' && price.factor !== 1 && <>Stay and food adjusted by {Math.round((price.factor - 1) * 100) > 0 ? '+' : ''}{Math.round((price.factor - 1) * 100)}% to match {country.name} price levels. </>}
        </p>
      </div>

      <section className={'tiers' + (cur === 'AMD' ? ' wide' : '')} aria-label="Plan options">
        {plan.tiers.map((p) => (
          <button key={p.tier} className={'card tier' + (p.tier === sel ? ' sel' : '')} onClick={() => pick(p.tier)} aria-pressed={p.tier === sel}>
            <div className="tier-head">
              <h3>{p.name}</h3>
              {p.tier === plan.recommended && <span className="badge">Best pick</span>}
            </div>
            <div className="total">{fmt(p.cost.total)}</div>
            <div className="pp">{fmt(p.perPerson)} per person</div>
            <div className={'fit ' + (p.fits ? 'ok' : 'over')}>
              {p.fits ? `${fmt(p.delta)} under budget` : `Over budget by ${fmt(-p.delta)}`}
            </div>
            <dl className="mini">
              <div><dt>Transport</dt><dd>{fmt(p.cost.transport)}</dd></div>
              <div><dt>Stay</dt><dd>{fmt(p.cost.stay)}</dd></div>
              <div><dt>Food</dt><dd>{fmt(p.cost.food)}</dd></div>
              <div><dt>Activities</dt><dd>{fmt(p.cost.activities)}</dd></div>
            </dl>
          </button>
        ))}
      </section>

      {!plan.tiers.some((p) => p.fits) && (
        <p className="card warn">No option fits {fmt(input.budget)}. Try fewer nights, fewer travellers, or a closer country. The Budget option is the cheapest we found.</p>
      )}

      <section className="card">
        <h2>Why these cities</h2>
        <div className="stops">
          {t.stops.map((s) => (
            <div key={s.city.id} className="stop">
              <div className="stop-head"><strong>{s.city.name}</strong><span>{s.nights} {s.nights === 1 ? 'night' : 'nights'}</span></div>
              <p>{guides.data[s.city.name]?.intro ?? s.city.blurb}</p>
              {guides.data[s.city.name] && (
                <p className="credit">From <a href={guides.data[s.city.name].url} target="_blank" rel="noreferrer">Wikivoyage</a>, <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0</a></p>
              )}
              <ul>{s.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
              {!!sights.data[s.city.id]?.length && (
                <p className="more-sights">Also nearby: {sights.data[s.city.id].map((x, i) => (
                  <span key={x.url}>{i > 0 && ', '}<a href={x.url} target="_blank" rel="noreferrer">{x.name}</a></span>
                ))}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Route map</h2>
        <RouteMap points={points} flightEnds={!sameCountry} onStatus={setMapStatus} />
      </section>

      <div className="cols">
        <section className="card"><h2>How you get there</h2><RouteTimeline legs={t.legs} fmt={fmt} /></section>
        <section className="card">
          <h2>Day by day</h2>
          {holidays.data.list.length > 0 && <p className="muted small">{holidays.data.list.length} public {holidays.data.list.length === 1 ? 'holiday falls' : 'holidays fall'} in your dates. See the marked days.</p>}
          <Itinerary days={t.days} fmt={fmt} notes={notes} />
        </section>
      </div>

      <Sources rows={[
        { name: 'Frankfurter', href: 'https://frankfurter.dev', use: 'currency rates.', status: rates.status },
        { name: 'World Bank', href: 'https://data.worldbank.org/indicator/PA.NUS.PPP', use: `country price level${price.status === 'live' ? ` (${country.name} ${price.data.level.toFixed(2)} of US prices, ${price.data.year})` : ''}, used to scale stay and food.`, status: price.status, license: { label: 'CC BY 4.0', href: 'https://datacatalog.worldbank.org/public-licenses#cc-by' } },
        { name: 'Nager.Date', href: 'https://date.nager.at', use: holidays.data.covered ? 'public holidays.' : `public holidays. ${country.name} is not covered yet.`, status: holidays.data.covered ? holidays.status : 'fallback' },
        { name: 'Wikivoyage', href: 'https://en.wikivoyage.org', use: 'city intros.', status: guides.status, license: { label: 'CC BY-SA 4.0', href: 'https://creativecommons.org/licenses/by-sa/4.0/' } },
        { name: 'Wikidata', href: 'https://www.wikidata.org', use: 'extra sights near each city.', status: sights.status, license: { label: 'CC0', href: 'https://creativecommons.org/publicdomain/zero/1.0/' } },
        { name: 'OpenFreeMap', href: 'https://openfreemap.org', use: 'map tiles, with OpenStreetMap data and MapLibre GL.', status: mapStatus, license: { label: 'ODbL (OpenStreetMap contributors)', href: 'https://www.openstreetmap.org/copyright' } },
      ]} />
    </div>
  )
}
