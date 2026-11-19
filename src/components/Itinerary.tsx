import type { Day } from '../engine/plan'
import { MODE_ICON, hrs, niceDate, usd } from '../format'

export default function Itinerary({ days }: { days: Day[] }) {
  return (
    <div className="days">
      {days.map((d) => (
        <article key={d.n} className="day">
          <header>
            <span className="daynum">Day {d.n}</span>
            <span className="daydate">{niceDate(d.date)}</span>
          </header>
          <h3>{d.title}</h3>
          <ul>
            {d.items.map((it, i) => it.kind === 'leg' ? (
              <li key={i} className="it leg-it"><span>{MODE_ICON[it.leg.mode]} {it.leg.label}</span><span className="muted">{hrs(it.leg.hours)}</span></li>
            ) : (
              <li key={i} className={'it' + (it.match ? ' match' : '')}>
                <span>{it.site.name}</span>
                <span className="muted">{hrs(it.site.hours)} · {it.cost ? usd(it.cost) : 'free'}</span>
              </li>
            ))}
            {d.freeHours >= 2 && <li className="it free"><span>Free time in {d.city}</span><span className="muted">{hrs(d.freeHours)}</span></li>}
          </ul>
        </article>
      ))}
    </div>
  )
}
