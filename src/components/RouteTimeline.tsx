import type { Leg } from '../data/transport'
import { MODE_ICON, hrs, usd } from '../format'

export default function RouteTimeline({ legs, fmt = usd }: { legs: { leg: Leg; cost: number }[]; fmt?: (n: number) => string }) {
  const total = legs.reduce((a, l) => a + l.cost, 0)
  return (
    <>
      <ol className="timeline">
        {legs.map(({ leg, cost }, i) => (
          <li key={i} className={'leg ' + leg.mode}>
            <span className="dot" aria-hidden>{MODE_ICON[leg.mode]}</span>
            <div className="leg-body">
              <div className="leg-title">{leg.label}</div>
              <div className="leg-meta">
                {leg.depart && <span>Departs {leg.depart}</span>}
                <span>{hrs(leg.hours)}</span>
                {leg.note && <span>{leg.note}</span>}
              </div>
            </div>
            <div className="leg-cost">{fmt(cost)}</div>
          </li>
        ))}
      </ol>
      <div className="sumline"><span>All transport</span><strong>{fmt(total)}</strong></div>
    </>
  )
}
