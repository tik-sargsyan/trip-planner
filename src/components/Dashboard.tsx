import { useMemo, useState } from 'react'
import { ACTIVITY_LABEL, countryById, originById, type Tier } from '../data/catalog'
import { buildPlan, type TripInput } from '../engine/plan'
import { niceDate, usd } from '../format'
import RouteTimeline from './RouteTimeline'
import Itinerary from './Itinerary'
import ShareBar from './ShareBar'

export default function Dashboard({ input, tier, onTier, onEdit }: {
  input: TripInput; tier: Tier; onTier: (t: Tier) => void; onEdit: () => void
}) {
  const plan = useMemo(() => buildPlan(input), [input])
  const [sel, setSel] = useState<Tier>(tier >= 0 && tier <= 2 ? tier : plan.recommended)
  const t = plan.tiers[sel]
  const origin = originById(input.origin)
  const country = countryById(input.country)
  const pick = (x: Tier) => { setSel(x); onTier(x) }

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
          <p className="sub">{niceDate(input.start)} to {niceDate(input.end)} · budget {usd(input.budget)} · {input.activities.map((a) => ACTIVITY_LABEL[a]).join(', ') || 'any activity'}</p>
        </div>
        <ShareBar input={input} tier={sel} onEdit={onEdit} />
      </section>

      <section className="tiers" aria-label="Plan options">
        {plan.tiers.map((p) => (
          <button key={p.tier} className={'card tier' + (p.tier === sel ? ' sel' : '')} onClick={() => pick(p.tier)} aria-pressed={p.tier === sel}>
            <div className="tier-head">
              <h3>{p.name}</h3>
              {p.tier === plan.recommended && <span className="badge">Best pick</span>}
            </div>
            <div className="total">{usd(p.cost.total)}</div>
            <div className="pp">{usd(p.perPerson)} per person</div>
            <div className={'fit ' + (p.fits ? 'ok' : 'over')}>
              {p.fits ? `${usd(p.delta)} under budget` : `Over budget by ${usd(-p.delta)}`}
            </div>
            <dl className="mini">
              <div><dt>Transport</dt><dd>{usd(p.cost.transport)}</dd></div>
              <div><dt>Stay</dt><dd>{usd(p.cost.stay)}</dd></div>
              <div><dt>Food</dt><dd>{usd(p.cost.food)}</dd></div>
              <div><dt>Activities</dt><dd>{usd(p.cost.activities)}</dd></div>
            </dl>
          </button>
        ))}
      </section>

      {!plan.tiers.some((p) => p.fits) && (
        <p className="card warn">No option fits {usd(input.budget)}. Try fewer nights, fewer travellers, or a closer country. The Budget option is the cheapest we found.</p>
      )}

      <section className="card">
        <h2>Why these cities</h2>
        <div className="stops">
          {t.stops.map((s) => (
            <div key={s.city.id} className="stop">
              <div className="stop-head"><strong>{s.city.name}</strong><span>{s.nights} {s.nights === 1 ? 'night' : 'nights'}</span></div>
              <p>{s.city.blurb}</p>
              <ul>{s.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
            </div>
          ))}
        </div>
      </section>

      <div className="cols">
        <section className="card"><h2>How you get there</h2><RouteTimeline legs={t.legs} /></section>
        <section className="card"><h2>Day by day</h2><Itinerary days={t.days} /></section>
      </div>
    </div>
  )
}
